from fastapi import APIRouter, HTTPException, Body, Query
from app.core.database import get_db_pool
from typing import List, Dict, Any, Optional

router = APIRouter()

# Helper to map grade strings to teaching table columns
GRADE_COLUMN_MAP = {
    "Grade 1": "grade_1", "Grade 2": "grade_2", "Grade 3": "grade_3",
    "Grade 4": "grade_4", "Grade 5": "grade_5", "Grade 6": "grade_6",
    "Grade 7": "grade_7", "Grade 8": "grade_8", "Grade 9": "grade_9",
    "Grade 10": "grade_10", "Grade 11": "grade_11", "Grade 12": "grade_12",
    "SAT": "sat", "NEET": "neet", "CET": "cet", "JEE Mains": "jee_mains", "JEE Adv": "jee_adv"
}

@router.get("/")
async def get_all_teachers():
    """
    Get all teachers with their stats (assigned grades count, student count).
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Fetch teachers with basic info
        # We need to join with users to get name/email/phone
        # And aggregate mentorships/grades
        
        # 1. Basic Teacher Info
        teachers = await conn.fetch("""
            SELECT t.teacher_id, t.school, t.subject, u.user_id, u.firebase_uid, u.name, u.role, u.created_at,
                   t.email_id as teacher_email, t.phone_number as teacher_phone
            FROM teachers t
            JOIN users u ON t.user_id = u.user_id
        """)
        
        results = []
        for t in teachers:
            t_id = t['teacher_id']
            
            # 2. Get Student Count
            student_count = await conn.fetchval("""
                SELECT COUNT(*) FROM mentorship WHERE mentor_id = $1
            """, t_id)
            
            # 3. Get Assigned Grades (from teaching table)
            teaching_profile = await conn.fetchrow("SELECT * FROM teaching WHERE teacher_id = $1", t_id)
            assigned_grades = []
            if teaching_profile:
                for grade_str, col_name in GRADE_COLUMN_MAP.items():
                    if teaching_profile.get(col_name):
                        assigned_grades.append(grade_str)
            
            # 4. Get ticket code (username from credentials) - optional but used in frontend
            # Assuming username in credentials is the ticket code
            ticket_code = await conn.fetchval("""
                SELECT username FROM credentials WHERE user_id = $1
            """, t['user_id'])
            
            results.append({
                "uid": t['firebase_uid'] or str(t['user_id']), # Use firebase_uid as key
                "name": t['name'],
                "email": t['teacher_email'],
                "phoneNumber": t['teacher_phone'],
                "schoolName": t['school'],
                "ticketCode": ticket_code or "N/A",
                "totalStudents": student_count,
                "assignedGradesCount": len(assigned_grades),
                "assignedGrades": assigned_grades,
                "createdAt": t['created_at'].isoformat() if t['created_at'] else None
            })
            
        return results

@router.get("/{uid}")
async def get_teacher_details(uid: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        teacher = await conn.fetchrow("""
             SELECT t.teacher_id, t.school, t.email_id, t.phone_number, u.user_id, u.name, u.created_at
             FROM teachers t
             JOIN users u ON t.user_id = u.user_id
             WHERE u.firebase_uid = $1
        """, uid)
        
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
            
        t_id = teacher['teacher_id']
        
        # Get teaching profile
        teaching_profile = await conn.fetchrow("SELECT * FROM teaching WHERE teacher_id = $1", t_id)
        assigned_grades = []
        neet_enabled = False
        if teaching_profile:
             # Check if neet upload is enabled? maybe strictly boolean column or permission?
             # For now using 'neet' boolean in teaching as 'assigned to teach NEET'
             # Frontend had 'neetUploadEnabled' separately. We can repurpose or add to RBAC.
             # Let's assume teaching 'neet' means they can access NEET stuff.
             if teaching_profile.get('neet'): neet_enabled = True
             
             for grade_str, col_name in GRADE_COLUMN_MAP.items():
                if teaching_profile.get(col_name):
                    assigned_grades.append(grade_str)

        # Get assigned students details
        students_rows = await conn.fetch("""
            SELECT s.student_id, s.grade, s.parent_name, u.firebase_uid, m.created_at as assigned_at
            FROM students s
            JOIN mentorship m ON s.student_id = m.mentee_id
            JOIN users u ON s.user_id = u.user_id
            WHERE m.mentor_id = $1
        """, t_id)
        
        students_map = {}
        for s in students_rows:
            # Structure similar to Firebase for minimal frontend change
            students_map[s['firebase_uid']] = {
                 "childId": str(s['student_id']),
                 "grade": s['grade'],
                 "name": s['parent_name'], # Using parent name usually student name placeholder
                 "assignedAt": s['assigned_at'].isoformat() if s['assigned_at'] else None
            }
            
        return {
            "uid": uid,
            "name": teacher['name'],
            "email": teacher['email_id'],
            "schoolName": teacher['school'],
            "assignments": {
                "assignedGrades": assigned_grades,
                "students": students_map
            },
            "neetUploadEnabled": neet_enabled
        }

@router.post("/{uid}/grades")
async def assign_grades(uid: str, payload: Dict[str, Any] = Body(...)):
    """
    Assign grades to a teacher.
    Payload: { "grades": ["Grade 1", "NEET"], "adminUid": "..." }
    """
    grades = payload.get("grades", [])
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        teacher = await conn.fetchrow("""
            SELECT t.teacher_id FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
        
        if not teacher:
             raise HTTPException(status_code=404, detail="Teacher not found")
        
        t_id = teacher['teacher_id']
        
        # Upsert into teaching table
        # 1. Reset all columns to false first? Or just update? 
        # Reset safe approach:
        # Construct update query dynamic?
        
        # First ensure record exists
        await conn.execute("""
            INSERT INTO teaching (teacher_id) VALUES ($1) ON CONFLICT DO NOTHING
        """, t_id)
        
        # Build update
        update_cols = []
        # specific logic: set passed grades to TRUE, others to FALSE?
        # Typically "Assign Grades" means these are the ONLY grades.
        
        # Reset all mapped columns to False first
        reset_stmt = ", ".join([f"{col} = FALSE" for col in GRADE_COLUMN_MAP.values()])
        await conn.execute(f"UPDATE teaching SET {reset_stmt} WHERE teacher_id = $1", t_id)
        
        # Return if empty
        if not grades:
            return {"success": True}

        # Set specific columns to True
        cols_to_set = []
        for g in grades:
            if g in GRADE_COLUMN_MAP:
                cols_to_set.append(GRADE_COLUMN_MAP[g])
        
        if cols_to_set:
            set_stmt = ", ".join([f"{col} = TRUE" for col in cols_to_set])
            await conn.execute(f"UPDATE teaching SET {set_stmt} WHERE teacher_id = $1", t_id)
            
    return {"success": True}

