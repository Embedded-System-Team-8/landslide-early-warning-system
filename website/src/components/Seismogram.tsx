import React, { useState, useEffect } from "react"
import { useSensorData } from "../hooks/useSensorData"
import { SensorData } from "../lib/firebase"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SeismogramProps {
    deviceId: string
}

interface ChartData {
    time: string
    x: number
    y: number
    z: number
}

export const Seismogram: React.FC<SeismogramProps> = ({ deviceId }) => {
    const { sensorData, loading, error } = useSensorData(deviceId)
    const [chartData, setChartData] = useState<ChartData[]>([])

    useEffect(() => {
        if (sensorData) {
            const newDataPoint: ChartData = {
                time: new Date(sensorData.timestamp).toLocaleTimeString(),
                x: sensorData.sensors.accelerometer.x,
                y: sensorData.sensors.accelerometer.y,
                z: sensorData.sensors.accelerometer.z,
            }

            setChartData((prevData) => {
                const updatedData = [...prevData, newDataPoint]
                // Simpan maksimal 100 data point untuk timeframe yang lebih lebar
                return updatedData.slice(-100)
            })
        }
    }, [sensorData])

    if (loading) return <div>Memuat data...</div>
    if (error) return <div>Error: {error}</div>
    if (!sensorData) return <div>Data tidak tersedia</div>

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Data Seismogram - {deviceId}</h2>

            {/* Grafik Accelerometer */}
            <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" interval="preserveStartEnd" minTickGap={20} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="x"
                            stroke="#ef4444"
                            name="Sumbu X"
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="y"
                            stroke="#22c55e"
                            name="Sumbu Y"
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="z"
                            stroke="#3b82f6"
                            name="Sumbu Z"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Accelerometer</h3>
                    <p>X: {sensorData.sensors.accelerometer.x.toFixed(2)}</p>
                    <p>Y: {sensorData.sensors.accelerometer.y.toFixed(2)}</p>
                    <p>Z: {sensorData.sensors.accelerometer.z.toFixed(2)}</p>
                </div>

                <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Tilt</h3>
                    <p>Angle X: {sensorData.sensors.tilt.angleX.toFixed(2)}°</p>
                    <p>Angle Y: {sensorData.sensors.tilt.angleY.toFixed(2)}°</p>
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
            </div>

            <div className="mt-4 text-sm text-gray-500">
                Terakhir diperbarui: {new Date(sensorData.timestamp).toLocaleString()}
            </div>
        </div>
    )
}
