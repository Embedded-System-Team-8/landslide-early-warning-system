#include "telegram_module.h"
#include <Arduino.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include "sensors.h"
#include "config.h"

const char* botToken = TELEGRAM_BOT_TOKEN;
const char* chatId = TELEGRAM_CHAT_ID;

WiFiClientSecure secured_client;
UniversalTelegramBot bot(botToken, secured_client);

// Timer untuk polling
unsigned long lastTimeBotRan;
const unsigned long botInterval = 2000; // 2 detik

bool isSubscribed = false;
unsigned long lastSubscriptionSent = 0;
const unsigned long subscriptionInterval = 5000; // 5 seconds
String subscribedChatId = "";

String* riskLevel = nullptr;
bool alertTrigger = false;

void setupTelegram() {
  Serial.println("Initializing Telegram Bot...");
  // secured_client.setCACert(TELEGRAM_CERTIFICATE_ROOT);
  secured_client.setInsecure(); // Use this for testing, not recommended for production
  lastTimeBotRan = millis();
  Serial.println("Telegram Bot initialized.");
}

void checkNewMessages(
  String *riskLevelz, 
  const bool alertTriggerz
) {
  if (riskLevelz == nullptr) {
    Serial.println("Risk level pointer is null.");
    return;
  }

  if (millis() - lastTimeBotRan > botInterval) {
    Serial.println("Checking for new Telegram messages...");
    riskLevel = riskLevelz;
    alertTrigger = alertTriggerz;

    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    while (numNewMessages) {
      Serial.println("New message received.");
      replyNewMessages(numNewMessages);
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
    lastTimeBotRan = millis();
  }
}

String getFormattedSensorData() {
    float rainValue, soilMoistureValue;
    sensors_event_t a, g, temp;

    readAllSensorsData(rainValue, soilMoistureValue, a, g, temp);
    
    String header = "";

    if (*riskLevel == "safe") {
      header = "✅ Tanah Aman";
    } else if (*riskLevel == "warning") {
      header = "⚠ Peringatan: Tanah Berpotensi Longsor (Tanah Waspada)";
    } else if (*riskLevel == "danger") {
      header = "⛔ BAHAYA: Tanah Longsor Terjadi (TANAH AWAS)";
    } else {
      header = "Status Tidak Dikenal";
    }

    String data = header + "\n";
    data += "Peringatan: " + String(alertTrigger ? "Aktif" : "Tidak Aktif") + "\n";
    data += "________________\n";
    data +="Rain: " + String(rainValue, 2) + "%\n";
    data += "Soil Moisture: " + String(soilMoistureValue, 2) + "%\n";
    data += "Accel X: " + String(a.acceleration.x, 2) + " m/s^2\n";
    data += "Accel Y: " + String(a.acceleration.y, 2) + " m/s^2\n";
    data += "Accel Z: " + String(a.acceleration.z, 2) + " m/s^2\n";
    data += "Gyro X: " + String(g.gyro.x, 2) + " rad/s\n";
    data += "Gyro Y: " + String(g.gyro.y, 2) + " rad/s\n";
    data += "Gyro Z: " + String(g.gyro.z, 2) + " rad/s\n";
    data += "Temperature: " + String(temp.temperature, 2) + " C\n";
    data += "________________\n";
    data += "Silahkan cek dashboard lengkap di https://landslide-early-warning-system.vercel.app/ 👈";
    return data;
}

void handleSubscriptionCommands(const String& chat_id, const String& text) {
    if (text == "/subscribe") {
        isSubscribed = true;
        subscribedChatId = chat_id;
        bot.sendMessage(chat_id, "Berhasil berlangganan status sensor setiap 5 detik.", "");
    } else if (text == "/unsubscribe") {
        isSubscribed = false;
        subscribedChatId = "";
        bot.sendMessage(chat_id, "Berhenti berlangganan status sensor.", "");
    }
}

void sendSubscriptionStatusIfNeeded() {
    if (isSubscribed && (millis() - lastSubscriptionSent > subscriptionInterval)) {
        String data = getFormattedSensorData();
        bot.sendMessage(subscribedChatId, "[Langganan] Status sensor:\n" + data, "");
        lastSubscriptionSent = millis();
    }
}

void replyNewMessages(int numNewMessages) {
  for (int i = 0; i < numNewMessages; i++) {
    String chat_id = bot.messages[i].chat_id;
    String text = bot.messages[i].text;
    String from_name = bot.messages[i].from_name;

    Serial.print("Message from: ");
    Serial.print(from_name);
    Serial.print(" (");
    Serial.print(chat_id);
    Serial.print("): ");
    Serial.println(text);

    if (text == "/start") {
      String welcome = "Halo " + from_name + ",\n";
      welcome += "Selamat datang di Bot Sistem Peringatan Dini Longsor\n";
      welcome += "/help: melihat perintah yang tersedia";
      bot.sendMessage(chat_id, welcome, "");
    }
    else if (text == "/help") {
      String helpMsg = "";
      helpMsg += "/start - Memulai Bot\n";
      helpMsg += "/status - Menampilkan status terkini dari semua sensor\n";
      helpMsg += "/alert - Menampilkan log peringatan terakhir\n";
      helpMsg += "/subscribe /unsubscribe - Terima notifikasi setiap 5 detik\n";
      helpMsg += "/thresholds - Menampilkan ambang batas bahaya saat ini";
      bot.sendMessage(chat_id, helpMsg, "");
    }
    
    else if (text == "/status") {
      bot.sendMessage(chat_id, getFormattedSensorData(), "");
    }
    else if (text == "/subscribe") {
      bot.sendMessage(chat_id, "Berlangganan status sensor setiap 5 detik. /unsubscribe untuk berhenti.", "");
      handleSubscriptionCommands(chat_id, text);
    }
    else if (text == "/unsubscribe") {
      bot.sendMessage(chat_id, "Berhenti berlangganan status sensor.", "");
      handleSubscriptionCommands(chat_id, text);
    }
    else if (text == "/thresholds") {
      bot.sendMessage(chat_id, "Ambang batas bahaya saat ini: [data thresholds]", "");
    }
    else {
      bot.sendMessage(chat_id, "Tidak dapat menemukan perintah. Ketik /help untuk bantuan.", "");
    }
  }
}
