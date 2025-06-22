#!/usr/bin/env python3
"""
Landslide Early Warning System - Data Stream Simulator
Simulates sensor data for different risk categories: aman (safe), awas (watch), waspada (alert)

# Test all risk levels
python simulate_data.py --mode test

# Single safe reading
python simulate_data.py --risk aman --mode single

# Continuous alert simulation for 5 minutes
python simulate_data.py --risk waspada --mode continuous --duration 300

# Continuous watch mode with 3-second intervals
python simulate_data.py --risk awas --mode continuous --interval 3
"""



import json
import time
import random
import math
import argparse
import sys
from datetime import datetime
from typing import Dict, Any, Tuple
import firebase_admin
from firebase_admin import credentials, db


class LandslideDataSimulator:
    """Simulates landslide monitoring sensor data with different risk levels"""
    
    def __init__(self, firebase_url: str, service_account_path: str):
        """Initialize the simulator with Firebase configuration"""
        self.firebase_url = firebase_url
        self.service_account_path = service_account_path
        self.firebase_ref = None
        
        # Risk level configurations
        self.risk_configs = {
            "aman": {
                "name": "Aman (Safe)",
                "vibration_rms": (0.15, 0.25),
                "tilt_angle": (0.0, 0.8),
                "soil_moisture": (25.0, 35.0),
                "rainfall": (0.0, 2.0),
                "temperature": (22.0, 26.0),
                "acceleration": (0.8, 1.2),
                "gyro": (0.1, 0.2),
                "alert_probability": 0.0
            },
            "awas": {
                "name": "Awas (Watch)",
                "vibration_rms": (0.5, 1.2),
                "tilt_angle": (2.0, 8.0),
                "soil_moisture": (40.0, 70.0),
                "rainfall": (5.0, 15.0),
                "temperature": (18.0, 32.0),
                "acceleration": (2.0, 5.0),
                "gyro": (0.5, 1.5),
                "alert_probability": 0.1
            },
            "waspada": {
                "name": "Waspada (Alert)",
                "vibration_rms": (1.2, 3.0),
                "tilt_angle": (8.0, 20.0),
                "soil_moisture": (70.0, 95.0),
                "rainfall": (15.0, 50.0),
                "temperature": (15.0, 35.0),
                "acceleration": (5.0, 15.0),
                "gyro": (1.5, 5.0),
                "alert_probability": 0.8
            }
        }
        
    def initialize_firebase(self):
        """Initialize Firebase connection"""
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate(self.service_account_path)
                firebase_admin.initialize_app(cred, {
                    'databaseURL': self.firebase_url
                })
            
            self.firebase_ref = db.reference('/')
            print(f"✅ Firebase initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Failed to initialize Firebase: {e}")
            return False
    
    def generate_accelerometer_data(self, config: Dict) -> Dict[str, float]:
        """Generate realistic accelerometer data"""
        base_accel = 9.81  # Earth's gravity
        noise_range = config["acceleration"]
        
        return {
            "x": round(random.uniform(-noise_range[1], noise_range[1]), 2),
            "y": round(random.uniform(-noise_range[1], noise_range[1]), 2),
            "z": round(base_accel + random.uniform(-noise_range[0], noise_range[0]), 2)
        }
    
    def generate_gyroscope_data(self, config: Dict) -> Dict[str, float]:
        """Generate realistic gyroscope data"""
        gyro_range = config["gyro"]
        
        return {
            "x": round(random.uniform(-gyro_range[1], gyro_range[1]), 2),
            "y": round(random.uniform(-gyro_range[1], gyro_range[1]), 2),
            "z": round(random.uniform(-gyro_range[1], gyro_range[1]), 2)
        }
    
    def generate_tilt_data(self, config: Dict) -> Dict[str, float]:
        """Generate realistic tilt angle data"""
        angle_range = config["tilt_angle"]
        
        angle_x = round(random.uniform(-angle_range[1], angle_range[1]), 1)
        angle_y = round(random.uniform(-angle_range[1], angle_range[1]), 1)
        max_tilt = round(max(abs(angle_x), abs(angle_y)), 1)
        
        return {
            "angleX": angle_x,
            "angleY": angle_y,
            "maxTilt": max_tilt
        }
    
    def generate_sensor_data(self, risk_level: str) -> Dict[str, Any]:
        """Generate complete sensor data for specified risk level"""
        if risk_level not in self.risk_configs:
            raise ValueError(f"Invalid risk level: {risk_level}")
        
        config = self.risk_configs[risk_level]
        
        # Generate all sensor readings
        accelerometer = self.generate_accelerometer_data(config)
        gyroscope = self.generate_gyroscope_data(config)
        tilt = self.generate_tilt_data(config)
        
        vibration_rms = round(random.uniform(*config["vibration_rms"]), 2)
        soil_moisture = round(random.uniform(*config["soil_moisture"]), 1)
        rainfall = round(random.uniform(*config["rainfall"]), 1)
        temperature = round(random.uniform(*config["temperature"]), 1)
        
        # Determine alert status
        alert_triggered = random.random() < config["alert_probability"]
        
        # Create data structure matching ESP32 format
        data = {
            "sensors": {
                "accelerometer": accelerometer,
                "gyro": gyroscope,
                "vibrationRMS": vibration_rms,
                "soilMoisture": soil_moisture,
                "rainfall": rainfall,
                "temperature": temperature,
                "tilt": tilt
            },
            "status": {
                "landslideRisk": risk_level,
                "alertTriggered": alert_triggered
            },
            "timestamp": datetime.now().isoformat(),
            "deviceId": "SIMULATOR_001"
        }
        
        return data
    
    def send_to_firebase(self, data: Dict[str, Any]) -> bool:
        """Send data to Firebase Realtime Database"""
        try:
            if self.firebase_ref is None:
                print("❌ Firebase not initialized")
                return False
            
            # Send to root path (matching ESP32 behavior)
            self.firebase_ref.set(data)
            return True
            
        except Exception as e:
            print(f"❌ Failed to send data to Firebase: {e}")
            return False
    
    def simulate_continuous_stream(self, risk_level: str, interval: float = 5.0, duration: int = None):
        """Simulate continuous data stream for specified duration"""
        print(f"🚀 Starting continuous simulation for risk level: {self.risk_configs[risk_level]['name']}")
        print(f"📊 Sending data every {interval} seconds")
        
        if duration:
            print(f"⏱️  Duration: {duration} seconds")
            end_time = time.time() + duration
        else:
            print("⏱️  Duration: Infinite (press Ctrl+C to stop)")
            end_time = None
        
        count = 0
        try:
            while True:
                if end_time and time.time() > end_time:
                    break
                
                # Generate and send data
                data = self.generate_sensor_data(risk_level)
                
                if self.send_to_firebase(data):
                    count += 1
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    risk_status = data["status"]["landslideRisk"]
                    alert_status = "🚨 ALERT" if data["status"]["alertTriggered"] else "✅ Normal"
                    tilt = data["sensors"]["tilt"]["maxTilt"]
                    vibration = data["sensors"]["vibrationRMS"]
                    
                    print(f"[{timestamp}] #{count:04d} | Risk: {risk_status.upper()} | {alert_status} | Tilt: {tilt}° | Vibration: {vibration}")
                else:
                    print(f"❌ Failed to send data #{count + 1}")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print(f"\n⏹️  Simulation stopped by user after {count} data points")
        except Exception as e:
            print(f"\n❌ Simulation error: {e}")
    
    def simulate_single_reading(self, risk_level: str):
        """Generate and send a single sensor reading"""
        print(f"📊 Generating single reading for risk level: {self.risk_configs[risk_level]['name']}")
        
        data = self.generate_sensor_data(risk_level)
        
        if self.send_to_firebase(data):
            print("✅ Data sent successfully!")
            print(json.dumps(data, indent=2))
        else:
            print("❌ Failed to send data")
    
    def test_all_risk_levels(self):
        """Test data generation for all risk levels"""
        print("🧪 Testing data generation for all risk levels...")
        
        for risk_level in self.risk_configs.keys():
            print(f"\n--- {self.risk_configs[risk_level]['name']} ---")
            data = self.generate_sensor_data(risk_level)
            
            # Print summary
            sensors = data["sensors"]
            status = data["status"]
            
            print(f"Risk Level: {status['landslideRisk']}")
            print(f"Alert: {'YES' if status['alertTriggered'] else 'NO'}")
            print(f"Max Tilt: {sensors['tilt']['maxTilt']}°")
            print(f"Vibration RMS: {sensors['vibrationRMS']}")
            print(f"Soil Moisture: {sensors['soilMoisture']}%")
            print(f"Rainfall: {sensors['rainfall']}mm")
            print(f"Temperature: {sensors['temperature']}°C")


