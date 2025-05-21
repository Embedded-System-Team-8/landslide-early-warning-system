import React from "react"
import { Seismogram } from "../Seismogram"

const SeismographView: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Data Seismograf</h1>
            <div className="space-y-4">
                <Seismogram />
            </div>
        </div>
    )
}

export default SeismographView
