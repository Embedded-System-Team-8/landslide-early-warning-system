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
        let renderer: THREE.WebGLRenderer | null = null
        let resizeObserver: ResizeObserver | null = null
        const scene = new THREE.Scene()
        // Add sky background
        scene.background = new THREE.Color(0x87ceeb) // Sky blue

        // Add grass ground
        const groundGeometry = new THREE.PlaneGeometry(10, 10)
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4caf50 }) // Grass green
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = -0.25
        scene.add(ground)

        // Camera: a bit from side top so 3 sides of cube are visible
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        camera.position.set(2, 2, 3)
        camera.lookAt(0, 0, 0)

        renderer = new THREE.WebGLRenderer({ antialias: true })
        // Responsive size
        const setRendererSize = () => {
            if (mountRef.current) {
                const size = mountRef.current.getBoundingClientRect()
                renderer!.setSize(size.width, size.height)
                camera.aspect = size.width / size.height
                camera.updateProjectionMatrix()
            }
        }
        setRendererSize()
        mountRef.current!.appendChild(renderer.domElement)

        // Observe resize
        resizeObserver = new ResizeObserver(() => {
            setRendererSize()
        })
        if (mountRef.current) resizeObserver.observe(mountRef.current)

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
        scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
        directionalLight.position.set(5, 10, 7.5)
        scene.add(directionalLight)

        // Box: short and wider in x axis
        const geometry = new THREE.BoxGeometry(2, 0.3, 1)
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
                boxRef.current.rotation.x = THREE.MathUtils.lerp(boxRef.current.rotation.x, targetRotation.x, 0.2)
                boxRef.current.rotation.y = THREE.MathUtils.lerp(boxRef.current.rotation.y, targetRotation.y, 0.2)
                boxRef.current.rotation.z = THREE.MathUtils.lerp(boxRef.current.rotation.z, targetRotation.z, 0.2)

                // Update persistent state
                setRotation({
                    x: boxRef.current.rotation.x,
                    y: boxRef.current.rotation.y,
                    z: boxRef.current.rotation.z,
                })
            }

            renderer!.render(scene, camera)
        }

        animate()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            if (resizeObserver && mountRef.current) resizeObserver.disconnect()
            if (renderer && mountRef.current) mountRef.current.removeChild(renderer.domElement)
        }
    }, [sensorData])

    return <div ref={mountRef} className="w-full h-[200px] sm:h-[300px] md:h-[350px]" />
}
