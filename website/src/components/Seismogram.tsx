import React, { useState, useEffect, useRef } from "react"
import { useSensorData } from "../hooks/useSensorData"
import { SensorData } from "../lib/firebase"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Gyro3D } from "./Gyro3D"

// export interface SeismogramProps {

// }

interface ChartData {
    time: string
    timestamp: number
    x: number
    y: number
    z: number
}

export const Seismogram: React.FC /*<SeismogramProps>*/ = () => {
    const { sensorData, loading, error } = useSensorData()
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [domain, setDomain] = useState<[number, number]>([0, 0])
    const initialRenderRef = useRef(true)

    useEffect(() => {
        if (sensorData) {
            const now = new Date()
            const currentTimestamp = now.getTime()

            // Format waktu menjadi HH:MM:SS
            const formatTime = (date: Date) => {
                return date.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
            }

            const newDataPoint: ChartData = {
                time: formatTime(now),
                timestamp: currentTimestamp,
                x: sensorData.sensors.accelerometer.x,
                y: sensorData.sensors.accelerometer.y,
                z: sensorData.sensors.accelerometer.z,
            }

            setChartData((prevData) => {
                let updatedData = [...prevData, newDataPoint]

                // Simpan maksimal 100 data point
                updatedData = updatedData.slice(-100)

                // Update the domain for the moving window effect
                if (updatedData.length > 0) {
                    const oldest = updatedData[0].timestamp
                    const newest = updatedData[updatedData.length - 1].timestamp

                    // Set the domain to show the time range of visible data points
                    setDomain([oldest, newest])
                }

                return updatedData
            })
        }
    }, [sensorData])

    if (loading)
        return (
            <div className="flex place-content-center items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Memuat data...</span>
            </div>
        )
    if (error) return <div>Error: {error}</div>
    if (!sensorData) return <div>Data tidak tersedia</div>

    return (
        <div className="p-4 w-full flex flex-col gap-8">
            <div className="flex gap-8">
                {/* Grafik Accelerometer */}
                <div className="grow h-64 mb-6">
                    <h2 className="text-sm font-semibold mb-4 text-center">Seismogram</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                domain={domain}
                                allowDataOverflow
                                tickFormatter={(timestamp) => {
                                    const date = new Date(timestamp)
                                    return date.toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: false,
                                    })
                                }}
                                angle={-60}
                                interval="preserveStartEnd"
                                minTickGap={50}
                                scale="time"
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(timestamp) =>
                                    `Waktu: ${new Date(timestamp).toLocaleTimeString("id-ID")}`
                                }
                                formatter={(value: number, name: string) => [`${value.toFixed(2)} m/s`, name]}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="x"
                                stroke="#ef4444"
                                name="Sumbu X"
                                dot={false}
                                isAnimationActive={false}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="y"
                                stroke="#22c55e"
                                name="Sumbu Y"
                                dot={false}
                                isAnimationActive={false}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="z"
                                stroke="#3b82f6"
                                name="Sumbu Z"
                                dot={false}
                                isAnimationActive={false}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-fit grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                        <h3 className="font-semibold mb-2">Accelerometer</h3>
                        <p>X: {sensorData.sensors.accelerometer.x.toFixed(2)} m/s</p>
                        <p>Y: {sensorData.sensors.accelerometer.y.toFixed(2)} m/s</p>
                        <p>Z: {sensorData.sensors.accelerometer.z.toFixed(2)} m/s</p>
                    </div>

                    <div className="p-4 border rounded">
                        <h3 className="font-semibold mb-2">Gyroscope</h3>
                        <p>X: {sensorData.sensors.gyro.x.toFixed(2)} rad/s</p>
                        <p>Y: {sensorData.sensors.gyro.y.toFixed(2)} rad/s</p>
                        <p>Z: {sensorData.sensors.gyro.z.toFixed(2)} rad/s</p>
                    </div>

                    <div className="p-4 border rounded">
                        <h3 className="font-semibold mb-2">Kondisi Lingkungan</h3>
                        <p>Kelembaban Tanah: {sensorData.sensors.soilMoisture.toFixed(1)}%</p>
                        <p>Curah Hujan: {sensorData.sensors.rainfall.toFixed(1)} mm</p>
                        <p>Suhu: {sensorData.sensors.temperature.toFixed(1)}°C</p>
                    </div>

                    <div className="p-4 border rounded">
                        <h3 className="font-semibold mb-2">Status</h3>
                        <p>
                            Risiko Longsor:
                            <span
                                className={`ml-2 px-2 py-1 rounded ${
                                    sensorData.status.landslideRisk === "warning"
                                        ? "bg-yellow-200"
                                        : sensorData.status.landslideRisk === "danger"
                                        ? "bg-red-200"
                                        : "bg-green-200"
                                }`}
                            >
                                {sensorData.status.landslideRisk}
                            </span>
                        </p>
                        <p>Alert: {sensorData.status.alertTriggered ? "Aktif" : "Tidak Aktif"}</p>
                    </div>
                    <div className="text-sm text-center w-full text-gray-500">
                        {/* Terakhir diperbarui: {new Date(sensorData.timestamp).toLocaleString()} */}
                    </div>
                </div>
            </div>

            <Gyro3D />
        </div>
    )
}
