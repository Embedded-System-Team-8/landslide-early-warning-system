#include <Arduino.h>
#pragma once

void setupTelegram();
void checkNewMessages();
void replyNewMessages(int numNewMessages);
String getFormattedSensorData();