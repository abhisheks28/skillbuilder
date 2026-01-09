from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, Dict, Any, List
import json
from app.core.database import get_db_pool

router = APIRouter()

# -----------------------------------------------------------------------------
# TEACHER DASHBOARD
# -----------------------------------------------------------------------------

@router.get("/teacher/stats")
async def get_teacher_stats(uid: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get Teacher ID
        teacher = await conn.fetchrow("""
            SELECT t.teacher_id, t.school
            FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
        
        if not teacher:
             # Returning empty structure if not a teacher or teacher not found
            return {"assignedGrades": [], "studentCounts": {}}

        teacher_id = teacher['teacher_id']

        # Get Student Counts by Grade (via Mentorship or generic assignment)
        # Using mentorship table as primary source
        rows = await conn.fetch("""
            SELECT s.grade, COUNT(*) as count
            FROM students s
            JOIN mentorship m ON s.student_id = m.mentee_id
            WHERE m.mentor_id = $1
            GROUP BY s.grade
        """, teacher_id)

        student_counts = {r['grade']: r['count'] for r in rows if r['grade']}
        assigned_grades = list(student_counts.keys())
        assigned_grades.sort()

        return {
            "assignedGrades": assigned_grades,
            "studentCounts": student_counts
        }

@router.get("/teacher/students")
async def get_teacher_students(uid: str, grade: Optional[str] = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        teacher = await conn.fetchrow("""
            SELECT t.teacher_id
            FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.firebase_uid = $1
        """, uid)
        
        if not teacher:
            return []

        teacher_id = teacher['teacher_id']

        query = """
            SELECT s.*, u.created_at as assigned_at, u.firebase_uid, u.name as user_name
            FROM students s
            JOIN mentorship m ON s.student_id = m.mentee_id
            JOIN users u ON s.user_id = u.user_id
            WHERE m.mentor_id = $1
        """
        params = [teacher_id]

        if grade:
            query += " AND s.grade = $2"
            params.append(grade)
        
        query += " ORDER BY s.parent_name"

        rows = await conn.fetch(query, *params)
        
        # Transform for frontend
        students = []
        for r in rows:
            students.append({
                "uid": r['firebase_uid'], # Use firebase_uid for API lookups
                "childId": str(r['student_id']),
                "name": r['user_name'] or r['parent_name'], # Prefer user name, fallback to parent_name
                "grade": r['grade'],
                "email": r['email_id'],
                "school": r['school'],
                "assignedAt": r['assigned_at'].timestamp() * 1000 if r['assigned_at'] else 0
            })
        
        return students

@router.get("/teacher/student-detail")
async def get_teacher_student_detail(uid: str, studentUid: str, childId: str):
    """
    Get detailed student data for teacher view.
    - uid: Teacher's Firebase UID (for access verification)
    - studentUid: Student's Firebase UID
    - childId: Student's student_id from students table
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get the student info from students table using childId (student_id)
        student_row = await conn.fetchrow("""
            SELECT s.*, u.name as user_name, u.firebase_uid
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.student_id = $1
        """, int(childId))
        
        if not student_row:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_info = {
            "name": student_row['user_name'] or student_row['parent_name'],
            "grade": student_row['grade'],
            "email": student_row['email_id'],
            "school": student_row['school'],
            "phoneNumber": student_row['phone_number']
        }
        
        # Fetch reports for this student
        user_id = await conn.fetchval("SELECT user_id FROM students WHERE student_id = $1", int(childId))
        
        reports_raw = await conn.fetch("""
            SELECT report_id, report_json, created_at, category
            FROM reports
            WHERE user_id = $1
            ORDER BY created_at DESC
        """, user_id)
        
        # Process reports into the format expected by TeacherStudentView
        reports = {}
        for r in reports_raw:
            data = r['report_json']
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                except:
                    data = {}
            
            report_key = str(r['report_id'])
            reports[report_key] = {
                **data,
                "id": report_key,
                "timestamp": r['created_at'].isoformat(),
                "category": r['category']
            }
        
        return {
            "studentInfo": student_info,
            "reports": reports if reports else None
        }

# -----------------------------------------------------------------------------
# STUDENT DASHBOARD
# -----------------------------------------------------------------------------


@router.get("/student")
async def get_student_dashboard(uid: str):
    # Returns comprehensive data for the student dashboard
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user_row = await conn.fetchrow("SELECT user_id, role, name, email FROM users WHERE firebase_uid = $1", uid)
        if not user_row:
             raise HTTPException(status_code=404, detail="User not found")
        
        # Determine if parent or student (based on logic)
        # Assuming typical student flow
        
        # Reuse existing logic via API calls usually, but here filtering data
        return {"message": "Student dashboard data placeholder", "user": dict(user_row)}

# -----------------------------------------------------------------------------
# ADMIN DASHBOARD
# -----------------------------------------------------------------------------

@router.get("/admin/stats")
async def get_admin_stats():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        total_students = await conn.fetchval("SELECT COUNT(*) FROM students")
        total_reports = await conn.fetchval("SELECT COUNT(*) FROM reports")
        
        # Calculate Average Score (approximate for now, assuming reports have score field extractable or we scan)
        # Postgres JSONB allows extraction. assuming report_json->'summary'->>'accuracyPercent'
        avg_score_row = await conn.fetchrow("""
            SELECT AVG(CAST(report_json->'summary'->>'accuracyPercent' AS INTEGER)) as avg_score
            FROM reports 
            WHERE report_json->'summary'->>'accuracyPercent' IS NOT NULL
        """)
        avg_score = round(avg_score_row['avg_score']) if avg_score_row and avg_score_row['avg_score'] else 0
        
        # Perfect Scores
        perfect_scores = await conn.fetchval("""
            SELECT COUNT(*)
            FROM reports 
            WHERE CAST(report_json->'summary'->>'accuracyPercent' AS INTEGER) = 100
        """) or 0
        
        return {
            "totalStudents": total_students,
            "totalReports": total_reports,
            "totalPassed": f"{avg_score}%",
            "totalPerfectScores": perfect_scores
        }

@router.get("/admin/students")
async def get_admin_students(skip: int = 0, limit: int = 50):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Fetch students with some details
        # Using LEFT JOIN on parents to get fallback phone number and email, AND parent user_id
        rows = await conn.fetch("""
            SELECT s.*, u.created_at, u.firebase_uid, u.role, u.name as user_name, 
                   COALESCE(s.phone_number, p.phone_number) as resolved_phone,
                   p.email_id as parent_email,
                   p.user_id as parent_user_id,
                   sc.username as student_ticket,
                   pc.username as parent_ticket
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN parents p ON s.parent_id = p.parent_id
            LEFT JOIN credentials sc ON s.user_id = sc.user_id
            LEFT JOIN credentials pc ON p.user_id = pc.user_id
            ORDER BY u.created_at DESC
            OFFSET $1 LIMIT $2
        """, skip, limit)
        
        student_ids = [r['student_id'] for r in rows]
        student_ids_set = set(student_ids) # For fast lookup
        
        student_user_map = {}
        reports_map = {}
        rapid_map = {}
        count_map = {}
        student_history = {} # Added initialization

        if student_ids:
             # Get user_ids for these students to query reports DIRECTLY
            student_user_map_rows = await conn.fetch("SELECT student_id, user_id FROM students WHERE student_id = ANY($1::int[])", student_ids)
            student_user_map = {r['user_id']: r['student_id'] for r in student_user_map_rows}
            
            # Also get parent user_ids to query reports INDIRECTLY
            parent_user_ids = set()
            for r in rows:
                if r['parent_user_id']:
                    parent_user_ids.add(r['parent_user_id'])
            
            # Combine all relevant user IDs
            all_target_user_ids = list(set(student_user_map.keys()) | parent_user_ids)

            # Fetch all reports to process in Python for accurate counts and classification
            all_reports = await conn.fetch("""
                SELECT user_id, report_json, created_at, report_id,
                       COALESCE(report_json->>'type', 'standard') as report_type
                FROM reports
                WHERE user_id = ANY($1::int[])
                ORDER BY created_at DESC
            """, all_target_user_ids)

            for r in all_reports:
                sid = None
                
                # Check 1: Direct Link (User ID matches Student User ID)
                if r['user_id'] in student_user_map:
                    sid = student_user_map[r['user_id']]
                
                data = r['report_json']
                if isinstance(data, str):
                    try:
                        data = json.loads(data)
                    except:
                        data = {}
                
                # Check 2: Indirect Link (via childId in JSON, stored under Parent)
                if sid is None:
                    child_id = data.get('childId')
                    # Ensure integer comparison if child_id exists
                    if child_id is not None:
                        try:
                            child_id_int = int(child_id)
                            if child_id_int in student_ids_set:
                                sid = child_id_int
                        except:
                            pass
                
                # If still no SID, skip this report (it's a parent's personal report or unrelated)
                if sid is None:
                    continue

                # ... (rest of processing logic) ...
                
                rtype = r['report_type'].lower() if r['report_type'] else 'standard'
                summary = data.get('summary', {})
                is_rapid_content = 'totalTime' in summary
                
                # Check for explicit Standard types
                # Using 'assessment' because debug output showed it
                is_explicit_standard = rtype in ['standard', 'quiz', 'assessment']
                
                # Determine Types
                # Only use heuristic if NOT explicitly standard
                is_rapid = False
                if rtype in ['rapid_math', 'rapid', 'rapid_math']:
                     is_rapid = True
                elif not is_explicit_standard and is_rapid_content:
                     is_rapid = True
                
                # Initialize lists/counters
                if sid not in student_history: student_history[sid] = []
                if sid not in count_map: count_map[sid] = {'standard': 0, 'rapid': 0}
                
                hist_type = 'rapid' if is_rapid else 'standard'
                
                # Update Counts
                count_map[sid][hist_type] += 1
                
                # Update Latest Reports (First one encountered is latest due to DESC sort)
                if hist_type == 'standard' and sid not in reports_map:
                    reports_map[sid] = {
                        "marks": int(summary.get('accuracyPercent', 0)),
                        "date": r['created_at'].isoformat(),
                        "topicFeedback": data.get('topicFeedback', {}),
                        "learningPlan": data.get('learningPlan', []),
                        "perQuestionReport": data.get('perQuestionReport', []),
                        "summary": summary
                    }
                elif hist_type == 'rapid' and sid not in rapid_map:
                    rapid_map[sid] = {
                        "marks": int(summary.get('accuracyPercent', 0)),
                        "timeTaken": int(summary.get('totalTime', 0)),
                        "totalQuestions": int(summary.get('totalQuestions', 0)),
                        "date": r['created_at'].isoformat(),
                        "report": data 
                    }

                student_history[sid].append({
                    "type": hist_type,
                    "date": r['created_at'].isoformat(),
                    "marks": int(summary.get('accuracyPercent', 0)),
                    "totalQuestions": int(summary.get('totalQuestions', 0)),
                    "timeTaken": int(summary.get('totalTime', 0)) if 'totalTime' in summary else None,
                    "reportId": r.get('report_id'), 
                    "childId": str(sid),
                    "summary": summary,
                    "perQuestionReport": data.get('perQuestionReport', []),
                    "topicFeedback": data.get('topicFeedback', {}),
                    "learningPlan": data.get('learningPlan', []),
                    "rapidMath": {
                        "marks": int(summary.get('accuracyPercent', 0)),
                        "date": r['created_at'].isoformat(),
                        "timeTaken": int(summary.get('totalTime', 0)) if 'totalTime' in summary else 0,
                        "totalQuestions": int(summary.get('totalQuestions', 0)),
                        "report": data
                    } if hist_type == 'rapid' else None
                })

        # Get Credentials Map to determine Auth Provider
        # If user_id is in credentials table, they have Email/Pass. If not, they are Google/Phone only.
        # But we need to check specifically.
        user_ids_for_creds = [r['user_id'] for r in rows]
        
        creds_rows = await conn.fetch("SELECT user_id FROM credentials WHERE user_id = ANY($1::int[])", user_ids_for_creds)
        email_user_ids = set(r['user_id'] for r in creds_rows)
        
        students = []
        for r in rows:
            sid = r['student_id']
            # User ID calculation needs to handle potential missing user_id if logic was looser, but our query ensures it.
            uid_int = r['user_id']
            
            std_data = reports_map.get(sid, {})
            rapid_data = rapid_map.get(sid, {})
            hist = student_history.get(sid, [])
            
            # Sort history by date desc
            hist.sort(key=lambda x: x['date'], reverse=True)
            
            # Safe get counts
            counts = count_map.get(sid, {'standard': 0, 'rapid': 0})
            
            # Auth Provider Logic
            if uid_int in email_user_ids:
                auth_provider = 'Email'
            else:
                auth_provider = 'Google'
            
            # ID Selection Priority: 
            # 1. Student's Ticket (Direct)
            # 2. Parent's Ticket (Managed)
            # 3. Firebase UID (Google)
            # 4. Fallback User ID
            display_id = r['student_ticket'] or r['parent_ticket'] or r['firebase_uid'] or str(r['user_id'])

            students.append({
                "id": display_id,
                "name": r['user_name'] or r.get('name', 'Unknown'), # Prefer user name from join
                "childId": str(r['student_id']),
                "grade": r['grade'],
                "school": r['school'],
                "email": r['email_id'] or r['parent_email'], # Try student email then parent fallback
                "phoneNumber": r['resolved_phone'], 
                "joinedAt": r['created_at'].isoformat() if r['created_at'] else None,
                "attemptCount": counts.get('standard', 0), # Standard attempts only
                "marks": std_data.get('marks'), 
                "date": std_data.get('date'), # Latest report date
                "topicFeedback": std_data.get('topicFeedback'), 
                "learningPlan": std_data.get('learningPlan'),
                "summary": std_data.get('summary'),
                "perQuestionReport": std_data.get('perQuestionReport'),
                "rapidMath": rapid_data if rapid_data else None,
                "history": hist,
                "authProvider": auth_provider 
            })
            
        return students

@router.get("/admin/charts")
async def get_admin_charts():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        marks_rows = await conn.fetch("""
            SELECT s.grade, AVG(CAST(r.report_json->'summary'->>'accuracyPercent' AS INTEGER)) as avg_mark
            FROM reports r
            JOIN students s ON r.user_id = s.user_id 
            WHERE r.report_json->'summary'->>'accuracyPercent' IS NOT NULL
            GROUP BY s.grade
        """)
        
        marks_by_grade = [{"name": r['grade'], "avg": round(r['avg_mark'])} for r in marks_rows if r['grade']]
        
        growth_rows = await conn.fetch("""
            SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
            FROM users 
            WHERE role = 'student' OR role = 'parent'
            GROUP BY month
            ORDER BY month
        """)
        
        student_growth = []
        cumulative = 0
        for r in growth_rows:
            cumulative += r['count']
            student_growth.append({"name": r['month'], "students": cumulative})
            
        return {
            "marksByGrade": marks_by_grade,
            "studentGrowth": student_growth
        }
