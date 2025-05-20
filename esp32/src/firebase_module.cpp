#include "firebase_module.h"
#include <FirebaseESP32.h>
#include <Arduino.h>
#include "sensors.h"

FirebaseData firebaseData;
FirebaseConfig config;
FirebaseAuth auth;

void setupFirebase() {
  config.host = "https://landslide-system-b8dd4-default-rtdb.asia-southeast1.firebasedatabase.app";
  config.signer.tokens.legacy_token = "AIzaSyDWh86oJpll6WLrDZB2lPqIaRy83GZGkMs";
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void sendDataToFirebase(sensors_event_t &a, sensors_event_t &g, sensors_event_t &temp, float &angleX, float angleY, float soilMoistureValue, float rainValue, String riskLevel, bool alertTrigger) {
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
  sensorsJson.set("vibrationRMS", round(vibrationRMS * 100) / 100.0);
  sensorsJson.set("soilMoisture", soilMoistureValue);
  sensorsJson.set("rainfall", rainValue);
  sensorsJson.set("temperature", round(temp.temperature * 100) / 100.0);
  tiltJson.set("angleX", round(angleX * 10) / 10.0);
  tiltJson.set("angleY", round(angleY * 10) / 10.0);
  tiltJson.set("maxTilt", round(max(abs(angleX), abs(angleY)) * 10) / 10.0);
  sensorsJson.set("tilt", tiltJson);
  jsonData.set("sensors", sensorsJson);
  statusJson.set("landslideRisk", riskLevel);
  statusJson.set("alertTriggered", alertTrigger);
  // Optionally add more status fields
  jsonData.set("status", statusJson);
  Firebase.setJSON(firebaseData, path, jsonData);
}
