#include "actuators.h"
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <Arduino.h>

#define SERVO_PIN_1 26
#define SERVO_PIN_2 27
#define BUZZER_PIN 18
#define LCD_ADDR 0x27
#define LCD_COLS 16
#define LCD_ROWS 2

LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);
Servo servo1;
Servo servo2;

void setupActuators() {
  pinMode(BUZZER_PIN, OUTPUT);
  setupLCD();
  setupServo();
}

void setupLCD() {
  lcd.init();
  lcd.backlight();
  lcd.clear();
}

void writeLCD(const String& message) {
  lcd.clear();
  Serial.println("LCD Message: " + message);

  if (message.length() > LCD_COLS * LCD_ROWS + 1) {
    Serial.println("Warning: Message too long for LCD");
  }

  int line = 0;
  for (int i = 0; i < message.length(); i++) {
    if (message[i] == '\n' && line < LCD_ROWS - 1) {
      line++;
      lcd.setCursor(0, line);
    } else {
      lcd.print(message[i]);
    }
  }
}

void setupServo() {
  servo1.setPeriodHertz(50);
  servo2.setPeriodHertz(50);
  servo1.attach(SERVO_PIN_1, 500, 2400);
  servo2.attach(SERVO_PIN_2, 500, 2400);
  servo1.write(90);
  servo2.write(90);
}

void writeServo1(int angle) {
  if (angle >= 0 && angle <= 180) {
    servo1.write(angle);
  } else {
    Serial.println("Error: Angle out of range for Servo 1");
  }
}

void writeServo2(int angle) {
  if (angle >= 0 && angle <= 180) {
    servo2.write(angle);
  } else {
    Serial.println("Error: Angle out of range for Servo 2");
  }
}

void activateBuzzer(bool state) {
  digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
}
