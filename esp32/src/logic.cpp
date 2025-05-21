#include "logic.h"
#include "actuators.h"
#include "sensors.h"
#include <Arduino.h>

// Vibration detection thresholds based on RMS acceleration
#define VIBRATION_SAFE_THRESHOLD 0.5      // Below 0.5 m/s² is considered stable
#define VIBRATION_WARNING_THRESHOLD 1.0   // Between 0.5-1.0 m/s² is light vibration

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

String getVibrationStatus(float vibrationRMS) {
  if (vibrationRMS < VIBRATION_SAFE_THRESHOLD) {
    return "Stabil";
  } else if (vibrationRMS < VIBRATION_WARNING_THRESHOLD) {
    return "Ringan";
  } else {
    return "Signifikan";
  }
}

void determineRiskLevel(
  float angleX, 
  float angleY, 
  float soilMoistureValue, 
  float rainValue,
  String &riskLevel, 
  bool &alertTrigger
) {
  float integerMoisture = soilMoistureValue * 100;  // Convert to percentage
  float integerRain = rainValue * 100;              // Convert to percentage
  float tiltAngle = max(abs(angleX), abs(angleY));  // Use the maximum tilt angle
  float vibrationRMS = getVibrationRMS();           // Get the RMS value for vibration
  String soilCondition = getSoilCondition(soilMoistureValue);
  String vibrationStatus = getVibrationStatus(vibrationRMS);
  String status = "";
  
  // Default to safe
  riskLevel = "safe";
  alertTrigger = false;
  
  // Safe/Aman condition
  if (tiltAngle <= 10.0 && 
      integerMoisture < 30 && // Dry soil
      integerRain < 20 && 
      vibrationRMS < VIBRATION_SAFE_THRESHOLD) {
    riskLevel = "safe";
    alertTrigger = false;
    status = "tanah aman";
    writeServo1(90);
    writeServo2(90);
    activateBuzzer(false);
  }
  // Warning/Waspada condition
  else if ((tiltAngle > 5.0 && tiltAngle <= 15.0) || 
          (integerMoisture >= 30 && integerMoisture < 70) || // Moist soil
          (integerRain >= 20 && integerRain < 30) || 
          (vibrationRMS >= VIBRATION_SAFE_THRESHOLD && vibrationRMS < VIBRATION_WARNING_THRESHOLD)) {
    riskLevel = "warning";
    alertTrigger = false;

    status = "tanah waspada";
    writeServo1(90);
    writeServo2(90);
    activateBuzzer(false);
  }
  // Danger/Awas condition
  else if (tiltAngle > 15.0 || 
          integerMoisture >= 70 || // Wet soil
          integerRain >= 30 || 
          vibrationRMS >= VIBRATION_WARNING_THRESHOLD) {
    riskLevel = "danger";
    alertTrigger = true;
    status = "tanah AWAS!";
    writeServo1(0);
    writeServo2(0);
    activateBuzzer(true);
  }

    status += "\nTilt:" + String(tiltAngle, 1);
    writeLCD(status);
}