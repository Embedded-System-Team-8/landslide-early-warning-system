#include <FirebaseESP32.h>
#include <WiFi.h>
#include <ESP32Servo.h>
#include <Adafruit_MPU6050.h> 
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define RAIN_SENSOR 35
#define SERVO_PIN_1 26
#define SERVO_PIN_2 27  // Second servo pin
#define SOIL_MOISTURE 34
#define BUZZER_PIN 25
#define LCD_ADDR 0x27  // I2C address for most common LCD modules
#define LCD_COLS 16
#define LCD_ROWS 2

// Vibration detection thresholds based on RMS acceleration
#define VIBRATION_SAFE_THRESHOLD 0.5      // Below 0.5 m/s² is considered stable
#define VIBRATION_WARNING_THRESHOLD 1.0   // Between 0.5-1.0 m/s² is light vibration
#define VIBRATION_SAMPLES 20              // Number of samples for RMS calculation

const char* ssid = "gg";
const char* password = "12345678";
FirebaseConfig config;
FirebaseAuth auth;
FirebaseData firebaseData;

Servo servo1;
Servo servo2;  // Second servo
Adafruit_MPU6050 mpu;
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

// Vibration detection variables
float vibrationBuffer[VIBRATION_SAMPLES][3]; // Store x,y,z accelerations
int vibrationIndex = 0;
float vibrationRMS = 0.0;

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  Serial.println(WiFi.localIP());
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

// Function to scan for I2C devices and show their addresses
void scanI2CDevices() {
  byte error, address;
  int nDevices = 0;
  
  Serial.println("Scanning for I2C devices...");
  
  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) {
        Serial.print("0");
      }
      Serial.println(address, HEX);
      nDevices++;
      
      if (address == 0x68 || address == 0x69) {
        Serial.println("This is likely the MPU6050");
      }
    }
  }
  
  if (nDevices == 0) {
    Serial.println("No I2C devices found! Check your wiring.");
  } else {
    Serial.printf("Found %d I2C devices\n", nDevices);
  }
}

bool mpuAvailable = false; // Global flag to track MPU6050 availability

void setupMPU6050() {
  // Start I2C communication - try both standard and alternative pins
  Wire.begin(); // Default SDA=21, SCL=22 for ESP32
  
  // First, scan the I2C bus to see what's connected
  scanI2CDevices();
  
  // Try to initialize the MPU6050
  Serial.println("Trying to initialize MPU6050...");
  
  // Try standard address 0x68
  if (mpu.begin(0x68)) {
    mpuAvailable = true;
    Serial.println("MPU6050 Found at address 0x68!");
  }
  // If that fails, try alternative address 0x69
  else if (mpu.begin(0x69)) {
    mpuAvailable = true;
    Serial.println("MPU6050 Found at address 0x69!");
  }
  // If still not found, show error but continue
  else {
    mpuAvailable = false;
    Serial.println("Failed to find MPU6050 chip. Continuing without vibration detection.");
    Serial.println("Check your connections:");
    Serial.println("- MPU6050 VCC to ESP32 3.3V");
    Serial.println("- MPU6050 GND to ESP32 GND");
    Serial.println("- MPU6050 SCL to ESP32 GPIO 21");
    Serial.println("- MPU6050 SDA to ESP32 GPIO 22");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("MPU6050 Error!");
    lcd.setCursor(0, 1);
    lcd.print("Check wiring");
    delay(3000);
    return;
  }

  // If we're here, the MPU6050 was found
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  // Initialize vibration buffer with zeros
  for (int i = 0; i < VIBRATION_SAMPLES; i++) {
    vibrationBuffer[i][0] = 0;
    vibrationBuffer[i][1] = 0;
    vibrationBuffer[i][2] = 0;
  }
  
  delay(100);
}

