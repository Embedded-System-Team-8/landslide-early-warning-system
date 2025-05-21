import time
from firebase_config import rtdb, firestore_db
from telegram_bot import TelegramBot
from datetime import datetime
import threading
import signal
import sys

class DataHandler:
    def __init__(self):
        self.telegram_bot = TelegramBot()
        self.samples = []
        self.max_samples = 100
        self.enableFirebase = True
        self.enableTelegram = True
        
    def stop(self):
        """Stop the data handler"""
        self.running = False
        # Store any remaining samples
        if self.samples:
            self.store_in_firestore()

    def store_in_firestore(self):
        if not self.samples:
            return
            
        batch = firestore_db.batch()
        collection = firestore_db.collection('sensor_history')
        
        for sample in self.samples:
            doc_ref = collection.document()
            batch.set(doc_ref, {
                **sample,
                # 'timestamp': datetime.now()
            })
            
        batch.commit()
        print(f"Stored {len(self.samples)} samples in Firestore")
        self.samples = []  # Clear samples after storing

    def handle_realtime_data(self, event):
        """Handle new data from Realtime Database"""
        if event.data:
            print(f"STATUS:{event.data['status']['alertTriggered']} | Tilt:{event.data['sensors']['tilt']} | Gyro:{event.data['sensors']['gyro']} | Acc:{event.data['sensors']['accelerometer']}")
            
            event.data['timestamp'] = datetime.now()

            if self.enableFirebase:            
                self.samples.append(event.data)
                if len(self.samples) >= self.max_samples:
                    self.store_in_firestore()
                if (self.enableTelegram):
                    self.telegram_bot.handleChat(event.data)

    def start_listening(self):
        """Start listening to Firebase Realtime Database"""
        rtdb.listen(self.handle_realtime_data)

def main():
    handler = DataHandler()
    
    def signal_handler(sig, frame):
        print('\nGracefully shutting down...')
        handler.stop()  # Stop the data handler
        handler.telegram_bot.stop()  # Add stop method to TelegramBot class
        print('Program terminated.')
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start Telegram bot in a separate thread
        bot_thread = threading.Thread(target=handler.telegram_bot.start_polling)
        bot_thread.daemon = True
        bot_thread.start()
        
        print("Starting data collection... (Press Ctrl+C to exit)")
        handler.start_listening()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"Error occurred: {e}")
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()