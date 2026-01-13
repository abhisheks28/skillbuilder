from fastapi import APIRouter, HTTPException, Body, Depends, UploadFile, File, Form, Query
from app.core.database import get_db_pool
from typing import List, Dict, Any, Optional
from .service import NeetService
import json

router = APIRouter()

@router.get("/{subject}/topics")
async def get_topics(subject: str):
    """
    Get hierarchy of topics and sub-topics for a subject with counts.
    Returns: [{ topic: "Mechanics", count: 15, sub_topics: [{ name: "Kinematics", count: 10 }] }]
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Fetch all topic/sub_topic pairs to count them
        rows = await conn.fetch("""
            SELECT topic, sub_topic, question_type
            FROM neet_questions 
            WHERE LOWER(subject) = LOWER($1) AND topic IS NOT NULL
        """, subject)
        
        # Group by case-insensitive topic
        topic_map = {} 
        
        for r in rows:
            t_raw = r['topic'].strip() if r['topic'] else "Unknown"
            t_key = t_raw.lower()
            st_raw = r['sub_topic']
            q_type = r['question_type']
            
            if t_key not in topic_map:
                topic_map[t_key] = {
                    "display": t_raw, 
                    "count": 0,
                    "sub_topics": {} # name -> {count: int, types: map}
                }
            
            # Increment main topic count
            topic_map[t_key]["count"] += 1
            
            if st_raw:
                st_key = st_raw.strip()
                if st_key not in topic_map[t_key]["sub_topics"]:
                     topic_map[t_key]["sub_topics"][st_key] = {
                         "count": 0,
                         "types": {}
                     }
                
                # Increment Sub-topic count
                topic_map[t_key]["sub_topics"][st_key]["count"] += 1
                
                # Increment Type count
                if q_type:
                    if q_type not in topic_map[t_key]["sub_topics"][st_key]["types"]:
                        topic_map[t_key]["sub_topics"][st_key]["types"][q_type] = 0
                    topic_map[t_key]["sub_topics"][st_key]["types"][q_type] += 1
        
        result = []
        for key in sorted(topic_map.keys()):
            item = topic_map[key]
            # Convert sub_topics dict to list
            subs = []
            for st_name, st_data in item["sub_topics"].items():
                subs.append({ 
                    "name": st_name, 
                    "count": st_data["count"],
                    "types": st_data["types"]
                })
            
            # Sort sub-topics by name
            subs.sort(key=lambda x: x["name"])
            
            result.append({
                "topic": item["display"],
                "count": item["count"],
                "sub_topics": subs
            })
            
        return result

@router.get("/{subject}")
async def get_questions(subject: str, topic: Optional[str] = None, sub_topic: Optional[str] = None):
    """
    Fetch all questions for a subject, optionally filtered by topic and sub_topic (Case Insensitive).
    """
    pool = await get_db_pool()
    query = """
        SELECT id, question_content, topic, sub_topic, question_type, created_at, uploaded_by 
        FROM neet_questions 
        WHERE LOWER(subject) = LOWER($1) 
    """
    params = [subject]
    
    if topic:
        query += f" AND LOWER(topic) = LOWER(${len(params) + 1})"
        params.append(topic)
        
    if sub_topic:
        # Sub-topic also case insensitive? Yes, safer.
        query += f" AND LOWER(sub_topic) = LOWER(${len(params) + 1})"
        params.append(sub_topic)
        
    query += " ORDER BY created_at DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        
        results = []
        for r in rows:
            content = r['question_content']
            
            if isinstance(content, str):
                try:
                    content = json.loads(content)
                except json.JSONDecodeError:
                    continue 
            
            if isinstance(content, dict):
                results.append({
                    "id": str(r['id']),
                    **content,
                    "topic": r['topic'],
                    "subTopic": r['sub_topic'],
                    "questionType": r['question_type'],
                    "createdAt": r['created_at'].isoformat()
                })
        return results

@router.post("/{subject}/upload")
async def upload_questions(
    subject: str,
    file: UploadFile = File(...),
    topic: str = Form(...),
    sub_topic: Optional[str] = Form(None),
    question_type: str = Form(...), 
    teacherUid: Optional[str] = Form(None)
):
    """
    Upload questions via file.
    """
    import json
    
    try:
        if file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            questions = await NeetService.parse_upload_file(file, file_type='excel')
        elif file.filename.endswith('.json') or file.filename.endswith('.txt'):
            questions = await NeetService.parse_upload_file(file, file_type='json')
        else:
            raise HTTPException(400, "Invalid file format")
    except Exception as e:
        raise HTTPException(400, str(e))

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user_id = None
        if teacherUid:
            user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", teacherUid)

        for q in questions:
            q_type = q.get('question_type') or question_type
            
            await conn.execute("""
                INSERT INTO neet_questions (subject, topic, sub_topic, question_type, question_content, uploaded_by)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, subject, topic, sub_topic, q_type, json.dumps(q), user_id)
            
    return {"success": True, "count": len(questions)}

