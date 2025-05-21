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
  // Sensor data reading and processing
  sensors_event_t a, g, temp;
  float rainValue;
  float soilMoistureValue;
  float angleX, angleY;
  readAllSensorsData(rainValue, soilMoistureValue, a, g, temp);
  
  // Calculate tilt angles in degrees
  angleX = atan2(a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  angleY = atan2(a.acceleration.y, sqrt(a.acceleration.x * a.acceleration.x + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  
  // Determine risk level and alert trigger
  String riskLevel;
  bool alertTrigger;
  determineRiskLevel(angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  
  // Cycle through different sensor data on LCD
  static unsigned long lastDisplayToggle = 0;
  static unsigned long lastFirebaseUpload = 0;
  static int displayState = 0;
  unsigned int mil = millis();
  
  // setiap 0.2 detik
  if (mil - lastFirebaseUpload > 180) {
    sendDataToFirebase(a, g, temp, angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  }

  // Check for new Telegram messages
  // DISABLED: Telegram sending from backend
  // checkNewMessages(&riskLevel, alertTrigger);
  // sendSubscriptionStatusIfNeeded();
  
  delay(50); // Sample frequently for better vibration detection
}