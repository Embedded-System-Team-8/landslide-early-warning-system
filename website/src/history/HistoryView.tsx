import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore"
import { app } from "../lib/firebase"
import { SensorData, COLLECTIONS } from "../lib/firestore"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 100

export default function HistoryView() {
    const [sensorHistory, setSensorHistory] = useState<(SensorData & { timestamp: Date })[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)

    const fetchSensorHistory = async (startAfterDoc?: QueryDocumentSnapshot<DocumentData>) => {
        setLoading(true)
        const db = getFirestore(app)
        let q = query(collection(db, COLLECTIONS.SENSOR_HISTORY), orderBy("timestamp", "desc"), limit(PAGE_SIZE))

        if (startAfterDoc) {
            q = query(
                collection(db, COLLECTIONS.SENSOR_HISTORY),
                orderBy("timestamp", "desc"),
                startAfter(startAfterDoc),
                limit(PAGE_SIZE)
            )
        }

        try {
            const snapshot = await getDocs(q)
            const data = snapshot.docs.map((doc) => ({
                ...(doc.data() as SensorData),
                timestamp: doc.data().timestamp.toDate(),
            }))
            setLastDoc(snapshot.docs[snapshot.docs.length - 1])
            setSensorHistory(data)
        } catch (error) {
            console.error("Error fetching sensor history:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleNextPage = () => {
        if (lastDoc) {
            setCurrentPage((prev) => prev + 1)
            fetchSensorHistory(lastDoc)
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
            fetchSensorHistory() // This will reset to the first page
        }
    }

    useEffect(() => {
        fetchSensorHistory()
    }, [])

    const filteredHistory = sensorHistory.filter((data) => {
        const searchLower = searchTerm.toLowerCase()
        return (
            data.status.landslideRisk.toLowerCase().includes(searchLower) ||
            data.timestamp.toLocaleString().toLowerCase().includes(searchLower)
        )
    })

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Sensor History</h1>
            <div className="mb-4">
                <Input
                    placeholder="Search by risk level or timestamp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Kelembapan Tanah</TableHead>
                            <TableHead>Intensitas Hujan</TableHead>
                            <TableHead>Temperatur</TableHead>
                            <TableHead>Kemiringan X°</TableHead>
                            <TableHead>Kemiringan Y°</TableHead>
                            <TableHead>Peringatan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredHistory.map((data, index) => (
                            <TableRow key={index} className="p-0">
                                <TableCell className="py-2">
                                    {format(new Date(data.timestamp.getTime() - 7 * 60 * 60 * 1000), "PPpp")}
                                    </TableCell>
                                <TableCell className="py-2">{data.status.landslideRisk}</TableCell>
                                <TableCell className="py-2">{data.sensors.soilMoisture.toFixed(2)}%</TableCell>
                                <TableCell className="py-2">{data.sensors.rainfall.toFixed(2)} %</TableCell>
                                <TableCell className="py-2">{data.sensors.temperature.toFixed(1)}°C</TableCell>
                                <TableCell className="py-2">{data.sensors.tilt.angleX.toFixed(1)}°</TableCell>
                                <TableCell className="py-2">{data.sensors.tilt.angleY.toFixed(1)}°</TableCell>
                                <TableCell className="py-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-sm ${
                                            data.status.alertTriggered
                                                ? "bg-red-100 text-red-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {data.status.alertTriggered ? "Yes" : "No"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            onClick={handlePrevPage}
                            variant="outline"
                            size="icon"
                            className="cursor-pointer"
                            disabled={currentPage === 1}
                        >
                            <PaginationPrevious />
                        </Button>
                    </PaginationItem>
                    <PaginationItem>
                        <span className="px-4">Page {currentPage}</span>
                    </PaginationItem>
                    <PaginationItem>
                        <Button
                            onClick={handleNextPage}
                            variant="outline"
                            size="icon"
                            className="cursor-pointer"
                            disabled={!lastDoc || filteredHistory.length < PAGE_SIZE}
                        >
                            <PaginationNext />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
