import time
from telegram.ext import Updater, CommandHandler, CallbackContext
from telegram import Update
import json
from datetime import datetime

# Telegram configuration
# TELEGRAM_TOKEN = "7010887758:AAH_b92VXTQH8HTK9RauHs8KXESR4zXWURA" # t.me/landslidewarningteam8bot
TELEGRAM_TOKEN = "7904979023:AAGrbQrstVZaAMD9i1BXcOTFyAr9K_HRwuE"
CHAT_ID = "5441057589"

class TelegramBot:
    def __init__(self):
        self.updater = Updater(token=TELEGRAM_TOKEN, use_context=True)
        self.dispatcher = self.updater.dispatcher
        self.job_queue = self.updater.job_queue
        self.subscribed_users = set()
        self.latest_sensor_data = {}  # Store latest sensor data here
        self.setup_handlers()
        self.lastSubscriptionMillis = 0
        self.lastTriggerMillis = 0
        
    def setup_handlers(self):
        self.dispatcher.add_handler(CommandHandler("start", self.start))
        self.dispatcher.add_handler(CommandHandler("help", self.help))
        self.dispatcher.add_handler(CommandHandler("status", self.status))
        self.dispatcher.add_handler(CommandHandler("subscribe", self.subscribe))
        self.dispatcher.add_handler(CommandHandler("unsubscribe", self.unsubscribe))

    def send_periodic_update(self, context: CallbackContext):
        chat_id = context.job.context
        if chat_id in self.subscribed_users:
            message = self.format_sensor_data(self.latest_sensor_data)
            context.bot.send_message(chat_id=chat_id, text="[Langganan] Status sensor:\n" + message)
        
    def subscribe(self, update: Update, context: CallbackContext):
        chat_id = str(update.effective_chat.id)
        if chat_id not in self.subscribed_users:
            self.subscribed_users.add(chat_id)
            context.job_queue.run_repeating(
                self.send_periodic_update,
                interval=3,
                first=0,
                context=chat_id
            )
            update.message.reply_text("Berhasil berlangganan status sensor setiap 3 detik.")
        else:
            update.message.reply_text("Anda sudah berlangganan status sensor.")
            
    def unsubscribe(self, update: Update, context: CallbackContext):
        chat_id = str(update.effective_chat.id)
        if chat_id in self.subscribed_users:
            self.subscribed_users.remove(chat_id)
            # Remove the job
            current_jobs = context.job_queue.get_jobs_by_name(chat_id)
            for job in current_jobs:
                job.schedule_removal()
            update.message.reply_text("Berhenti berlangganan status sensor.")
        else:
            update.message.reply_text("Anda belum berlangganan status sensor.")

    def start(self, update: Update, context: CallbackContext):
        welcome_msg = (
            f"Halo {update.effective_user.first_name},\n"
            "Selamat datang di Bot Sistem Peringatan Dini Longsor\n"
            "/help: melihat perintah yang tersedia"
        )
        update.message.reply_text(welcome_msg)
        
    def help(self, update: Update, context: CallbackContext):
        help_msg = (
            "/start - Memulai Bot\n"
            "/status - Menampilkan status terkini dari semua sensor\n"
            "/alert - Menampilkan log peringatan terakhir\n"
            "/subscribe - Berlangganan status sensor setiap 3 detik\n"
            "/unsubscribe - Berhenti berlangganan status sensor"
        )
        update.message.reply_text(help_msg)
    
    def status(self, update: Update, context: CallbackContext):
        if self.latest_sensor_data:
            message = self.format_sensor_data(self.latest_sensor_data)
            update.message.reply_text("Status sensor terkini:\n" + message)
        else:
            update.message.reply_text("Belum ada data sensor yang diterima.")
        pass

    def format_sensor_data(self, data):
        risk_level = data['status']['landslideRisk']
        header = {
            'safe': "✅ Tanah Aman",
            'warning': "⚠ Peringatan: Tanah Berpotensi Longsor (Tanah Waspada)",
            'danger': "⛔ BAHAYA: Tanah Longsor Terjadi (TANAH AWAS)"
        }.get(risk_level, "Status Tidak Dikenal")
        
        sensors = data['sensors']
        message = (
            f"{header}\n"
            f"Peringatan: {'Aktif' if data['status']['alertTriggered'] else 'Tidak Aktif'}\n"
            "________________\n"
            f"Intensitas Hujan: {sensors['rainfall']:.2f}%\n"
            f"Kelembapan tanah: {sensors['soilMoisture']:.2f}%\n"
            f"Temperatur: {sensors['temperature']:.2f} C\n"
            f"Kemiringan X: {sensors['tilt']['angleX']:.2f} C\n"
            f"Kemiringan Y: {sensors['tilt']['angleY']:.2f} C\n"
            f"Accel X: {sensors['accelerometer']['x']:.2f} m/s^2\n"
            f"Accel Y: {sensors['accelerometer']['y']:.2f} m/s^2\n"
            f"Accel Z: {sensors['accelerometer']['z']:.2f} m/s^2\n"
            f"Gyro X: {sensors['gyro']['x']:.2f} rad/s\n"
            f"Gyro Y: {sensors['gyro']['y']:.2f} rad/s\n"
            f"Gyro Z: {sensors['gyro']['z']:.2f} rad/s\n"
            "________________\n"
            "Silahkan cek dashboard lengkap di https://landslide-early-warning-system.vercel.app/ 👈"
        )
        return message

    def handleChat(self, sensor_data):
        # Store the latest sensor data
        self.latest_sensor_data = sensor_data
        self.lastSubscriptionMillis = time.time()
        message = self.format_sensor_data(sensor_data)
        
        if sensor_data['status']['alertTriggered']:
            if time.time() - self.lastTriggerMillis > 3:
                self.lastTriggerMillis = time.time()
                self.updater.bot.send_message(chat_id=CHAT_ID, text="⚠️ ALERT:\n" + message)
                for chat_id in self.subscribed_users:
                    self.updater.bot.send_message(chat_id=chat_id, text="⚠️ ALERT:\n" + message)
        elif time.time() - self.lastSubscriptionMillis > 3:
            self.lastTriggerMillis = time.time()
            for chat_id in self.subscribed_users:
                self.updater.bot.send_message(chat_id=chat_id, text="⚠️ ALERT:\n" + message)

    def start_polling(self):
        self.updater.start_polling()