def main():
    """Main function with command line interface"""
    parser = argparse.ArgumentParser(description="Landslide Early Warning System - Data Simulator")
    parser.add_argument("--risk", choices=["aman", "awas", "waspada"], 
                       default="aman", help="Risk level to simulate")
    parser.add_argument("--mode", choices=["single", "continuous", "test"], 
                       default="single", help="Simulation mode")
    parser.add_argument("--interval", type=float, default=5.0, 
                       help="Interval between readings (seconds)")
    parser.add_argument("--duration", type=int, 
                       help="Duration for continuous mode (seconds)")
    parser.add_argument("--firebase-url", 
                       default="https://landslide-system-b8dd4-default-rtdb.asia-southeast1.firebasedatabase.app",
                       help="Firebase Realtime Database URL")
    parser.add_argument("--service-account", 
                       default="../backend/serviceAccountKey.json",
                       help="Path to Firebase service account key")
    
    args = parser.parse_args()
    
    # Initialize simulator
    simulator = LandslideDataSimulator(args.firebase_url, args.service_account)
    
    if not simulator.initialize_firebase():
        sys.exit(1)
    
    # Run based on mode
    try:
        if args.mode == "test":
            simulator.test_all_risk_levels()
        elif args.mode == "single":
            simulator.simulate_single_reading(args.risk)
        elif args.mode == "continuous":
            simulator.simulate_continuous_stream(args.risk, args.interval, args.duration)
            
    except KeyboardInterrupt:
        print("\n👋 Simulation interrupted by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
