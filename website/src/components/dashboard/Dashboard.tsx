import React from "react"
import { CircleAlert, Thermometer, CloudRain, Gauge, MapPin, AlertTriangle } from "lucide-react"
import StatusCard from "../sensors/StatusCard"
import SensorChart from "../sensors/SensorChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Seismogram } from "../Seismogram"

// Mock data for our dashboard charts
const generateMockData = (length: number, base: number, volatility: number) => {
    const now = new Date()
    return Array.from({ length }, (_, i) => {
        const time = new Date(now)
        time.setHours(now.getHours() - (length - i))

        const timeString = time.getHours().toString().padStart(2, "0") + ":00"
        const value = base + (Math.random() - 0.5) * volatility

        return { time: timeString, value }
    })
}

const soilMoistureData = generateMockData(24, 72, 10)
const rainfallData = generateMockData(24, 15, 20)
const temperatureData = generateMockData(24, 26, 4)

// Mock data for sensors
const sensors = [
    {
        id: "sensor-001",
        name: "Desa Sukamaju",
        status: "warning" as const,
        soilMoisture: 72.5,
        rainfall: 15.2,
        temperature: 26.8,
        accelerometer: {
            x: -0.12,
            y: 0.98,
            z: 9.76,
        },
        tilt: {
            angleX: 2.3,
            angleY: 1.9,
        },
        location: {
            lat: -5.123456,
            lng: 105.123456,
            village: "Desa Sukamaju",
        },
    },
    {
        id: "sensor-002",
        name: "Desa Sejahtera",
        status: "safe" as const,
        soilMoisture: 65.2,
        rainfall: 5.8,
        temperature: 28.1,
        accelerometer: {
            x: -0.05,
            y: 0.12,
            z: 9.82,
        },
        tilt: {
            angleX: 0.8,
            angleY: 0.5,
        },
        location: {
            lat: -5.223456,
            lng: 105.223456,
            village: "Desa Sejahtera",
        },
    },
    {
        id: "sensor-003",
        name: "Desa Makmur",
        status: "danger" as const,
        soilMoisture: 85.1,
        rainfall: 32.4,
        temperature: 25.2,
        accelerometer: {
            x: -0.45,
            y: 1.38,
            z: 9.51,
        },
        tilt: {
            angleX: 4.8,
            angleY: 3.2,
        },
        location: {
            lat: -5.323456,
            lng: 105.323456,
            village: "Desa Makmur",
        },
    },
]

const Dashboard: React.FC = () => {
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard Monitoring</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Sensor Utama</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Seismogram deviceId="sensor-001" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Sistem berjalan normal</p>
                            <p className="text-sm text-muted-foreground">
                                Terakhir diperbarui: {new Date().toLocaleString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Penting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Pastikan semua sensor terhubung dengan baik</p>
                            <p className="text-sm text-muted-foreground">Periksa koneksi internet secara berkala</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alert Summary */}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 border-status-warning border-l-4">
                    <CardHeader>
                        <CardTitle className="flex items-center text-status-warning">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Peringatan Aktif
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>2 lokasi dalam status peringatan</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm">
                            Lihat Detail
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5" />
                            Lokasi Sensor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Total 3 sensor aktif dari 5 lokasi</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm">
                            Lihat Peta
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Sensor Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sensors.map((sensor) => (
                    <Card
                        key={sensor.id}
                        className={`border-l-4 ${
                            sensor.status === "safe"
                                ? "border-status-safe"
                                : sensor.status === "warning"
                                ? "border-status-warning"
                                : "border-status-danger"
                        }`}
                    >
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {sensor.name}
                                <div
                                    className={`status-indicator ${
                                        sensor.status === "safe"
                                            ? "status-safe"
                                            : sensor.status === "warning"
                                            ? "status-warning"
                                            : "status-danger"
                                    }`}
                                ></div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 py-2">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Kelembaban Tanah</span>
                                <span className="text-lg font-semibold">{sensor.soilMoisture}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Curah Hujan</span>
                                <span className="text-lg font-semibold">{sensor.rainfall} mm</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Kemiringan X</span>
                                <span className="text-lg font-semibold">{sensor.tilt.angleX}°</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Kemiringan Y</span>
                                <span className="text-lg font-semibold">{sensor.tilt.angleY}°</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                Lihat Detail
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Chart Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Tren Data Sensor</h2>

                <Tabs defaultValue="24h">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="24h">24 Jam</TabsTrigger>
                            <TabsTrigger value="7d">7 Hari</TabsTrigger>
                            <TabsTrigger value="30d">30 Hari</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="24h" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SensorChart
                            title="Kelembaban Tanah"
                            description="Rata-rata dari semua sensor"
                            data={soilMoistureData}
                            color="hsl(215, 100%, 50%)"
                            unit="%"
                        />
                        <SensorChart
                            title="Curah Hujan"
                            description="Total per jam"
                            data={rainfallData}
                            color="hsl(210, 90%, 65%)"
                            unit=" mm"
                        />
                        <SensorChart
                            title="Temperatur"
                            description="Rata-rata dari semua sensor"
                            data={temperatureData}
                            color="hsl(20, 100%, 60%)"
                            unit="°C"
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

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusCard
                    title="Kelembaban Tanah"
                    value="72.5"
                    unit="%"
                    change={8.2}
                    status="warning"
                    icon={<Gauge size={24} />}
                />
                <StatusCard
                    title="Curah Hujan"
                    value="15.2"
                    unit="mm"
                    change={12.5}
                    status="warning"
                    icon={<CloudRain size={24} />}
                />
                <StatusCard
                    title="Temperatur"
                    value="26.8"
                    unit="°C"
                    change={-2.1}
                    status="safe"
                    icon={<Thermometer size={24} />}
                />
                <StatusCard
                    title="Risiko Longsor"
                    value="Medium"
                    change={5.3}
                    status="warning"
                    icon={<AlertTriangle size={24} />}
                />
            </div>
        </div>
    )
}

export default Dashboard
