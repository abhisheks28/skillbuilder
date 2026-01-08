import asyncio
import asyncpg
from app.core.config import settings
import json

async def debug_db():
    print(f"Connecting to database {settings.DB_NAME}...")
    try:
        conn = await asyncpg.connect(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME
        )
        
        print("\n--- Users ---")
        users = await conn.fetch("SELECT user_id, name, role FROM users")
        for u in users:
            print(dict(u))
            
            # Check reports for this user
            print(f"\n--- Reports for User {u['user_id']} {u['name']} ---")
            reports = await conn.fetch("SELECT report_json FROM reports WHERE user_id = $1", u['user_id'])
            for i, r in enumerate(reports):
                data = json.loads(r['report_json']) if isinstance(r['report_json'], str) else r['report_json']
                rtype = data.get('type')
                
                if rtype == 'RAPID_MATH': continue 
                
                print(f"\n{'='*20} Report {i+1} (Standard) {'='*20}")
                
                # Check perQuestionReport for topic mapping
                pqr = data.get('perQuestionReport', [])
                print(f"PerQuestionReport Length: {len(pqr)}")
                
                # Collect all unique topics from questions
                question_topics = set()
                for q in pqr:
                    if 'topic' in q: question_topics.add(q['topic'])
                
                print(f"Unique Question Topics: {list(question_topics)}")
                    
                # Check Topic Feedback structure
                tf = data.get('topicFeedback', {})
                print(f"Topic Feedback Keys: {list(tf.keys())}")
                print("-" * 50)
            
        print("\n--- Students ---")
        students = await conn.fetch("SELECT * FROM students")
        print(f"Count: {len(students)}")
        for s in students:
            print(dict(s))
            
        print("\n--- Report Counts ---")
        count = await conn.fetchval("SELECT COUNT(*) FROM reports")
        print(f"Total Reports: {count}")

        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_db())
