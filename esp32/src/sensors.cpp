#include "sensors.h"
#include <Wire.h>
#include <math.h>
#include <Arduino.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define RAIN_SENSOR 35
#define SOIL_MOISTURE 33
#define VIBRATION_SAMPLES 20

Adafruit_MPU6050 mpu;
bool mpuAvailable = false;
float vibrationBuffer[VIBRATION_SAMPLES][3];
int vibrationIndex = 0;
float vibrationRMS = 0.0;

// Soil moisture calibration values
const int DRY_SOIL_VALUE = 2650;
const int WET_SOIL_VALUE = 0;

float getVibrationRMS() {
  return vibrationRMS;
}

void scanI2CDevices() {
    Serial.println("Scanning I2C devices...");
    byte error, address;
    int nDevices = 0;
    for (address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        error = Wire.endTransmission();
        if (error == 0) {
            Serial.print("I2C device found at address 0x");
            Serial.println(address, HEX);
            nDevices++;
        }
    }
    Serial.println();
}

void setupSensors() {
  pinMode(RAIN_SENSOR, INPUT);
  pinMode(SOIL_MOISTURE, INPUT);
}

void setupMPU6050() {
  Wire.begin();
  scanI2CDevices();
  if (mpu.begin(0x68)) {
    mpuAvailable = true;
  } else if (mpu.begin(0x69)) {
    mpuAvailable = true;
  } else {
    mpuAvailable = false;
    return;
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  for (int i = 0; i < VIBRATION_SAMPLES; i++) {
    vibrationBuffer[i][0] = 0;
    vibrationBuffer[i][1] = 0;
    vibrationBuffer[i][2] = 0;
  }
}

float readRainSensor() {
  int rainValue = analogRead(RAIN_SENSOR);
  float calibratedValue = map(rainValue, 4095, 0, 0, 100);
  return calibratedValue / 100.0;
}

float readSoilMoistureSensor() {
  int soilMoistureValue = analogRead(SOIL_MOISTURE);
  float calibratedValue = map(soilMoistureValue, DRY_SOIL_VALUE, WET_SOIL_VALUE, 0, 100);
  calibratedValue = constrain(calibratedValue, 0, 100);
  return calibratedValue / 100.0;
}

void readMPU6050Data(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  if (mpuAvailable) {
    if (!mpu.getEvent(&a, &g, &temp)) {
      a.acceleration.x = 0;
      a.acceleration.y = 0;
      a.acceleration.z = 9.8;
      g.gyro.x = 0;
      g.gyro.y = 0;
      g.gyro.z = 0;
      temp.temperature = 25.0;
      vibrationRMS = 0;
      return;
    }
    vibrationBuffer[vibrationIndex][0] = a.acceleration.x;
    vibrationBuffer[vibrationIndex][1] = a.acceleration.y;
    vibrationBuffer[vibrationIndex][2] = a.acceleration.z - 9.8;
    vibrationIndex = (vibrationIndex + 1) % VIBRATION_SAMPLES;
    float sumOfSquares = 0;
    for (int i = 0; i < VIBRATION_SAMPLES; i++) {
      sumOfSquares += vibrationBuffer[i][0] * vibrationBuffer[i][0];
      sumOfSquares += vibrationBuffer[i][1] * vibrationBuffer[i][1];
      sumOfSquares += vibrationBuffer[i][2] * vibrationBuffer[i][2];
    }
    vibrationRMS = sqrt(sumOfSquares / (VIBRATION_SAMPLES * 3));
  } else {
    a.acceleration.x = 0;
    a.acceleration.y = 0;
    a.acceleration.z = 9.8;
    g.gyro.x = 0;
    g.gyro.y = 0;
    g.gyro.z = 0;
    temp.temperature = 25.0;
    vibrationRMS = 0;
  }
}

void readAllSensorsData(float &rainValue, float &soilMoistureValue, sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp) {
  rainValue = readRainSensor();
  soilMoistureValue = readSoilMoistureSensor();
  readMPU6050Data(a, g, temp);

  Serial.printf("AX: %.2f, AY: %.2f, AZ: %.2f | GX: %.2f, GY: %.2f, GZ: %.2f | T: %.2f | R: %.2f | M: %.2f | VIB: %.2f \n", 
               a.acceleration.x, a.acceleration.y, a.acceleration.z, 
               g.gyro.x, g.gyro.y, g.gyro.z, 
               temp.temperature, rainValue, soilMoistureValue, vibrationRMS); 
}