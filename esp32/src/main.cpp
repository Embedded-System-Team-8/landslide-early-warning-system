#include <FirebaseESP32.h>
#include <WiFi.h>
#include <ESP32Servo.h>
#include <Adafruit_MPU6050.h> 
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "sensors.h"
#include "actuators.h"
#include "wifi_module.h"
#include "firebase_module.h"
#include "telegram_module.h"
#include "logic.h"


void setup() {
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  Serial.begin(115200);
  delay(1000); // Give serial monitor time to open
  
  setupActuators();
  setupSensors();
  
  writeLCD("Initializing\nMPU6050...");
  setupMPU6050();
  
  writeLCD("Initializing\nWiFi...");
  setupWiFi();
  
  writeLCD("Initializing\nFirebase...");
  setupFirebase();
  
  writeLCD("Initializing\nTelegram...");
  setupTelegram();

  // System ready message
  writeLCD("System Ready!\n:)");
  delay(2000);
}

void loop() {
  sensors_event_t a, g, temp;
  float rainValue;
  float soilMoistureValue;
  float angleX, angleY;
  String riskLevel;
  bool alertTrigger;
  
  readAllSensorsData(rainValue, soilMoistureValue, a, g, temp);
  
  // Calculate tilt angles in degrees
  angleX = atan2(a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  angleY = atan2(a.acceleration.y, sqrt(a.acceleration.x * a.acceleration.x + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  sendDataToFirebase(a, g, temp, angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  
  // Cycle through different sensor data on LCD
  static unsigned long lastDisplayToggle = 0;
  static int displayState = 0;
  
  if (millis() - lastDisplayToggle > 3000) { // Update every 3 seconds
    lastDisplayToggle = millis();
    displayState = (displayState + 1) % 3;
    String status = "Sensor Data\n";    
    switch(displayState) {
      case 0:
      status += "Tilt: X:%.1f Y:%.1f", angleX, angleY;
      break;
      case 1:
      status += "Rain:%.1f%%", rainValue*100;
      break;
      case 2:
      status += "Soil:%.1f%%", soilMoistureValue*100;
      break;
    }
    writeLCD(status);
  }

  // Check for new Telegram messages
  checkNewMessages();
  
  delay(200); // Sample frequently for better vibration detection
}