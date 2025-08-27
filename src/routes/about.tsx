import * as stylex from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
    component: About,
});

const styles = stylex.create({
    container: {
        padding: '0 30px',
    },
});

function About() {
    return <div {...stylex.props(styles.container)}>Hello from About!</div>;
}
