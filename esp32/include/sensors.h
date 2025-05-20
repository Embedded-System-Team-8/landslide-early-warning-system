#pragma once
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

void setupSensors();
float getVibrationRMS();
void setupMPU6050();
void readMPU6050Data(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp);
float readRainSensor();
float readSoilMoistureSensor();
void scanI2CDevices();
void readAllSensorsData(float &rainValue, float &soilMoistureValue, sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp);
extern float vibrationRMS;
extern bool mpuAvailable;