@router.patch("/{subject}/{question_id}")
async def update_question(
    subject: str,
    question_id: str,
    payload: Dict[str, Any] = Body(...)
):
    """
    Update a specific question's content.
    Payload should check for 'question', 'options', 'correctAnswer', etc.
    This updates the 'question_content' JSON blob and optionally question_type.
    """
    import json
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # 1. Fetch existing
        row = await conn.fetchrow("SELECT question_content, question_type FROM neet_questions WHERE id = $1", int(question_id))
        if not row:
            raise HTTPException(404, "Question not found")
            
        current_content = json.loads(row['question_content'])
        
        # 2. Merge updates
        # We assume payload contains keys to update in the content
        # Special top-level columns: topic, sub_topic, question_type
        
        new_type = payload.get('questionType') or row['question_type']
        
        # Update content fields
        fields_to_update = ['question', 'options', 'correctAnswer', 'answer', 'explanation', 'solution', 'assertion', 'reason']
        for f in fields_to_update:
            if f in payload:
                current_content[f] = payload[f]
                
        # 3. Update DB
        await conn.execute("""
            UPDATE neet_questions 
            SET question_content = $1, question_type = $2
            WHERE id = $3
        """, json.dumps(current_content), new_type, int(question_id))
        
    return {"success": True}