void setupLCD() {
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System starting");
  lcd.setCursor(0, 1);
  lcd.print("Please wait...");
  delay(2000);
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
  // Check if MPU6050 is available
  if (mpuAvailable) {
    // Try to get data from MPU
    if (!mpu.getEvent(&a, &g, &temp)) {
      // If reading fails, set default values and return
      Serial.println("Failed to read from MPU6050");
      a.acceleration.x = 0;
      a.acceleration.y = 0;
      a.acceleration.z = 9.8; // Gravity
      g.gyro.x = 0;
      g.gyro.y = 0; 
      g.gyro.z = 0;
      temp.temperature = 25.0; // Room temperature default
      vibrationRMS = 0;
      return;
    }
    
    // Add values to vibration buffer (after removing gravity component)
    vibrationBuffer[vibrationIndex][0] = a.acceleration.x;
    vibrationBuffer[vibrationIndex][1] = a.acceleration.y;
    vibrationBuffer[vibrationIndex][2] = a.acceleration.z - 9.8; // Remove gravity
    
    vibrationIndex = (vibrationIndex + 1) % VIBRATION_SAMPLES;
    
    // Calculate RMS of acceleration
    float sumOfSquares = 0;
    for (int i = 0; i < VIBRATION_SAMPLES; i++) {
      sumOfSquares += vibrationBuffer[i][0] * vibrationBuffer[i][0];
      sumOfSquares += vibrationBuffer[i][1] * vibrationBuffer[i][1];
      sumOfSquares += vibrationBuffer[i][2] * vibrationBuffer[i][2];
    }
    vibrationRMS = sqrt(sumOfSquares / (VIBRATION_SAMPLES * 3));
  }
  else {
    // MPU6050 not available, set default values
    a.acceleration.x = 0;
    a.acceleration.y = 0;
    a.acceleration.z = 9.8; // Gravity
    g.gyro.x = 0;
    g.gyro.y = 0;
    g.gyro.z = 0;
    temp.temperature = 25.0; // Room temperature default
    vibrationRMS = 0;
  }
}

void readSensorData(float &rainValue, float &soilMoistureValue, sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  rainValue = readRainSensor();
  soilMoistureValue = readSoilMoistureSensor();
  readMPU6050Data(a, g, temp);

  Serial.printf("AX: %.2f, AY: %.2f, AZ: %.2f | GX: %.2f, GY: %.2f, GZ: %.2f | T: %.2f | R: %.2f | M: %.2f | VIB: %.2f \n", 
               a.acceleration.x, a.acceleration.y, a.acceleration.z, 
               g.gyro.x, g.gyro.y, g.gyro.z, 
               temp.temperature, rainValue, soilMoistureValue, vibrationRMS); 
}

// Function to identify soil condition based on moisture
String getSoilCondition(float soilMoistureValue) {
  float moisture = soilMoistureValue * 100;
  
  if (moisture < 30) {
    return "Kering";
  } else if (moisture >= 30 && moisture < 70) {
    return "Lembab";
  } else {
    return "Basah";
  }
}

// Function to identify vibration status
String getVibrationStatus(float vibrationRMS) {
  if (vibrationRMS < VIBRATION_SAFE_THRESHOLD) {
    return "Stabil";
  } else if (vibrationRMS < VIBRATION_WARNING_THRESHOLD) {
    return "Ringan";
  } else {
    return "Signifikan";
  }
}

