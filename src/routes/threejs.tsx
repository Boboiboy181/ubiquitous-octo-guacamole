import { createFileRoute } from '@tanstack/react-router';
import { Canvas } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { Supercar } from '~/components/pages/threejs/components/aventador_v2.component';

export const Route = createFileRoute('/threejs')({
    component: RouteComponent,
});

const styles = stylex.create({
    container: {
        flexGrow: 1,
        height: '100vh',
        width: '100vw',
    },
});

function RouteComponent() {
    return (
        <div {...stylex.props(styles.container)}>
            <Canvas shadows camera={{ fov: 100, position: [3, 3, 7] }} style={{ background: '#202020' }}>
                {/*<Scene />*/}
                <Supercar />
            </Canvas>
        </div>
    );
}
