import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
    apiKey: "AIzaSyDWh86oJpll6WLrDZB2lPqIaRy83GZGkMs",
    authDomain: "landslide-system-b8dd4.firebaseapp.com",
    databaseURL: "https://landslide-system-b8dd4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "landslide-system-b8dd4",
    storageBucket: "landslide-system-b8dd4.firebasestorage.app",
    messagingSenderId: "145586828202",
    appId: "1:145586828202:web:b7e9fcf6de11a71d0431d3",
    measurementId: "G-8L91HNRPKJ",
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

// Tipe data untuk sensor
export interface SensorData {
    sensors: {
        accelerometer: {
            x: number
            y: number
            z: number
        }
        gyro: {
            x: number
            y: number
            z: number
        }
        tilt: {
            angleX: number
            angleY: number
            maxTilt: number
        }
        soilMoisture: number
        rainfall: number
        temperature: number
        vibrationRMS: number
    }
    status: {
        landslideRisk: string
        alertTriggered: boolean
    }
}