void determineRiskLevel(float angleX, float angleY, float soilMoistureValue, float rainValue, 
                       String &riskLevel, bool &alertTrigger) {
  float integerMoisture = soilMoistureValue * 100;  // Convert to percentage
  float integerRain = rainValue * 100;              // Convert to percentage
  float tiltAngle = max(abs(angleX), abs(angleY));  // Use the maximum tilt angle
  String soilCondition = getSoilCondition(soilMoistureValue);
  String vibrationStatus = getVibrationStatus(vibrationRMS);
  
  // Default to safe
  riskLevel = "safe";
  alertTrigger = false;
  
  // Safe/Aman condition
  if (tiltAngle <= 5.0 && 
      integerMoisture < 30 && // Dry soil
      integerRain < 20 && 
      vibrationRMS < VIBRATION_SAFE_THRESHOLD) {
    riskLevel = "safe";
    alertTrigger = false;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Status: Kondisi");
    lcd.setCursor(0, 1);
    lcd.print("tanah aman");
    
    servo1.write(0);  // Servo1 at 0 degrees for safe condition
    servo2.write(0);  // Servo2 at 0 degrees for safe condition
    activateBuzzer(false);
  }
  // Warning/Waspada condition
  else if ((tiltAngle > 5.0 && tiltAngle <= 15.0) || 
          (integerMoisture >= 30 && integerMoisture < 70) || // Moist soil
          (integerRain >= 20 && integerRain < 30) || 
          (vibrationRMS >= VIBRATION_SAFE_THRESHOLD && vibrationRMS < VIBRATION_WARNING_THRESHOLD)) {
    riskLevel = "warning";
    alertTrigger = false;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Status: Kondisi");
    lcd.setCursor(0, 1);
    lcd.print("tanah waspada");
    
    servo1.write(90);  // Servo1 at 90 degrees for warning
    servo2.write(90);  // Servo2 at 90 degrees for warning
    activateBuzzer(false);
  }
  // Danger/Awas condition
  else if (tiltAngle > 15.0 || 
          integerMoisture >= 70 || // Wet soil
          integerRain >= 30 || 
          vibrationRMS >= VIBRATION_WARNING_THRESHOLD) {
    riskLevel = "danger";
    alertTrigger = true;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Status: Kondisi");
    lcd.setCursor(0, 1);
    lcd.print("tanah awas");
    
    servo1.write(180);  // Servo1 at 180 degrees for danger
    servo2.write(180);  // Servo2 at 180 degrees for danger
    activateBuzzer(true);
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
  
  // Add vibration RMS value
  sensorsJson.set("vibrationRMS", round(vibrationRMS * 100) / 100.0);
  sensorsJson.set("soilMoisture", soilMoistureValue);
  sensorsJson.set("rainfall", rainValue);
  sensorsJson.set("temperature", round(temp.temperature * 100) / 100.0);
  
  // Add tilt information
  tiltJson.set("angleX", round(angleX * 10) / 10.0);
  tiltJson.set("angleY", round(angleY * 10) / 10.0);
  tiltJson.set("maxTilt", round(max(abs(angleX), abs(angleY)) * 10) / 10.0);
  sensorsJson.set("tilt", tiltJson);
  
  jsonData.set("sensors", sensorsJson);
  
  statusJson.set("landslideRisk", riskLevel);
  statusJson.set("alertTriggered", alertTrigger);
  statusJson.set("soilCondition", getSoilCondition(soilMoistureValue));
  statusJson.set("vibrationStatus", getVibrationStatus(vibrationRMS));
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
  delay(1000); // Give serial monitor time to open
  
  // Initialize LCD first for status display
  setupLCD();
  
  // Setup I/O pins
  pinMode(RAIN_SENSOR, INPUT);
  pinMode(SOIL_MOISTURE, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Setup MPU6050 with clear status on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Initializing");
  lcd.setCursor(0, 1);
  lcd.print("MPU6050...");
  setupMPU6050();
  
  // Setup WiFi with status on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting to");
  lcd.setCursor(0, 1);
  lcd.print("WiFi...");
  setupWiFi();
  
  // Setup Firebase with status on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting to");
  lcd.setCursor(0, 1);
  lcd.print("Firebase...");
  setupFirebase();
  
  // Setup both servos
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Setting up");
  lcd.setCursor(0, 1);
  lcd.print("servos...");
  
  servo1.setPeriodHertz(50);
  servo2.setPeriodHertz(50);
  servo1.attach(SERVO_PIN_1, 500, 2400);
  servo2.attach(SERVO_PIN_2, 500, 2400);
  servo1.write(0);
  servo2.write(0);
  
  // System ready message
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System ready!");
  delay(2000);
}

void loop() {
  sensors_event_t a, g, temp;
  float rainValue;
  float soilMoistureValue;
  float angleX, angleY;
  String riskLevel;
  bool alertTrigger;
  
  // Calculate tilt angles from accelerometer data
  readSensorData(rainValue, soilMoistureValue, a, g, temp);
  
  // Calculate tilt angles in degrees
  angleX = atan2(a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  angleY = atan2(a.acceleration.y, sqrt(a.acceleration.x * a.acceleration.x + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  
  determineRiskLevel(angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  sendDataToFirebase(a, g, temp, angleX, angleY, soilMoistureValue, rainValue, riskLevel, alertTrigger);
  
  // Cycle through different sensor data on LCD
  static unsigned long lastDisplayToggle = 0;
  static int displayState = 0;
  
  if (millis() - lastDisplayToggle > 3000) { // Update every 3 seconds
    lastDisplayToggle = millis();
    displayState = (displayState + 1) % 3;
    
    // Keep first line with status, update second line
    lcd.setCursor(0, 1);
    lcd.print("                "); // Clear second line
    lcd.setCursor(0, 1);
    
    switch(displayState) {
      case 0:
        lcd.printf("Tilt:%d Vib:%.1f", (int)max(abs(angleX), abs(angleY)), vibrationRMS);
        break;
      case 1:
        lcd.printf("Rain:%.1f%%", rainValue*100);
        break;
      case 2:
        lcd.printf("Soil:%.1f%%", soilMoistureValue*100);
        break;
    }
  }
  
  delay(200); // Sample frequently for better vibration detection
}
