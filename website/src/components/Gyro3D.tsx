import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useSensorData } from "../hooks/useSensorData"

export const Gyro3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<THREE.Mesh>()
    const animationRef = useRef<number>()

    // Store persistent rotation values
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

    const { sensorData } = useSensorData()

    useEffect(() => {
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        camera.position.z = 5

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(400, 400)
        mountRef.current!.appendChild(renderer.domElement)

        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshNormalMaterial()
        const cube = new THREE.Mesh(geometry, material)
        boxRef.current = cube

        // Apply any existing rotation immediately
        cube.rotation.x = rotation.x
        cube.rotation.y = rotation.y
        cube.rotation.z = rotation.z

        scene.add(cube)

        const animate = () => {
            animationRef.current = requestAnimationFrame(animate)

            if (sensorData && boxRef.current) {
                // Calculate target rotation (incremental based on gyro data)
                const targetRotation = {
                    x: rotation.x + sensorData.sensors.gyro.x * 0.05, // Scale factor for sensitivity
                    y: rotation.y + sensorData.sensors.gyro.y * 0.05,
                    z: rotation.z + sensorData.sensors.gyro.z * 0.05,
                }

                // Smooth interpolation between current and target rotation
                boxRef.current.rotation.x = THREE.MathUtils.lerp(boxRef.current.rotation.x, targetRotation.x, 0.1)
                boxRef.current.rotation.y = THREE.MathUtils.lerp(boxRef.current.rotation.y, targetRotation.y, 0.1)
                boxRef.current.rotation.z = THREE.MathUtils.lerp(boxRef.current.rotation.z, targetRotation.z, 0.1)

                // Update persistent state
                setRotation({
                    x: boxRef.current.rotation.x,
                    y: boxRef.current.rotation.y,
                    z: boxRef.current.rotation.z,
                })
            }

            renderer.render(scene, camera)
        }

        animate()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            mountRef.current?.removeChild(renderer.domElement)
        }
    }, [sensorData])

    return <div ref={mountRef}></div>
}
