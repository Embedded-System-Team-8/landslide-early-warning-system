#pragma once
#include <FirebaseESP32.h>
#include <Adafruit_Sensor.h> // Include the header defining sensors_event_t
void setupFirebase();
void sendDataToFirebase(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp, float angleX, float angleY, float soilMoistureValue, float rainValue, String riskLevel, bool alertTrigger);
extern FirebaseData firebaseData;
