import React, { useState, useEffect } from "react"
import { CircleAlert, Thermometer, CloudRain, Gauge, MapPin, AlertTriangle } from "lucide-react"
import StatusCard, { StatusType } from "../sensors/StatusCard"
import SensorChart from "../sensors/SensorChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Seismogram } from "../Seismogram"
import { useSensorData } from "@/hooks/useSensorData"

interface ChartDataPoint {
    time: string
    value: number
}

const Dashboard: React.FC = () => {
    const { sensorData, loading, error } = useSensorData()
    const [soilMoistureHistory, setSoilMoistureHistory] = useState<ChartDataPoint[]>([])
    const [rainfallHistory, setRainfallHistory] = useState<ChartDataPoint[]>([])
    const [temperatureHistory, setTemperatureHistory] = useState<ChartDataPoint[]>([])

    useEffect(() => {
        if (sensorData) {
            const now = new Date()
            const timeString = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            })

            // Update soil moisture history
            setSoilMoistureHistory((prev) => {
                const newData = [...prev, { time: timeString, value: sensorData.sensors.soilMoisture * 100 }]
                return newData.slice(-24) // Keep last 24 data points
            })

            // Update rainfall history
            setRainfallHistory((prev) => {
                const newData = [...prev, { time: timeString, value: sensorData.sensors.rainfall * 100 }]
                return newData.slice(-24)
            })

            // Update temperature history
            setTemperatureHistory((prev) => {
                const newData = [...prev, { time: timeString, value: sensorData.sensors.temperature }]
                return newData.slice(-24)
            })
        }
    }, [sensorData])

    return (
        <div className="p-2 sm:p-4 space-y-6">
            <h1 className="text-lg font-semibold">Dashboard Monitoring</h1>

            <StatusCard
                title="Risiko Longsor"
                value={sensorData?.status.landslideRisk ?? " - "}
                change={0}
                status={sensorData?.status.landslideRisk as StatusType}
                icon={<AlertTriangle size={24} />}
            />

            <div className="flex flex-col gap-4 w-full">
                <Card className="w-full">
                    <CardContent className="p-2">
                        <Seismogram />
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Riwayat Data Sensor</h2>

                <Tabs defaultValue="24h">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <TabsList>
                            <TabsTrigger value="24h">24 Jam</TabsTrigger>
                            <TabsTrigger value="7d">7 Hari</TabsTrigger>
                            <TabsTrigger value="30d">30 Hari</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatusCard
                            title="Kelembaban Tanah"
                            value={sensorData?.sensors.soilMoisture * 100}
                            unit="%"
                            change={0}
                            status={sensorData?.status.landslideRisk === "safe" ? "safe" : "warning"}
                            icon={<Gauge size={24} />}
                        />
                        <StatusCard
                            title="Curah Hujan"
                            value={sensorData?.sensors.rainfall.toFixed(1) ?? "-"}
                            unit="mm"
                            change={0}
                            status={sensorData?.status.landslideRisk === "safe" ? "safe" : "warning"}
                            icon={<CloudRain size={24} />}
                        />
                        <StatusCard
                            title="Temperatur"
                            value={sensorData?.sensors.temperature.toFixed(1) ?? "-"}
                            unit="°C"
                            change={0}
                            status="safe"
                            icon={<Thermometer size={24} />}
                        />
                    </div>

                    <TabsContent value="24h" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        <SensorChart
                            title="Kelembaban Tanah"
                            description="Data realtime dari sensor"
                            data={soilMoistureHistory}
                            color="hsl(215, 100%, 50%)"
                            unit="%"
                            domain={[0, 100]}
                        />
                        <SensorChart
                            title="Curah Hujan"
                            description="Data realtime dari sensor"
                            data={rainfallHistory}
                            color="hsl(210, 90%, 65%)"
                            unit=" %"
                            domain={[0, 100]}
                        />
                        <SensorChart
                            title="Temperatur"
                            description="Data realtime dari sensor"
                            data={temperatureHistory}
                            color="hsl(20, 100%, 60%)"
                            unit="°C"
                            domain={[0, 60]}
                        />
                    </TabsContent>

                    <TabsContent value="7d">
                        <div className="text-center p-12 text-muted-foreground">
                            Data 7 hari akan ditampilkan di sini
                        </div>
                    </TabsContent>

                    <TabsContent value="30d">
                        <div className="text-center p-12 text-muted-foreground">
                            Data 30 hari akan ditampilkan di sini
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default Dashboard
