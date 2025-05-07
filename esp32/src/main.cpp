#include <FirebaseESP32.h>
#include <WiFi.h>
#include <ESP32Servo.h>
#include <Adafruit_MPU6050.h> 
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define RAIN_SENSOR 35
#define SERVO_PIN_1 26
#define SOIL_MOISTURE 34
#define BUZZER_PIN 25

const char* ssid = "KOPEL";
const char* password = "SPREADTHEGOSPEL";
FirebaseConfig config;
FirebaseAuth auth;
FirebaseData firebaseData;

Servo servo1;
Adafruit_MPU6050 mpu;

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void setupFirebase() {
  config.host = "https://landslide-system-b8dd4-default-rtdb.asia-southeast1.firebasedatabase.app";
  config.signer.tokens.legacy_token = "AIzaSyDWh86oJpll6WLrDZB2lPqIaRy83GZGkMs";
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Initializing Firebase...");

  if (Firebase.ready()) {
    Serial.println("Firebase Connected!");
  } else {
    Serial.println("Firebase Connection Failed");
  }
}

void setupMPU6050() {
  Wire.begin();
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }

  Serial.println("MPU6050 Found!");
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  delay(100);
}

void activateBuzzer(bool state) {
  digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
}

// Returns calibrated Rain value (0-100%)
float readRainSensor() {
  int rainValue = analogRead(RAIN_SENSOR);
  Serial.println(rainValue);
  float calibratedValue = map(rainValue, 4095, 0, 0, 100);
  return calibratedValue / 100.0;
}

// Soil moisture calibration values
const int DRY_SOIL_VALUE = 2650;   // Analog reading when soil is dry
const int WET_SOIL_VALUE = 0;      // Analog reading when soil is wet 

// Returns calibrated soil moisture value (0-100%)
float readSoilMoistureSensor() {
  int soilMoistureValue = analogRead(SOIL_MOISTURE);
  Serial.println(soilMoistureValue);
  float calibratedValue = map(soilMoistureValue, DRY_SOIL_VALUE, WET_SOIL_VALUE, 0, 100);
  calibratedValue = constrain(calibratedValue, 0, 100);
  return calibratedValue / 100.0;
}

void readMPU6050Data(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  mpu.getEvent(&a, &g, &temp);
}

void readSensorData(float &rainValue, float &soilMoistureValue, sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  rainValue = readRainSensor();
  soilMoistureValue = readSoilMoistureSensor();
  readMPU6050Data(a, g, temp);

  Serial.printf("AX: %.2f, AY: %.2f, AZ: %.2f | GX: %.2f, GY: %.2f, GZ: %.2f | T: %.2f | R: %.2f | M: %.2f \n", 
               a.acceleration.x, a.acceleration.y, a.acceleration.z, 
               g.gyro.x, g.gyro.y, g.gyro.z, 
               temp.temperature, rainValue, soilMoistureValue); 
}

void determineRiskLevel(float angleX, float angleY, float soilMoistureValue, float rainValue, 
                       String &riskLevel, bool &alertTrigger) {
  float integerMoisture = soilMoistureValue * 100;
  float integerRain = rainValue * 100;
  
  riskLevel = "safe";
  alertTrigger = false;
  
  if ((abs(angleX) > 15 || abs(angleY) > 15) && integerMoisture > 80 && integerRain > 50) {
    riskLevel = "danger";
    alertTrigger = true;
  } else if ((abs(angleX) > 10 || abs(angleY) > 10) || integerMoisture > 70 || integerRain > 30) {
    riskLevel = "warning";
    alertTrigger = false;
  }
}

void sendDataToFirebase(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp, float angleX, float angleY, 
                       float soilMoistureValue, float rainValue, String riskLevel, bool alertTrigger) {
  if (!Firebase.ready()) return;
  
  String path = "/";
  FirebaseJson jsonData;
  FirebaseJson sensorsJson;
  FirebaseJson accelJson;
  FirebaseJson gyroJson;
  FirebaseJson tiltJson;
  FirebaseJson statusJson;
    
  accelJson.set("x", round(a.acceleration.x * 100) / 100.0);
  accelJson.set("y", round(a.acceleration.y * 100) / 100.0);
  accelJson.set("z", round(a.acceleration.z * 100) / 100.0);
  sensorsJson.set("accelerometer", accelJson);
  
  gyroJson.set("x", round(g.gyro.x * 100) / 100.0);
  gyroJson.set("y", round(g.gyro.y * 100) / 100.0);
  gyroJson.set("z", round(g.gyro.z * 100) / 100.0);
  sensorsJson.set("gyro", gyroJson);
  
  sensorsJson.set("soilMoisture", soilMoistureValue);
  sensorsJson.set("rainfall", rainValue);
  sensorsJson.set("temperature", round(temp.temperature * 100) / 100.0);
  jsonData.set("sensors", sensorsJson);
  
  statusJson.set("landslideRisk", riskLevel);
  statusJson.set("alertTriggered", alertTrigger);
  jsonData.set("status", statusJson);
  
  if (Firebase.setJSON(firebaseData, path, jsonData)) {
    // Serial.println("Data sent successfully to Firebase");
  } else {
    Serial.println("Failed to send data to Firebase");
    Serial.println(firebaseData.errorReason());
  }
}



void setup() {
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  Serial.begin(115200);
  setupWiFi();
  setupFirebase();
  setupMPU6050();

  pinMode(RAIN_SENSOR, INPUT);
  pinMode(SOIL_MOISTURE, INPUT);  // Changed from OUTPUT to INPUT
  pinMode(BUZZER_PIN, OUTPUT);
  servo1.setPeriodHertz(50);
  servo1.attach(SERVO_PIN_1, 500, 2400);
  servo1.write(0);
}

void loop() {
  sensors_event_t a, g, temp;
  float rainValue;
  float soilMoistureValue;
  float angleX, angleY;
  String riskLevel;
  bool alertTrigger;

  servo1.write(90);
  
  readSensorData(rainValue, soilMoistureValue, a, g, temp);
  determineRiskLevel(angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  sendDataToFirebase(a, g, temp, angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  activateBuzzer(false);
  delay(100);
}
