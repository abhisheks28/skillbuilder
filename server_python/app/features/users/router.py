from fastapi import APIRouter, HTTPException, Path, Body
from app.core.database import get_db_pool
from app.models.schemas import StudentCreate, TeacherCreate, ParentCreate, GuestCreate
from typing import Dict, Any

router = APIRouter()

@router.delete("/{uid}")
async def delete_user(uid: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Check if user exists by various identifiers
        # 1. Check by Firebase UID
        user = await conn.fetchrow("SELECT user_id FROM users WHERE firebase_uid = $1", uid)
        
        # 2. Check by Credentials Username (Ticket ID)
        if not user:
            user = await conn.fetchrow(
                "SELECT user_id FROM credentials WHERE username = $1", uid
            )
            
        # 3. Check by direct User ID (if numeric)
        if not user and uid.isdigit():
             user = await conn.fetchrow("SELECT user_id FROM users WHERE user_id = $1", int(uid))
             
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_id = user['user_id']
        
        # Cascading delete should handle related tables (students, reports, etc.) if configured in schema.
        # Ensure schema.sql uses ON DELETE CASCADE.
        # "user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE" - Yes they do.
        
        await conn.execute("DELETE FROM users WHERE user_id = $1", user_id)
        
    return {"success": True, "message": "User deleted"}

@router.get("/")
async def get_all_users():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM users ORDER BY created_at DESC")
        return {"success": True, "count": len(rows), "data": [dict(row) for row in rows]}

@router.get("/{uid}")
async def get_profile(uid: str = Path(..., description="Firebase UID")):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Fetch base user
        user_row = await conn.fetchrow("SELECT * FROM users WHERE firebase_uid = $1", uid)
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = dict(user_row)
        user_id = user_data['user_id']
        role = user_data.get('role', '').lower()

        # Fetch role specific data
        role_data = {}
        children_data = {}

        if role == 'student':
            # Direct student mapping
            role_row = await conn.fetchrow("SELECT * FROM students WHERE user_id = $1", user_id)
            if role_row: 
                role_data = dict(role_row)
                # Map as single child for AuthContext compatibility
                child_data = dict(role_row)
                # Add 'name' from users table since students table may not have it
                child_data['name'] = user_data.get('name') or child_data.get('parent_name', '')
                children_data[str(role_row['student_id'])] = child_data

        elif role == 'teacher':
            role_row = await conn.fetchrow("""
                SELECT t.*, teach.neet as neet_enabled 
                FROM teachers t
                LEFT JOIN teaching teach ON t.teacher_id = teach.teacher_id
                WHERE t.user_id = $1
            """, user_id)
            if role_row: 
                role_data = dict(role_row)
                role_data['neetUploadEnabled'] = role_row['neet_enabled'] or False

        elif role == 'parent':
            role_row = await conn.fetchrow("SELECT * FROM parents WHERE user_id = $1", user_id)
            if role_row: 
                role_data = dict(role_row)
                parent_id = role_row['parent_id']
                
                # Fetch Linked Students
                # Join with users to get the name, as students table doesn't have it
                students = await conn.fetch(
                    """SELECT s.*, u.name 
                       FROM students s 
                       JOIN users u ON s.user_id = u.user_id 
                       WHERE s.parent_id = $1""", 
                    parent_id
                )
                for s in students:
                    s_dict = dict(s)
                    children_data[str(s['student_id'])] = s_dict

        elif role == 'guest':
            role_row = await conn.fetchrow("SELECT * FROM guests WHERE user_id = $1", user_id)
            if role_row: role_data = dict(role_row)

        # Merge Data
        response_data = {**user_data, **role_data}
        if children_data:
            response_data['children'] = children_data
            
        return {"success": True, "data": response_data}

@router.post("/{uid}/child")
async def add_child(uid: str, child_data: Dict[str, Any] = Body(...)):
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Get User
                user_row = await conn.fetchrow("SELECT user_id, role, name FROM users WHERE firebase_uid = $1", uid)
                if not user_row:
                    raise HTTPException(status_code=404, detail="User not found")
                
                user_id = user_row['user_id']
                role = user_row['role']
                
                # Ensure User is a Parent (Upgrade if Student/Guest/New)
                if role != 'parent':
                    # If currently student, maybe migration? or mismatch.
                    # For now, just upgrade to parent if they are adding a "Child"
                    await conn.execute("UPDATE users SET role = 'parent' WHERE user_id = $1", user_id)
                    role = 'parent'

                # Ensure Parent Record Exists
                parent_id = await conn.fetchval("SELECT parent_id FROM parents WHERE user_id = $1", user_id)
                if not parent_id:
                    # Create parent profile
                    parent_phone = child_data.get('parentPhone') or child_data.get('phoneNumber')
                    parent_email = child_data.get('parentEmail') 
                    
                    # Fallback: Check if they were a student/guest and have details there
                    if not parent_phone or not parent_email:
                        # Check students table
                        st_row = await conn.fetchrow("SELECT phone_number, email_id FROM students WHERE user_id = $1", user_id)
                        if st_row:
                            if not parent_phone: parent_phone = st_row['phone_number']
                            if not parent_email: parent_email = st_row['email_id']
                        
                        # Check guests table if still missing
                        if not parent_phone or not parent_email:
                             gt_row = await conn.fetchrow("SELECT phone_number, email_id FROM guests WHERE user_id = $1", user_id)
                             if gt_row:
                                if not parent_phone: parent_phone = gt_row['phone_number']
                                if not parent_email: parent_email = gt_row['email_id']

                    parent_id = await conn.fetchval(
                        "INSERT INTO parents (user_id, phone_number, email_id) VALUES ($1, $2, $3) RETURNING parent_id",
                        user_id, parent_phone, parent_email
                    )
                
                    # Add Student Linked to Parent
                student_name = child_data.get('name')
                student_grade = child_data.get('grade')
                student_school = child_data.get('school')
                
                # 1. Create a User record for the child (to store the name)
                # We leave firebase_uid NULL since they are managed and don't have a login yet
                child_user_id = await conn.fetchval(
                    "INSERT INTO users (name, role) VALUES ($1, 'student') RETURNING user_id",
                    student_name
                )

                # 2. Create Student record linked to that User
                student_id = await conn.fetchval(
                    """INSERT INTO students (user_id, parent_id, grade, school, parent_name) 
                       VALUES ($1, $2, $3, $4, $5) RETURNING student_id""",
                    child_user_id, parent_id, student_grade, student_school, user_row['name']
                )

                child_data['student_id'] = student_id
                
        return {"success": True, "message": "Child added", "data": child_data}
    except Exception as e:
        print(f"Error in add_child: {str(e)}") # Log to console
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/{uid}/child/{child_id}")
async def update_child(uid: str, child_id: str, updates: Dict[str, Any] = Body(...)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
             # Get User
            user_row = await conn.fetchrow("SELECT user_id, role FROM users WHERE firebase_uid = $1", uid)
            if not user_row:
                 raise HTTPException(status_code=404, detail="User not found")
            
            user_id = user_row['user_id']
            role = user_row['role']
            
            if role != 'parent':
                 raise HTTPException(status_code=403, detail="Only parents can update children")

            # Verify Parent Ownership of Student
            try:
                sid = int(child_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid child ID format")

            # Check if this student belongs to this parent
            parent_id = await conn.fetchval("SELECT parent_id FROM parents WHERE user_id = $1", user_id)
            if not parent_id:
                raise HTTPException(status_code=404, detail="Parent profile not found")

            student = await conn.fetchrow("SELECT * FROM students WHERE student_id = $1 AND parent_id = $2", sid, parent_id)
            if not student:
                 raise HTTPException(status_code=404, detail="Child not found or does not belong to user")

            # Perform Updates
            
            # 1. Update Name in Users table
            if 'name' in updates:
                child_user_id = student['user_id']
                if child_user_id:
                     await conn.execute("UPDATE users SET name = $1 WHERE user_id = $2", updates['name'], child_user_id)

            # 2. Update Grade/School in Students table
            valid_fields = ['grade', 'school']
            set_clauses = []
            values = []
            idx = 1
            
            for field in valid_fields:
                if field in updates:
                    set_clauses.append(f"{field} = ${idx}")
                    values.append(updates[field])
                    idx += 1
            
            if set_clauses:
                values.append(sid)
                query = f"UPDATE students SET {', '.join(set_clauses)} WHERE student_id = ${idx}"
                await conn.execute(query, *values)
                
    return {"success": True, "message": "Child updated"}

@router.put("/{uid}")
async def update_profile(uid: str, updates: Dict[str, Any] = Body(...)):
    # This is a bit complex as updates could target 'users' table OR role table.
    # For simplicity, we assume 'updates' might contain mixed fields.
    # We'll need to know the role to update the correct table.
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Get User ID and Role
            user_row = await conn.fetchrow("SELECT user_id, role FROM users WHERE firebase_uid = $1", uid)
            if not user_row:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_id = user_row['user_id']
            role = user_row['role'].lower() if user_row['role'] else 'student' # Default to student if null

            # Logic to split updates between 'users' table and role table
            # Base user fields
            base_fields = ['name', 'role'] 
            # (Note: changing role might require moving data between tables, avoiding complexity for now)

            # Update base user if name is present
            if 'name' in updates:
                 await conn.execute("UPDATE users SET name = $1 WHERE user_id = $2", updates['name'], user_id)

            # Role specific updates
            # Construct dynamic UPDATE query
            role_table_map = {
                'student': 'students', 
                'teacher': 'teachers', 
                'parent': 'parents', 
                'guest': 'guests'
            }
            
            table_name = role_table_map.get(role)
            if table_name:
                # Filter updates for this table. 
                # Ideally we check against known columns, but for MVP we wrap in try/catch or just be careful.
                # Let's assume frontend sends correct keys.
                # We need to know valid columns for safety or explicitly map them.
                # Since we don't have strict valid col lists here easily, we'll try to update specific known fields if present.
                
                # Simple implementation: Check standard fields
                # Student: grade, school, parent_name, phone_number, email_id
                
                # Check if record exists, if not create it
                exists = await conn.fetchval(f"SELECT 1 FROM {table_name} WHERE user_id = $1", user_id)
                
                if not exists:
                     # Create empty record to update
                     await conn.execute(f"INSERT INTO {table_name} (user_id) VALUES ($1)", user_id)

                # Now update fields
                # This is inefficient but safe: update one by one or build dynamic query.
                valid_columns = []
                values = []
                
                # Common fields (Phone/Email often in role tables in this schema)
                if 'phone_number' in updates: valid_columns.append('phone_number'); values.append(updates['phone_number'])
                if 'email_id' in updates: valid_columns.append('email_id'); values.append(updates['email_id'])
                if 'school' in updates and role in ['student', 'teacher']: valid_columns.append('school'); values.append(updates['school'])
                if 'grade' in updates and role == 'student': valid_columns.append('grade'); values.append(updates['grade'])
                if 'subject' in updates and role == 'teacher': valid_columns.append('subject'); values.append(updates['subject'])
                if 'profession' in updates and role in ['parent', 'guest']: valid_columns.append('profession'); values.append(updates['profession'])
                
                if valid_columns:
                    set_clause = ", ".join([f"{col} = ${i+2}" for i, col in enumerate(valid_columns)])
                    query = f"UPDATE {table_name} SET {set_clause} WHERE user_id = $1"
                    await conn.execute(query, user_id, *values)

    return {"success": True, "message": "Profile updated"}
