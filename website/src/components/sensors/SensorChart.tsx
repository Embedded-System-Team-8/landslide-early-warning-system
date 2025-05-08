import React from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DataPoint = {
    time: string
    value: number
}

type SensorChartProps = {
    title: string
    description?: string
    data: DataPoint[]
    dataKey?: string
    color?: string
    unit?: string
    domain?: [number, number]
}

const SensorChart = ({
    title,
    description,
    data,
    dataKey = "value",
    color = "hsl(var(--primary))",
    unit = "",
    domain = [0, 100],
}: SensorChartProps) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="pb-4">
                <div className="w-full h-[200px] sm:h-[240px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `${value}${unit}`}
                                domain={domain}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Waktu
                                                        </span>
                                                        <span className="font-bold text-xs">
                                                            {payload[0].payload.time}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Nilai
                                                        </span>
                                                        <span className="font-bold text-xs">
                                                            {payload[0].value} {unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                                activeDot={{
                                    r: 4,
                                    style: { fill: color, opacity: 0.8 },
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default SensorChart
