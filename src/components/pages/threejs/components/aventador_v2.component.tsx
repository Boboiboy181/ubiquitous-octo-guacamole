import {
    OrbitControls,
    useGLTF,
    Environment,
    ContactShadows,
    PerspectiveCamera,
    useAnimations,
    Text,
    Float,
    Sparkles,
    Lightformer,
    AccumulativeShadows,
    RandomizedLight,
    Stats,
} from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Custom hook for smooth animations
function useSmoothedControls() {
    const [target, setTarget] = useState([0, 0, 0]);
    const [smoothTarget] = useState(() => new THREE.Vector3());

    useFrame((state, delta) => {
        smoothTarget.lerp(new THREE.Vector3(...target), delta * 2);
    });

    return { target: smoothTarget, setTarget };
}

// Animated floating particles around the car
function FloatingParticles() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return <Sparkles ref={meshRef} count={50} scale={[20, 5, 20]} size={3} speed={0.3} opacity={0.6} color="#ffd700" />;
}

// Interactive spotlight that follows mouse
function InteractiveSpotlight() {
    const lightRef = useRef<THREE.SpotLight>(null);
    const { mouse, viewport } = useThree();

    useFrame(() => {
        if (lightRef.current) {
            const x = (mouse.x * viewport.width) / 2;
            const z = (mouse.y * viewport.height) / 2;
            lightRef.current.position.set(x, 5, z + 5);
            lightRef.current.target.position.set(x * 0.25, 0, z * 0.25);
            lightRef.current.target.updateMatrixWorld();
        }
    });

    return (
        <spotLight
            ref={lightRef}
            intensity={0.5}
            angle={0.15}
            penumbra={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
            color="#ffffff"
        />
    );
}

// Enhanced floor with reflection-like material
function ModernFloor({ floorY }: { floorY: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle floor animation
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
        }
    });

    return (
        <>
            {/* Main floor */}
            <mesh ref={meshRef} position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    roughness={0.1}
                    metalness={0.9}
                    emissive="#0066cc"
                    emissiveIntensity={0.02}
                />
            </mesh>

            {/* Soft contact shadows */}
            <AccumulativeShadows
                position={[0, floorY + 0.01, 0]}
                frames={100}
                alphaTest={0.9}
                scale={20}
                color="purple"
                opacity={0.8}
            >
                <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 5, -10]} bias={0.001} />
            </AccumulativeShadows>
        </>
    );
}

// Animated car component with hover effects
function AnimatedCar({ scene, floorY }: { scene: THREE.Group; floorY: number }) {
    const carRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (carRef.current) {
            // Gentle floating animation
            carRef.current.position.y = floorY + 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;

            // Subtle rotation when hovered
            if (hovered) {
                carRef.current.rotation.y += 0.01;
            }
        }
    });

    // Change cursor on hover
    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
        return () => {
            document.body.style.cursor = 'auto';
        };
    }, [hovered]);

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <primitive
                ref={carRef}
                object={scene}
                castShadow
                receiveShadow
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={() => {
                    // Add click interaction
                    console.log('Car clicked! You can add any interaction here.');
                }}
            />
        </Float>
    );
}

export function Supercar() {
    const { scene } = useGLTF('./gltf/aventador.gltf');
    const controlsRef = useRef<any>(null);
    const floorY = -0.5;

    return (
        <>
            {/* Enhanced Camera Controls */}
            <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                enableDamping={true} // Smooth camera movement
                dampingFactor={0.05}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2 - 0.1}
                minDistance={3}
                maxDistance={25}
                target={[0, floorY + 1, 0]}
                autoRotate={false} // Set to true for auto-rotation
                autoRotateSpeed={0.5}
            />

            {/* Professional Environment Lighting */}
            <Environment
                background={false} // We'll use CSS gradient instead
                preset="studio"
                resolution={512}
            >
                {/* Custom light setup */}
                <Lightformer
                    intensity={2}
                    color="white"
                    position={[10, 5, 10]}
                    rotation={[0, Math.PI, 0]}
                    scale={[20, 10, 1]}
                />
                <Lightformer
                    intensity={1}
                    color="#4060ff"
                    position={[-10, 2, -5]}
                    rotation={[0, 0, Math.PI]}
                    scale={[20, 4, 1]}
                />
            </Environment>

            {/* Multiple Light Sources for Professional Look */}
            <ambientLight intensity={0.2} color="#ffffff" />

            {/* Key light */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                color="#ffffff"
            />

            {/* Fill light */}
            <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#4080ff" />

            {/* Rim light */}
            <directionalLight position={[0, 2, -10]} intensity={0.5} color="#ff8040" />

            {/* Interactive spotlight */}
            <InteractiveSpotlight />

            {/* Modern Floor */}
            <ModernFloor floorY={floorY} />

            {/* Animated Car */}
            <AnimatedCar scene={scene} floorY={floorY} />

            {/* Floating Particles */}
            <FloatingParticles />

            {/* 3D Text Label */}
            <Text position={[0, 3, -5]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle">
                Lamborghini Aventador
            </Text>

            {/* Performance Monitor (useful for learning) */}
            {/* Uncomment to see FPS */}
            <Stats />
        </>
    );
}

// Preload the GLTF model for better performance
useGLTF.preload('./gltf/aventador.gltf');
