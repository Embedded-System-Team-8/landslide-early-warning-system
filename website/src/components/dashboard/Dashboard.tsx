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

const Dashboard: React.FC = () => {
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-lg font-semibold">Dashboard Monitoring</h1>

            <div className="flex flex-col gap-4 w-full">
                <Card className="w-full">
                    <CardContent className="p-2">
                        <Seismogram />
                    </CardContent>
                </Card>
            </div>

            {/* Alert Summary */}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="w-full">
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

                <Card className="w-full border-status-warning border-l-4">
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
            </div>

            {/* Chart Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Riwayat Data Sensor</h2>

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
