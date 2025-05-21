from telegram.ext import Updater, CommandHandler, CallbackContext
from telegram import Update
import json
from datetime import datetime

# Telegram configuration
TELEGRAM_TOKEN = "7904979023:AAGrbQrstVZaAMD9i1BXcOTFyAr9K_HRwuE"
CHAT_ID = "1388016195"

class TelegramBot:
    def __init__(self):
        self.updater = Updater(token=TELEGRAM_TOKEN, use_context=True)
        self.dispatcher = self.updater.dispatcher
        self.setup_handlers()
        
    def setup_handlers(self):
        self.dispatcher.add_handler(CommandHandler("start", self.start))
        self.dispatcher.add_handler(CommandHandler("help", self.help))
        self.dispatcher.add_handler(CommandHandler("status", self.status))
        
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
            "/alert - Menampilkan log peringatan terakhir"
        )
        update.message.reply_text(help_msg)
    
    def status(self, update: Update, context: CallbackContext):
        # This will be implemented to fetch current sensor data
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
            f"Rain: {sensors['rainfall']:.2f}%\n"
            f"Soil Moisture: {sensors['soilMoisture']:.2f}%\n"
            f"Accel X: {sensors['accelerometer']['x']:.2f} m/s^2\n"
            f"Accel Y: {sensors['accelerometer']['y']:.2f} m/s^2\n"
            f"Accel Z: {sensors['accelerometer']['z']:.2f} m/s^2\n"
            f"Gyro X: {sensors['gyro']['x']:.2f} rad/s\n"
            f"Gyro Y: {sensors['gyro']['y']:.2f} rad/s\n"
            f"Gyro Z: {sensors['gyro']['z']:.2f} rad/s\n"
            f"Temperature: {sensors['temperature']:.2f} C\n"
            "________________\n"
            "Silahkan cek dashboard lengkap di https://landslide-early-warning-system.vercel.app/ 👈"
        )
        return message

    def send_alert(self, sensor_data):
        if sensor_data['status']['alertTriggered']:
            message = self.format_sensor_data(sensor_data)
            self.updater.bot.send_message(chat_id=CHAT_ID, text=message)

    def start_polling(self):
        self.updater.start_polling()