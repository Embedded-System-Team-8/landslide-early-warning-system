#include <Arduino.h>
#pragma once
void setupActuators();
void setupLCD();
void writeLCD(const String& message);
void setupServo();
void writeServo1(int angle);
void writeServo2(int angle);
void activateBuzzer(bool state);
extern class LiquidCrystal_I2C lcd;
extern class Servo servo1;
extern class Servo servo2;
