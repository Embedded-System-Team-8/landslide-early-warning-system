#include "wifi_module.h"
#include <WiFi.h>
#include <Arduino.h>
#include "config.h"

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
}
