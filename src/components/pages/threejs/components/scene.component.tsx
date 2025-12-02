import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { Physics, RigidBody } from '@react-three/rapier';

export function Scene() {
    const groupRef = useRef<Group>(null);

    useFrame((_state, delta) => {
        // Animation or frame updates can be handled here
        if (groupRef.current) {
            groupRef.current.rotation.y += delta;
        }
    });

    return (
        <>
            <OrbitControls />
            <Physics>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 3]} castShadow />

                <RigidBody>
                    <mesh castShadow position={[0, 2, 0]}>
                        <boxGeometry />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                </RigidBody>

                <RigidBody type="fixed">
                    <mesh position-y={-1} rotate-x={-Math.PI * 0.5} receiveShadow>
                        <boxGeometry args={[10, 0.5, 8]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>
                </RigidBody>
            </Physics>
        </>
    );
}
