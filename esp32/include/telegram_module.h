#include <Arduino.h>
#pragma once

void setupTelegram();
void sendSubscriptionStatusIfNeeded();
String getFormattedSensorData();
void handleSubscriptionCommands(const String& chat_id, const String& text);
void checkNewMessages(
  String *riskLevelz, 
  const bool alertTriggerz
);
void replyNewMessages(int numNewMessages);