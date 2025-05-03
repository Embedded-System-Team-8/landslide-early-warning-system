#include <FirebaseESP32.h>
#include <WiFi.h>
#include <ESP32Servo.h>
#include <Adafruit_MPU6050.h> 
#include <Adafruit_Sensor.h>
#include <Wire.h>

#define RAIN_SENSOR 27
#define SERVO_PIN 25
#define SOIL_MOISTURE 34
#define BUZZER_PIN 26

const char* ssid = "AF15";
const char* password = "222ws222";
FirebaseConfig config;
FirebaseAuth auth;
FirebaseData firebaseData;

Servo jemuranServo;
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

void setup() {
  Serial.begin(115200);
  setupWiFi();
  digitalWrite(BUZZER_PIN, LOW);
  setupFirebase();
  setupMPU6050();

  pinMode(RAIN_SENSOR, INPUT);
  pinMode(SOIL_MOISTURE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  jemuranServo.setPeriodHertz(50);
  jemuranServo.attach(SERVO_PIN, 500, 2400);
  jemuranServo.write(0);
}

void activateBuzzer(bool state) {
  digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
}

void loop() {
  float rainValue = 1 - (analogRead(RAIN_SENSOR) / 4095.0);
  int soilMoistureValue = analogRead(SOIL_MOISTURE);
  jemuranServo.write(90);
  activateBuzzer(true);
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(", Y: "); Serial.print(a.acceleration.y);
  Serial.print(", Z: "); Serial.println(a.acceleration.z);
  Serial.print("Gyro X: "); Serial.print(g.gyro.x);
  Serial.print(", Y: "); Serial.print(g.gyro.y);
  Serial.print(", Z: "); Serial.println(g.gyro.z);
  Serial.print("Temperature: "); Serial.println(temp.temperature);
  
  if (Firebase.ready()) {
    String path = "/";
    FirebaseJson jsonData;
    
    // Add timestamp
    time_t now;
    time(&now);
    char timeBuffer[30];
    strftime(timeBuffer, sizeof(timeBuffer), "%Y-%m-%dT%H:%M:%S.000Z", gmtime(&now));
    jsonData.set("timestamp", timeBuffer);
    
    // Add device ID
    jsonData.set("deviceId", "sensor-001");
    
    // Create sensors object
    FirebaseJson sensorsJson;
    
    // Add accelerometer data
    FirebaseJson accelJson;
    accelJson.set("x", a.acceleration.x);
    accelJson.set("y", a.acceleration.y);
    accelJson.set("z", a.acceleration.z);
    sensorsJson.set("accelerometer", accelJson);
    
    // Calculate and add tilt angles
    float angleX = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
    float angleY = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + 
                  a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
    
    FirebaseJson tiltJson;
    tiltJson.set("angleX", angleX);
    tiltJson.set("angleY", angleY);
    sensorsJson.set("tilt", tiltJson);
    
    // Add other sensor data
    sensorsJson.set("soilMoisture", map(soilMoistureValue, 0, 4095, 100, 0));
    sensorsJson.set("rainfall", rainValue * 100);
    sensorsJson.set("temperature", temp.temperature);
    
    // Add sensors object to main JSON
    jsonData.set("sensors", sensorsJson);
    
    // Add status information
    FirebaseJson statusJson;
    
    // Simple logic for landslide risk assessment
    String riskLevel = "safe";
    bool alertTrigger = false;
    
    if ((abs(angleX) > 15 || abs(angleY) > 15) && 
        map(soilMoistureValue, 0, 4095, 100, 0) > 80 && 
        (rainValue * 100) > 50) {
      riskLevel = "danger";
      alertTrigger = true;
    } else if ((abs(angleX) > 10 || abs(angleY) > 10) || 
               map(soilMoistureValue, 0, 4095, 100, 0) > 70 || 
               (rainValue * 100) > 30) {
      riskLevel = "warning";
      alertTrigger = false;
    }
    
    statusJson.set("landslideRisk", riskLevel);
    statusJson.set("alertTriggered", alertTrigger);
    jsonData.set("status", statusJson);
    
    Serial.println("Sending data to Firebase...");
    Serial.print("Soil Moisture: ");
    Serial.println(map(soilMoistureValue, 0, 4095, 100, 0));
    Serial.print("Rainfall: ");
    Serial.println(rainValue * 100);
    
    if (Firebase.setJSON(firebaseData, path, jsonData)) {
      Serial.println("Data sent successfully to Firebase");
    } else {
      Serial.println("Failed to send data to Firebase");
      Serial.println(firebaseData.errorReason());
    }
  }
  activateBuzzer(false);
  delay(100);
}