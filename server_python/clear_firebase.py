import asyncio
import firebase_admin
from firebase_admin import credentials, db, auth
import os
from dotenv import load_dotenv

# Load .env explicitly
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

from app.core.config import settings

# Initialize Firebase (Standalone)
def init_firebase_script():
    if not firebase_admin._apps:
        cred = None
        if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
             import json
             cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
             cred = credentials.Certificate(cred_dict)
        elif settings.FIREBASE_SERVICE_ACCOUNT_PATH:
             cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        else:
             print("Warning: No explicit Firebase credentials found, relying on Google Application Credentials.")
             cred = credentials.ApplicationDefault()
        
        firebase_admin.initialize_app(cred, {
            'databaseURL': settings.FIREBASE_DATABASE_URL
        })

def clear_rtdb():
    print("WARNING: This will delete ALL data in 'NMD_2025' from Firebase Realtime Database.")
    confirm = input("Are you sure? (type 'yes' to confirm): ")
    if confirm != 'yes':
        print("Aborted.")
        return

    print("Deleting 'NMD_2025' node...")
    ref = db.reference('NMD_2025')
    ref.delete()
    print("Realtime Database cleared.")

    # Optional: Clear Auth Users? 
    # That is much slower/more complex to do safely in bulk without hitting limits usually, 
    # but for dev env it works. 
    # For now, just data as requested.

if __name__ == "__main__":
    init_firebase_script()
    clear_rtdb()
