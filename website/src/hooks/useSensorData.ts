import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { database, SensorData } from "../lib/firebase"

export function useSensorData(deviceId: string) {
    const [sensorData, setSensorData] = useState<SensorData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const sensorRef = ref(database, `/`)

        const unsubscribe = onValue(
            sensorRef,
            (snapshot) => {
                let data = snapshot.val()
                
                data.status = {
                    landslideRisk: "safe",
                    alertTriggered: false,
                }
                console.log(data)

                if (data) {
                    setSensorData(data)
                } else {
                    setError("Data tidak ditemukan")
                }
                setLoading(false)
            },
            (error) => {
                setError(error.message)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [deviceId])

    return { sensorData, loading, error }
}
