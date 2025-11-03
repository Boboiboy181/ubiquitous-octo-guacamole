import { OrbitControls, useGLTF } from '@react-three/drei';
import { useRef } from 'react';

export function Supercar() {
    const { scene } = useGLTF('./gltf/aventador.gltf');

    const controlsRef = useRef<any>(null);

    const floorY = -0.5;

    return (
        <>
            <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                // Prevent camera from going below the floor
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2 - 0.1} // Slightly less than 90 degrees to keep camera above floor
                minDistance={2}
                maxDistance={20}
                // Set target to be above the floor
                target={[0, floorY + 1, 0]}
            />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />

            {/* Floor */}
            <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#404040" roughness={0.8} metalness={0.2} />
            </mesh>

            <primitive
                object={scene}
                castShadow
                receiveShadow
                position={[0, floorY + 0.1, 0]} // Position car slightly above floor
            />
        </>
    );
}
