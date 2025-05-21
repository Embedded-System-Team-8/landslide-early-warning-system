import { useState, useEffect } from "react"
import { onSnapshot, query, collection, orderBy, limit } from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { app } from "../lib/firebase"
import { SensorData, COLLECTIONS } from "../lib/firestore"

export function useSensorData(limitCount: number = 1) {
    const [sensorData, setSensorData] = useState<SensorData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const db = getFirestore(app)
        const q = query(collection(db, COLLECTIONS.SENSOR_HISTORY), orderBy("timestamp", "desc"), limit(limitCount))

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data() as SensorData
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
    }, [limitCount])

    return { sensorData, loading, error }
}
