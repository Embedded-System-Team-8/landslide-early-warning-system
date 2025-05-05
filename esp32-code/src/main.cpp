#include <FirebaseESP32.h>
#include <WiFi.h>
#include <ESP32Servo.h>
#include <Adafruit_MPU6050.h> 
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define RAIN_SENSOR 27
#define SERVO_PIN_1 26
#define SERVO_PIN_2 33
#define SOIL_MOISTURE 34
#define BUZZER_PIN 25

const char* ssid = "gg";
const char* password = "12345678";
FirebaseConfig config;
FirebaseAuth auth;
FirebaseData firebaseData;

const int buzzerPin = 25;
const int ledcChannel = 0;    
const int resolution = 8;     

Servo servo1;
Servo servo2;
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

float readRainSensor() {
  float rainValue = 1 - (analogReadRaw(RAIN_SENSOR) / 4095.0);
  Serial.print("Rainfall: ");
  Serial.println(rainValue * 100);
  return rainValue;
}

int readSoilMoistureSensor() {
  int soilMoistureValue = analogReadRaw(SOIL_MOISTURE);
  Serial.print("Soil Moisture: ");
  Serial.println(map(soilMoistureValue, 0, 4095, 100, 0));
  return soilMoistureValue;
}

void readMPU6050Data(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Acceleration X[g]=");
  Serial.print(a.acceleration.x);
  Serial.print(" Y[g]=");
  Serial.print(a.acceleration.y);
  Serial.print(" Z[g]=");
  Serial.print(a.acceleration.z);
  Serial.print(" | Gyro X[d/s]=");
  Serial.print(g.gyro.x);
  Serial.print(" Y[d/s]=");
  Serial.print(g.gyro.y);
  Serial.print(" Z[d/s]=");
  Serial.print(g.gyro.z);
  Serial.print(" | Accel_range=");
  Serial.print(mpu.getAccelerometerRange());
  Serial.print(" Gyro_range=");
  Serial.println(mpu.getGyroRange());
  
  // Serial.print("Temperature: "); Serial.println(temp.temperature);
}

void readSensorData(float &rainValue, int &soilMoistureValue, sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  rainValue = readRainSensor();
  soilMoistureValue = readSoilMoistureSensor();
  readMPU6050Data(a, g, temp);
}

void calculateTiltAngles(sensors_event_t &a, float &angleX, float &angleY) {
  angleX = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
  angleY = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + 
                a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
}

void determineRiskLevel(float angleX, float angleY, int soilMoistureValue, float rainValue, 
                       String &riskLevel, bool &alertTrigger) {
  int mappedMoisture = map(soilMoistureValue, 0, 4095, 100, 0);
  float rainPercentage = rainValue * 100;
  
  riskLevel = "safe";
  alertTrigger = false;
  
  if ((abs(angleX) > 15 || abs(angleY) > 15) && mappedMoisture > 80 && rainPercentage > 50) {
    riskLevel = "danger";
    alertTrigger = true;
  } else if ((abs(angleX) > 10 || abs(angleY) > 10) || mappedMoisture > 70 || rainPercentage > 30) {
    riskLevel = "warning";
    alertTrigger = false;
  }
}

void sendDataToFirebase(sensors_event_t &a, sensors_event_t &temp, float angleX, float angleY, 
                       int soilMoistureValue, float rainValue, String riskLevel, bool alertTrigger,  sensors_event_t &g) {
  if (!Firebase.ready()) return;
  
  String path = "/";
  FirebaseJson jsonData;
  FirebaseJson sensorsJson;
  FirebaseJson accelJson;
  FirebaseJson gyroJson;
  FirebaseJson tiltJson;
  FirebaseJson statusJson;
  

  
  accelJson.set("x", a.acceleration.x);
  accelJson.set("y", a.acceleration.y);
  accelJson.set("z", a.acceleration.z);
  sensorsJson.set("accelerometer", accelJson);

  gyroJson.set("x", g.gyro.x);
  gyroJson.set("y", g.gyro.y);
  gyroJson.set("z", g.gyro.z);
  sensorsJson.set("gyro", gyroJson);
  
  sensorsJson.set("soilMoisture", map(soilMoistureValue, 0, 4095, 100, 0));
  sensorsJson.set("rainfall", rainValue * 100);
  sensorsJson.set("temperature", temp.temperature);
  jsonData.set("sensors", sensorsJson);
  
  statusJson.set("landslideRisk", riskLevel);
  statusJson.set("alertTriggered", alertTrigger);
  jsonData.set("status", statusJson);
  
  if (Firebase.setJSON(firebaseData, path, jsonData)) {
    Serial.println("Data sent successfully to Firebase");
  } else {
    Serial.println("Failed to send data to Firebase");
    Serial.println(firebaseData.errorReason());
  }
}

void setup() {
  Serial.begin(115200);
  setupWiFi();
  setupFirebase();
  setupMPU6050();

  ledcSetup(ledcChannel, 2000, resolution);  
  ledcAttachPin(buzzerPin, ledcChannel);

  pinMode(RAIN_SENSOR, INPUT);
  pinMode(SOIL_MOISTURE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  servo1.setPeriodHertz(50);
  servo1.attach(SERVO_PIN_1, 500, 2400);
  servo1.write(60);
  servo2.setPeriodHertz(50);
  servo2.attach(SERVO_PIN_2, 500, 2400);
  servo2.write(60);
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
}

int firebaseCountdown = 2;

void loop() {
  float rainValue;
  int soilMoistureValue;
  sensors_event_t a, g, temp;
  float angleX, angleY;
  String riskLevel;
  bool alertTrigger;
  ledcWriteTone(ledcChannel, 1000);
  
  // read sensor data every 10ms
  readSensorData(rainValue, soilMoistureValue, a, g, temp);
  
  // send to database every 100ms
  if (firebaseCountdown == 0) {
    firebaseCountdown = 10;
    calculateTiltAngles(a, angleX, angleY);
    determineRiskLevel(angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
    sendDataToFirebase(a, temp, angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger, g);
  } else {
    firebaseCountdown--;
  }

  delay(50);
}

