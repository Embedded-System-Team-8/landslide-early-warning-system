import time
from firebase_config import rtdb, firestore_db
from telegram_bot import TelegramBot
from datetime import datetime
import threading

class DataHandler:
    def __init__(self):
        self.telegram_bot = TelegramBot()
        self.samples = []
        self.max_samples = 100

    def store_in_firestore(self):
        if not self.samples:
            return
            
        batch = firestore_db.batch()
        collection = firestore_db.collection('sensor_history')
        
        for sample in self.samples:
            doc_ref = collection.document()
            batch.set(doc_ref, {
                **sample,
                'timestamp': datetime.now()
            })
            
        batch.commit()
        print(f"Stored {len(self.samples)} samples in Firestore")
        self.samples = []  # Clear samples after storing

    def handle_realtime_data(self, event):
        """Handle new data from Realtime Database"""
        if event.data:
            print(f"Tilt:{event.data['sensors']['tilt']} | Gyro:{event.data['sensors']['gyro']} | Acc:{event.data['sensors']['accelerometer']}")
            
            # Store data for batch processing
            self.samples.append(event.data)
            
            # Check if we need to store in Firestore
            if len(self.samples) >= self.max_samples:
                self.store_in_firestore()
            
            # Send alert if needed
            if event.data['status']['alertTriggered']:
                self.telegram_bot.send_alert(event.data)

    def start_listening(self):
        """Start listening to Firebase Realtime Database"""
        rtdb.listen(self.handle_realtime_data)

def main():
    handler = DataHandler()
    
    # Start Telegram bot in a separate thread
    bot_thread = threading.Thread(target=handler.telegram_bot.start_polling)
    bot_thread.daemon = True
    bot_thread.start()
    
    print("Starting data collection...")
    handler.start_listening()

if __name__ == "__main__":
    main()