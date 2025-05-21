import firebase_admin
from firebase_admin import credentials, db, firestore

# Firebase configuration
firebase_config = {
    "apiKey": "AIzaSyDWh86oJpll6WLrDZB2lPqIaRy83GZGkMs",
    "authDomain": "landslide-system-b8dd4.firebaseapp.com",
    "databaseURL": "https://landslide-system-b8dd4-default-rtdb.asia-southeast1.firebasedatabase.app",
    "projectId": "landslide-system-b8dd4",
    "storageBucket": "landslide-system-b8dd4.firebasestorage.app",
    "messagingSenderId": "145586828202",
    "appId": "1:145586828202:web:b7e9fcf6de11a71d0431d3",
    "measurementId": "G-8L91HNRPKJ",
}

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': firebase_config['databaseURL']
})

# Get Realtime Database and Firestore instances
rtdb = db.reference('/')
firestore_db = firestore.client()