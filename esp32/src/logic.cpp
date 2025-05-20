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

// Function to identify vibration status
String getVibrationStatus(float vibrationRMS) {
  if (vibrationRMS < VIBRATION_SAFE_THRESHOLD) {
    return "Stabil";
  } else if (vibrationRMS < VIBRATION_WARNING_THRESHOLD) {
    return "Ringan";
  } else {
    return "Signifikan";
  }
}

void determineRiskLevel(float angleX, float angleY, float soilMoistureValue, float rainValue, 
                       String &riskLevel, bool &alertTrigger) {
  float integerMoisture = soilMoistureValue * 100;  // Convert to percentage
  float integerRain = rainValue * 100;              // Convert to percentage
  float tiltAngle = max(abs(angleX), abs(angleY));  // Use the maximum tilt angle
  float vibrationRMS = getVibrationRMS();           // Get the RMS value for vibration
  String soilCondition = getSoilCondition(soilMoistureValue);
  String vibrationStatus = getVibrationStatus(vibrationRMS);
  
  // Default to safe
  riskLevel = "safe";
  alertTrigger = false;
  
  // Safe/Aman condition
  if (tiltAngle <= 5.0 && 
      integerMoisture < 30 && // Dry soil
      integerRain < 20 && 
      vibrationRMS < VIBRATION_SAFE_THRESHOLD) {
    riskLevel = "safe";
    alertTrigger = false;

    writeLCD("Status: Kondisi\ntanah aman");
    writeServo1(90);  // Servo1 at 0 degrees for safe condition
    writeServo2(90);  // Servo2 at 0 degrees for safe condition
    activateBuzzer(false);
  }
  // Warning/Waspada condition
  else if ((tiltAngle > 5.0 && tiltAngle <= 15.0) || 
          (integerMoisture >= 30 && integerMoisture < 70) || // Moist soil
          (integerRain >= 20 && integerRain < 30) || 
          (vibrationRMS >= VIBRATION_SAFE_THRESHOLD && vibrationRMS < VIBRATION_WARNING_THRESHOLD)) {
    riskLevel = "warning";
    alertTrigger = false;

    writeLCD("Status: Kondisi\ntanah waspada");
    writeServo1(90);  // Servo1 at 90 degrees for warning
    writeServo2(90);  // Servo2 at 90 degrees for warning
    activateBuzzer(false);
  }
  // Danger/Awas condition
  else if (tiltAngle > 15.0 || 
          integerMoisture >= 70 || // Wet soil
          integerRain >= 30 || 
          vibrationRMS >= VIBRATION_WARNING_THRESHOLD) {
    riskLevel = "danger";
    alertTrigger = true;
    
    writeLCD("Status: Kondisi\ntanah awas");
    writeServo1(0);  // Servo1 at 90 degrees for danger
    writeServo2(0);  // Servo2 at 180 degrees for danger
    activateBuzzer(true);
  }
}