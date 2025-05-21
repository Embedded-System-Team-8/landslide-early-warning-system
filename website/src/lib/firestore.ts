import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    getDocs,
    QuerySnapshot,
    DocumentData,
    DocumentReference,
} from "firebase/firestore"
import { app } from "./firebase"

// Initialize Firestore
const db = getFirestore(app)

// Collection names as constants
export const COLLECTIONS = {
    SENSOR_HISTORY: "sensor_history",
} as const

export class FirestoreUtils {
    static async createDocument<T extends DocumentData>(
        collectionName: string,
        data: T,
        documentId?: string
    ): Promise<string> {
        try {
            if (documentId) {
                const docRef = doc(db, collectionName, documentId)
                await setDoc(docRef, { ...data, timestamp: new Date() })
                return documentId
            } else {
                const docRef = doc(collection(db, collectionName))
                await setDoc(docRef, { ...data, timestamp: new Date() })
                return docRef.id
            }
        } catch (error) {
            console.error("Error creating document:", error)
            throw error
        }
    }

    static async readDocument<T extends DocumentData>(collectionName: string, documentId: string): Promise<T | null> {
        try {
            const docRef = doc(db, collectionName, documentId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return docSnap.data() as T
            }
            return null
        } catch (error) {
            console.error("Error reading document:", error)
            throw error
        }
    }

    static async updateDocument<T extends DocumentData>(
        collectionName: string,
        documentId: string,
        data: Partial<T>
    ): Promise<void> {
        try {
            const docRef = doc(db, collectionName, documentId)
            await updateDoc(docRef, data as DocumentData)
        } catch (error) {
            console.error("Error updating document:", error)
            throw error
        }
    }

    static async deleteDocument(collectionName: string, documentId: string): Promise<void> {
        try {
            const docRef = doc(db, collectionName, documentId)
            await deleteDoc(docRef)
        } catch (error) {
            console.error("Error deleting document:", error)
            throw error
        }
    }

    static async getLatestDocuments<T extends DocumentData>(
        collectionName: string,
        limitCount: number = 10,
        orderByField: string = "timestamp"
    ): Promise<T[]> {
        try {
            const q = query(collection(db, collectionName), orderBy(orderByField, "desc"), limit(limitCount))

            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }))
        } catch (error) {
            console.error("Error getting latest documents:", error)
            throw error
        }
    }

    static async getCollectionCount(collectionName: string): Promise<number> {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName))
            return querySnapshot.size
        } catch (error) {
            console.error("Error getting collection count:", error)
            throw error
        }
    }

    /**
     * Delete all documents in a collection
     * @param collectionName Collection name
     */
    static async deleteCollection(collectionName: string): Promise<void> {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName))
            const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
            await Promise.all(deletePromises)
        } catch (error) {
            console.error("Error deleting collection:", error)
            throw error
        }
    }
}

// Example usage with SensorData type
export interface SensorData {
    sensors: {
        accelerometer: {
            x: number
            y: number
            z: number
        }
        gyro: {
            x: number
            y: number
            z: number
        }
        tilt: {
            angleX: number
            angleY: number
            maxTilt: number
        }
        soilMoisture: number
        rainfall: number
        temperature: number
        vibrationRMS: number
    }
    status: {
        landslideRisk: string
        alertTriggered: boolean
    }
    timestamp?: Date
}