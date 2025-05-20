#include "wifi_module.h"
#include <WiFi.h>
#include <Arduino.h>

const char* ssid = "gg";
const char* password = "12345678";

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
}
