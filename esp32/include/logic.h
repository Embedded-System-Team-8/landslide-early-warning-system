#include <Arduino.h>
#pragma once

String getSoilCondition(float soilMoistureValue);
String getVibrationStatus(float vibrationRMS);
void determineRiskLevel(float angleX, float angleY, float soilMoistureValue, float rainValue, 
                       String &riskLevel, bool &alertTrigger);