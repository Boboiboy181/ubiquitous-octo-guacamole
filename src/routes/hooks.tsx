import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useThrottle } from '~/hooks/useThrottle';

export const Route = createFileRoute('/hooks')({
    component: RouteComponent,
});

function RouteComponent() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const onMouseMove = useThrottle((event: MouseEvent) => {
        setMousePos({ x: event.clientX, y: event.clientY });
    }, 500);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, [onMouseMove]);

    return (
        <div style={{ height: 2000, padding: 20 }}>
            <h1>Hooks Demo</h1>
            <p>Move your mouse around to see the throttled position updates:</p>
            <div>
                X: {mousePos.x}, Y: {mousePos.y}
            </div>
        </div>
    );
}
