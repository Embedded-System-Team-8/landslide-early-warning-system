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
    const [chartDataGyro, setChartDataGyro] = useState<ChartData[]>([])
    const [domainGyro, setDomainGyro] = useState<[number, number]>([0, 0])
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
            const newGyroPoint: ChartData = {
                time: formatTime(now),
                timestamp: currentTimestamp,
                x: sensorData.sensors.gyro.x,
                y: sensorData.sensors.gyro.y,
                z: sensorData.sensors.gyro.z,
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
            setChartDataGyro((prevData) => {
                let updatedData = [...prevData, newGyroPoint]
                updatedData = updatedData.slice(-100)
                if (updatedData.length > 0) {
                    const oldest = updatedData[0].timestamp
                    const newest = updatedData[updatedData.length - 1].timestamp
                    setDomainGyro([oldest, newest])
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
        <div className="p-2 sm:p-4 w-full flex flex-col gap-8">
            {/* Row 1: Graphs side by side */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 h-64 mb-2 min-w-0">
                    <h2 className="text-sm font-semibold mb-4 text-center">Accelerometer</h2>
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
                <div className="flex-1 h-64 mb-2 min-w-0">
                    <h2 className="text-sm font-semibold mb-4 text-center">Gyroscope</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataGyro}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                domain={domainGyro}
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
                                formatter={(value: number, name: string) => [`${value.toFixed(2)} rad/s`, name]}
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
            </div>

            {/* Row 2: Details/cards side by side */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full md:w-64 p-4 border rounded mb-2 md:mb-0">
                    <h3 className="font-semibold mb-2">Accelerometer</h3>
                    <p>X: {sensorData.sensors.accelerometer.x.toFixed(2)} m/s</p>
                    <p>Y: {sensorData.sensors.accelerometer.y.toFixed(2)} m/s</p>
                    <p>Z: {sensorData.sensors.accelerometer.z.toFixed(2)} m/s</p>
                </div>
                <div className="flex-1 w-full md:w-64 p-4 border rounded">
                    <h3 className="font-semibold mb-2">Gyroscope</h3>
                    <p>X: {sensorData.sensors.gyro.x.toFixed(2)} rad/s</p>
                    <p>Y: {sensorData.sensors.gyro.y.toFixed(2)} rad/s</p>
                    <p>Z: {sensorData.sensors.gyro.z.toFixed(2)} rad/s</p>
                </div>
            </div>

            <div className="gap-4 text-center w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto">
                <h2 className="font-semibold text-lg ">Device Rotation</h2>
                <div className="rounded-lg overflow-clip shadow-lg w-full aspect-square">
                    <Gyro3D />
                </div>
            </div>
        </div>
    )
}
