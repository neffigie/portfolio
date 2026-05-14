"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

function IridescentMaterial() {
    return (
        <meshPhysicalMaterial
            transmission={0.95}
            roughness={0.03}
            metalness={0.0}
            ior={1.5}
            thickness={1.5}
            iridescence={1}
            iridescenceIOR={1.4}
            iridescenceThicknessRange={[100, 500]}
            color="#ffffff"
            transparent
            opacity={0.9}
        />
    );
}

function RibbonSculpture({ position }: { position: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null);
    const phase = useRef(0);

    const geometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.4, -1.2, 0),
            new THREE.Vector3(0.3, -0.4, 0.2),
            new THREE.Vector3(-0.2, 0.3, -0.1),
            new THREE.Vector3(0.4, 1.0, 0.1),
            new THREE.Vector3(0.0, 1.4, 0),
        ]);
        return new THREE.TubeGeometry(curve, 80, 0.14, 12, false);
    }, []);

    useFrame((_, delta) => {
        if (!ref.current) return;
        phase.current += delta * 0.35;
        ref.current.position.x = position[0] + Math.sin(phase.current * 0.4) * 0.08;
        ref.current.position.y = position[1] + Math.cos(phase.current * 0.35) * 0.12;
        ref.current.rotation.z = Math.sin(phase.current * 0.2) * 0.06;
    });

    return (
        <mesh ref={ref} position={position} geometry={geometry}>
            <IridescentMaterial />
        </mesh>
    );
}

function OrbSculpture({ position, radius, phase }: { position: [number, number, number]; radius: number; phase: number }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (!ref.current) return;
        const t = performance.now() * 0.001 + phase;
        ref.current.position.x = position[0] + Math.sin(t * 0.4) * 0.07;
        ref.current.position.y = position[1] + Math.cos(t * 0.5) * 0.1;
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[radius, 64, 64]} />
            <IridescentMaterial />
        </mesh>
    );
}

function Particles() {
    const ref = useRef<THREE.Points>(null);
    const count = 120;

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3]     = (Math.random() - 0.5) * 8;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }
        return arr;
    }, []);

    useFrame((_, delta) => {
        if (!ref.current) return;
        ref.current.rotation.y += delta * 0.015;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.02} color="#d4b8c0" transparent opacity={0.5} sizeAttenuation />
        </points>
    );
}

function Scene() {
    return (
        <>
            <Suspense fallback={null}>
                <Environment preset="studio" />
            </Suspense>
            <ambientLight intensity={0.4} color="#fdf0f3" />
            <pointLight position={[4, 3, 3]} intensity={1.5} color="#e8c4c8" />
            <pointLight position={[-3, -2, 2]} intensity={1.0} color="#b8d4e8" />

            <RibbonSculpture position={[2.2, 0.8, -0.5]} />
            <OrbSculpture position={[-2.4, -1.0, -0.8]} radius={0.55} phase={0} />
            <OrbSculpture position={[2.8, -1.4, -1.0]} radius={0.32} phase={2.1} />
            <Particles />
        </>
    );
}

/** Fixed R3F canvas with iridescent glass sculptural objects and particles. */
export function HeroScene() {
    return (
        <div
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
                style={{ background: "transparent", pointerEvents: "none" }}
                events={undefined}
            >
                <Scene />
            </Canvas>
        </div>
    );
}