@router.post("/{subject}")
async def save_questions(
    subject: str, 
    questions: List[Dict[str, Any]] = Body(...), 
    topic: Optional[str] = Body(None),
    sub_topic: Optional[str] = Body(None),
    question_type: Optional[str] = Body(None),
    teacherUid: Optional[str] = Body(None)
):
    import json 
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user_id = None
        if teacherUid:
            user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", teacherUid)

        for q in questions:
            await conn.execute("""
                INSERT INTO neet_questions (subject, topic, sub_topic, question_type, question_content, uploaded_by)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, subject, topic, sub_topic, question_type, json.dumps(q), user_id)
            
    return {"success": True}

@router.post("/assessment/generate")
async def generate_assessment(
    subject: str = Body(...),
    topics: List[str] = Body(...),
    sub_topics: Optional[List[str]] = Body(None),
    total_questions: int = Body(None),
    distribution: Optional[List[Dict[str, Any]]] = Body(None)
):
    pool = await get_db_pool()
    questions = []
    
    async with pool.acquire() as conn:
        where_clauses = ["LOWER(subject) = LOWER($1)"]
        params = [subject]
        param_idx = 2
        
        if topics:
            # Apply BTRIM to topic as well to be safe
            where_clauses.append(f"LOWER(TRIM(topic)) IN (SELECT LOWER(TRIM(unnest(${param_idx}::varchar[]))))")
            params.append(topics)
            param_idx += 1
            
        if sub_topics:
            where_clauses.append(f"LOWER(TRIM(sub_topic)) IN (SELECT LOWER(TRIM(unnest(${param_idx}::varchar[]))))")
            params.append(sub_topics)
            param_idx += 1

        base_query = f"""
            SELECT id, question_content, topic, sub_topic, question_type 
            FROM neet_questions 
            WHERE {" AND ".join(where_clauses)}
        """

        if distribution:
            # Map frontend friendly types to database types
            TYPE_MAP = {
                "mcq": "MCQ",
                "statement": "STATEMENT_BASED",
                "assertion": "ASSERTION_REASON",
                "previous": "NEET_PYQ"
            }

            for dist in distribution:
                raw_type = dist.get('type', '').lower()
                # Use map if exists, otherwise fallback to substring search (legacy)
                db_type = TYPE_MAP.get(raw_type, raw_type)
                
                count = dist.get('count', 0)
                if count > 0:
                    type_query = base_query + f" AND question_type ILIKE ${param_idx} ORDER BY RANDOM() LIMIT ${param_idx+1}"
                    
                    # Use exact match pattern for mapped types, or %like% for others
                    search_pattern = db_type if raw_type in TYPE_MAP else f"%{db_type}%"
                    
                    type_params = params + [search_pattern, count]
                    
                    print(f"DEBUG: Querying type '{raw_type}' -> DB '{db_type}' (Pattern: {search_pattern})")
                    rows = await conn.fetch(type_query, *type_params)
                    
                    print(f"DEBUG: Found {len(rows)} questions for type '{raw_type}' (Requested: {count})")
                    
                    for r in rows:
                        try:
                            content_str = r['question_content']
                            if not content_str: 
                                continue
                                
                            q_data = json.loads(content_str)
                            q_data['id'] = r['id']
                            q_data['topic'] = r['topic']
                            q_data['sub_topic'] = r['sub_topic']
                            q_data['questionType'] = r['question_type']
                            
                            # --- NORMALIZATION LOGIC ---
                            if 'assertion' in q_data and 'reason' in q_data:
                                q_data['question'] = (
                                    f"<div class='assertion-reason'>"
                                    f"<p><strong>Assertion:</strong> {q_data['assertion']}</p>"
                                    f"<p><strong>Reason:</strong> {q_data['reason']}</p>"
                                    f"</div>"
                                )
                            elif any(k.startswith('statement') for k in q_data.keys()):
                                stmts = sorted([k for k in q_data.keys() if k.startswith('statement')])
                                html_parts = []
                                for idx, s_key in enumerate(stmts):
                                    label = f"Statement {idx + 1}" 
                                    html_parts.append(f"<p class='mb-2'><strong>{label}:</strong> {q_data[s_key]}</p>")
                                q_data['question'] = f"<div class='statement-based'>{''.join(html_parts)}</div>"
                            elif 'pairs' in q_data:
                                pairs_html = "<div class='match-pairs'><table class='w-full border-collapse border border-gray-300'>"
                                for p in q_data['pairs']:
                                    c1 = p.get('col1') or p.get('column1') or (p[0] if isinstance(p, list) else '')
                                    c2 = p.get('col2') or p.get('column2') or (p[1] if isinstance(p, list) else '')
                                    pairs_html += f"<tr><td class='p-2 border border-gray-300'>{c1}</td><td class='p-2 border border-gray-300'>{c2}</td></tr>"
                                pairs_html += "</table></div>"
                                q_data['question'] = pairs_html
                            
                            # Standard text handling (MCQ, PYQ, or Statement with 'question' field)
                            if q_data.get('question'):
                                # Replace newlines with breaks for display
                                q_data['question'] = q_data['question'].replace('\n', '<br/>')
                            else:
                                # Fallback if specific keys missing AND question missing
                                q_data['question'] = "<p class='text-red-500'>[Question content missing]</p>"
                            
                            questions.append(q_data)
                        except Exception as e:
                            print(f"Error parsing question {r['id']}: {e}")
                            continue
        else:
            limit = total_questions if total_questions else 50
            final_query = base_query + f" ORDER BY RANDOM() LIMIT ${param_idx}"
            final_params = params + [limit]
            rows = await conn.fetch(final_query, *final_params)
            for r in rows:
                try:
                    q_data = json.loads(r['question_content'])
                    q_data['id'] = r['id']
                    q_data['topic'] = r['topic']
                    q_data['sub_topic'] = r['sub_topic']
                    q_data['questionType'] = r['question_type']
                    
                    # Generic Normalization
                    if 'assertion' in q_data and 'reason' in q_data:
                        q_data['question'] = f"<p><strong>Assertion:</strong> {q_data['assertion']}</p><p><strong>Reason:</strong> {q_data['reason']}</p>"
                    elif any(k.startswith('statement') for k in q_data.keys()):
                         stmts = sorted([k for k in q_data.keys() if k.startswith('statement')])
                         html = "".join([f"<p><strong>Statement {i+1}:</strong> {q_data[k]}</p>" for i, k in enumerate(stmts)])
                         q_data['question'] = html
                    elif 'pairs' in q_data:
                        pairs_html = "<table class='w-full border' style='border-collapse: collapse;'>"
                        for p in q_data['pairs']:
                            c1 = p.get('col1','')
                            c2 = p.get('col2','')
                            pairs_html += f"<tr><td style='border:1px solid #ddd; padding:4px;'>{c1}</td><td style='border:1px solid #ddd; padding:4px;'>{c2}</td></tr>"
                        pairs_html += "</table>"
                        q_data['question'] = pairs_html
                    
                    if q_data.get('question'):
                        q_data['question'] = q_data['question'].replace('\n', '<br/>')
                    else:
                        q_data['question'] = "<p>[Question content missing]</p>"

                    questions.append(q_data)
                except:
                    continue

    return questions

@router.post("/assessment/save")
async def save_assessment(
    title: str = Body(...),
    subject: str = Body(...),
    question_ids: List[Dict[str, Any]] = Body(...), # Expecting [{"id": 1}, ...] or just ids
    config: Dict[str, Any] = Body(None),
    teacherUid: Optional[str] = Body(None)
):
    import json
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user_id = None
        if teacherUid:
            user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", teacherUid)
            
        await conn.execute("""
            INSERT INTO neet_assessments (title, subject, question_ids, config, created_by)
            VALUES ($1, $2, $3, $4, $5)
        """, title, subject, json.dumps(question_ids), json.dumps(config or {}), user_id)
        
    return {"success": True}

@router.get("/{subject}/assessments")
async def list_assessments(subject: str, teacherUid: Optional[str] = Query(None)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        query = """
            SELECT id, title, subject, question_ids, config, created_at
            FROM neet_assessments
            WHERE LOWER(subject) = LOWER($1)
        """
        params = [subject]
        
        if teacherUid:
            user_id = await conn.fetchval("SELECT user_id FROM users WHERE firebase_uid = $1", teacherUid)
            if user_id:
                query += " AND created_by = $2"
                params.append(user_id)
            else:
                # If teacherUid provided but not found, return empty or all? 
                # Assuming filtering by user is desired, return empty if user not found.
                return []
                
        query += " ORDER BY created_at DESC"
        
        rows = await conn.fetch(query, *params)
        
        results = []
        for r in rows:
            results.append({
                "id": r['id'],
                "title": r['title'],
                "subject": r['subject'],
                "questionCount": len(json.loads(r['question_ids'])),
                "config": json.loads(r['config']),
                "createdAt": r['created_at'].isoformat()
            })
            
    return results

@router.delete("/{subject}/topic")
async def delete_topic_questions(
    subject: str, 
    topic: str = Query(...), 
    sub_topic: Optional[str] = Query(None)
):
    """
    Delete all questions for a specific topic (and optional sub-topic).
    """
    pool = await get_db_pool()
    query = "DELETE FROM neet_questions WHERE LOWER(subject) = LOWER($1) AND LOWER(topic) = LOWER($2)"
    params = [subject, topic]
    
    if sub_topic:
        query += " AND LOWER(sub_topic) = LOWER($3)"
        params.append(sub_topic)
        
    async with pool.acquire() as conn:
        result = await conn.execute(query, *params)
        
    return {"success": True, "message": result}

@router.patch("/{subject}/topic")
async def rename_topic(
    subject: str,
    old_topic: str = Body(...),
    new_topic: str = Body(...),
    old_sub_topic: Optional[str] = Body(None),
    new_sub_topic: Optional[str] = Body(None)
):
    """
    Rename a topic or sub-topic (Case Insensitive Match).
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # If renaming sub-topic
        if old_sub_topic and new_sub_topic:
            query = """
                UPDATE neet_questions 
                SET sub_topic = $1 
                WHERE LOWER(subject) = LOWER($2) AND LOWER(topic) = LOWER($3) AND LOWER(sub_topic) = LOWER($4)
            """
            await conn.execute(query, new_sub_topic, subject, old_topic, old_sub_topic)
        # If renaming main topic
        else:
            query = """
                UPDATE neet_questions 
                SET topic = $1 
                WHERE LOWER(subject) = LOWER($2) AND LOWER(topic) = LOWER($3)
            """
            await conn.execute(query, new_topic, subject, old_topic)
            
    return {"success": True}

@router.delete("/{subject}/{question_id}")
async def delete_question(subject: str, question_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM neet_questions WHERE id = $1 AND subject = $2", question_id, subject)
    return {"success": True}

@router.delete("/{subject}")
async def clear_questions(subject: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM neet_questions WHERE subject = $1", subject)
    return {"success": True}

@router.get("/files/template")
async def get_neet_template():
    """
    Download a sample Excel template for NEET questions.
    """
    import pandas as pd
    from io import BytesIO
    from starlette.responses import StreamingResponse

    # Create a sample DataFrame
    data = {
        "question": ["What is the unit of Force?", "Photosynthesis occurs in?"],
        "option_a": ["Newton", "Mitochondria"],
        "option_b": ["Joule", "Chloroplast"],
        "option_c": ["Pascal", "Nucleus"],
        "option_d": ["Watt", "Ribosome"],
        "correct_answer": ["A", "B"],
        "explanation": ["Force = ma, Unit is Newton", "Chloroplast contains chlorophyll"],
        "question_type": ["MCQ", "Statement"]
    }
    df = pd.DataFrame(data)

    # Save to BytesIO
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)

    headers = {
        'Content-Disposition': 'attachment; filename="neet_question_template.xlsx"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@router.get("/files/template/json")
async def get_neet_template_json():
    """
    Download a sample JSON template for NEET questions.
    """
    from starlette.responses import Response
    import json

    data = [
        {
            "question": "What is the unit of Force?",
            "option_a": "Newton",
            "option_b": "Joule",
            "option_c": "Pascal",
            "option_d": "Watt",
            "correct_answer": "A",
            "explanation": "Force = ma, Unit is Newton"
        },
        {
            "question": "Photosynthesis occurs in?",
            "option_a": "Mitochondria",
            "option_b": "Chloroplast",
            "option_c": "Nucleus",
            "option_d": "Ribosome",
            "correct_answer": "B",
            "explanation": "Chloroplast contains chlorophyll"
        }
    ]
    
    json_str = json.dumps(data, indent=4)
    headers = {
        'Content-Disposition': 'attachment; filename="neet_question_template.json"'
    }
    return Response(content=json_str, headers=headers, media_type='application/json')