@router.post("/{uid}/students")
async def assign_students(uid: str, payload: Dict[str, Any] = Body(...)):
    """
    Assign students to a teacher.
    Payload: { "students": [{ "uid": "...", "childId": "...", "grade": "..." }], "adminUid": "..." }
    """
    students_list = payload.get("students", [])
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        teacher = await conn.fetchrow("""
            SELECT t.teacher_id FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
        
        if not teacher:
             raise HTTPException(status_code=404, detail="Teacher not found")
        t_id = teacher['teacher_id']
        
        for s in students_list:
            child_id = s.get('childId')
            # If childId is provided and numeric, use it. 
            # If not (e.g. 'default' for legacy), try to lookup student by user_id(uid)
            
            student_db_id = None
            if child_id and child_id != 'default' and child_id.isdigit():
                student_db_id = int(child_id)
            else:
                 # Lookup student by user firebase UID
                 # Assuming single student per user for legacy
                 student_row = await conn.fetchrow("""
                    SELECT s.student_id FROM students s
                    JOIN users u ON s.user_id = u.user_id
                    WHERE u.firebase_uid = $1
                    LIMIT 1
                 """, s.get('uid'))
                 if student_row:
                     student_db_id = student_row['student_id']
            
            if student_db_id:
                # Insert into mentorship
                await conn.execute("""
                    INSERT INTO mentorship (mentor_id, mentee_id) VALUES ($1, $2)
                """, t_id, student_db_id)
                # Also update students table mentor_id for consistency
                await conn.execute("UPDATE students SET mentor_id = $1 WHERE student_id = $2", t_id, student_db_id)

    return {"success": True}

@router.delete("/{uid}/grades/{grade}")
async def remove_grade(uid: str, grade: str):
    # Simply set that grade col to false
    col_name = GRADE_COLUMN_MAP.get(grade)
    if not col_name:
         return {"success": False, "message": "Invalid grade"}

    pool = await get_db_pool()
    async with pool.acquire() as conn:
         teacher = await conn.fetchrow("""
            SELECT t.teacher_id FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
         if teacher:
             t_id = teacher['teacher_id']
             await conn.execute(f"UPDATE teaching SET {col_name} = FALSE WHERE teacher_id = $1", t_id)
             
    return {"success": True}

@router.delete("/{uid}/students/{student_uid}")
async def remove_student(uid: str, student_uid: str):
    # Remove from mentorship
    pool = await get_db_pool()
    async with pool.acquire() as conn:
         teacher_row = await conn.fetchrow("""
            SELECT t.teacher_id FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
         
         student_row = await conn.fetchrow("""
            SELECT s.student_id FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE u.firebase_uid = $1
            LIMIT 1
         """, student_uid)
         
         if teacher_row and student_row:
             t_id = teacher_row['teacher_id']
             s_id = student_row['student_id']
             
             await conn.execute("DELETE FROM mentorship WHERE mentor_id = $1 AND mentee_id = $2", t_id, s_id)
             # Unset in students table too if it matches
             await conn.execute("UPDATE students SET mentor_id = NULL WHERE student_id = $1 AND mentor_id = $2", s_id, t_id)

    return {"success": True}

@router.get("/students/available")
async def get_available_students(grade: str):
    """
    Get all students for a specific grade (for assignment selection).
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
             SELECT s.student_id, s.grade, s.parent_name, s.school, s.email_id, s.phone_number, u.firebase_uid
             FROM students s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.grade = $1
        """, grade)
        
        students = []
        for r in rows:
            students.append({
                "uid": r['firebase_uid'],
                "childId": str(r['student_id']),
                "name": r['parent_name'],
                "grade": r['grade'],
                "schoolName": r['school'],
                "email": r['email_id'],
                "phoneNumber": r['phone_number']
            })
            
        return students

@router.post("/{uid}/reset")
async def reset_teacher(uid: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        teacher = await conn.fetchrow("""
            SELECT t.teacher_id FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
        
        if teacher:
             t_id = teacher['teacher_id']
             # Clear mentorships
             await conn.execute("DELETE FROM mentorship WHERE mentor_id = $1", t_id)
             # Clear teaching grades (set all to false)
             reset_stmt = ", ".join([f"{col} = FALSE" for col in GRADE_COLUMN_MAP.values()])
             await conn.execute(f"UPDATE teaching SET {reset_stmt} WHERE teacher_id = $1", t_id)
             # Clear students table references
             await conn.execute("UPDATE students SET mentor_id = NULL WHERE mentor_id = $1", t_id)
             
    return {"success": True}

@router.put("/{uid}/permissions")
async def update_permissions(uid: str, permissions: Dict[str, Any] = Body(...)):
    """
    Update teacher permissions (e.g., NEET Upload).
    Payload: { "neetUploadEnabled": true, "adminUid": "..." }
    """
    neet_enabled = permissions.get("neetUploadEnabled", False)
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        teacher = await conn.fetchrow("""
            SELECT t.teacher_id FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
        
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
            
        t_id = teacher['teacher_id']
        
        # Ensure teaching record exists
        await conn.execute("""
            INSERT INTO teaching (teacher_id) VALUES ($1) ON CONFLICT DO NOTHING
        """, t_id)
        
        # Update NEET permission
        await conn.execute("UPDATE teaching SET neet = $1 WHERE teacher_id = $2", neet_enabled, t_id)
        
    return {"success": True}
