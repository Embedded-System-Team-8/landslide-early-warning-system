import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { database, SensorData } from "../lib/firebase"

export function useSensorData() {
    const [sensorData, setSensorData] = useState<SensorData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const sensorRef = ref(database, `/`)

        const unsubscribe = onValue(
            sensorRef,
            (snapshot) => {
                const data = snapshot.val()

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
    }, [])

    return { sensorData, loading, error }
}
