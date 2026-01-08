import firebase_admin
from firebase_admin import credentials
from app.core.config import settings
import json
import os

def initialize_firebase():
    if not firebase_admin._apps:
        cred = None
        if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
            try:
                cert_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
                cred = credentials.Certificate(cert_dict)
            except Exception as e:
                print(f"Error parsing FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
        
        elif settings.FIREBASE_SERVICE_ACCOUNT_PATH:
            if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
            else:
                print(f"Warning: FIREBASE_SERVICE_ACCOUNT_PATH {settings.FIREBASE_SERVICE_ACCOUNT_PATH} not found.")

        elif settings.GOOGLE_APPLICATION_CREDENTIALS:
             if os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
                cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)

        # Options
        options = {}
        if settings.FIREBASE_DATABASE_URL:
            options['databaseURL'] = settings.FIREBASE_DATABASE_URL
        
        if cred:
            firebase_admin.initialize_app(cred, options)
        else:
            print("Using default credentials for Firebase.")
            firebase_admin.initialize_app(options=options)

initialize_firebase()
