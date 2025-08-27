import * as stylex from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import ReactLogo from '~/assets/react.svg?react';
import StyleXLogo from '~/assets/stylex.svg?react';

const spin = stylex.keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
});

const LIGHT_MODE = '@media (prefers-color-scheme: light)';
const MEDIA_ANIMATION = '@media (prefers-reduced-motion: no-preference)';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '5em',
    },

    link: {
        fontWeight: 500,
        color: {
            default: '#646cff',
            ':hover': {
                default: '#535bf2',
                [LIGHT_MODE]: '#747bff',
            },
        },
        textDecoration: 'inherit',
    },
    logo: {
        filter: {
            default: null,
            ':hover': 'drop-shadow(0 0 2em #646cffaa)',
        },
        height: '6em',
        padding: '1.5em',
        transitionProperty: 'filter',
        transitionDuration: '300ms',
        willChange: 'filter',
        fill: '#000',
    },
    logoReact: {
        width: 124,
        filter: {
            default: null,
            ':hover': 'drop-shadow(0 0 2em #61dafbaa)',
        },
        animationName: {
            default: null,
            [MEDIA_ANIMATION]: spin,
        },
        animationDuration: {
            default: null,
            [MEDIA_ANIMATION]: '20s',
        },
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
    },
    card: { padding: '2em', textAlign: 'center' },
    readDocs: { color: '#888' },

    h1: {
        fontSize: '3.2rem',
        lineHeight: 1.1,
    },

    button: {
        appearance: 'none',
        borderWidth: 1,
        borderRadius: 8,
        borderStyle: 'solid',
        borderColor: {
            default: 'transparent',
            ':hover': '#646cff',
        },
        paddingBlock: '0.6em',
        paddingInline: '1.2em',
        fontSize: '1em',
        fontWeight: 500,
        fontFamily: 'inherit',
        backgroundColor: {
            default: '#1a1a1a',
            [LIGHT_MODE]: '#f9f9f9',
        },
        cursor: 'pointer',
        transitionProperty: 'border-color, transform',
        transitionDuration: {
            default: '0.2s',
            ':active': '0.1s',
        },
        outline: {
            default: 'none',
            ':focus-visible': '4px auto -webkit-focus-ring-color',
        },
        transform: {
            default: 'scale(1)',
            '@media (hover: hover)': {
                default: null,
                ':hover': 'scale(1.025)',
                ':active': 'scale(0.99)',
            },
            ':active': 'scale(0.975)',
        },
    },
    stylexLogo: {
        width: 124,
    },
});

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    const [count, setCount] = useState(0);

    return (
        <div {...stylex.props(styles.base)}>
            <div>
                <a {...stylex.props(styles.link)} href="https://react.dev" target="_blank" rel="noreferrer">
                    <ReactLogo {...stylex.props(styles.logo, styles.logoReact)} />
                </a>
                <a {...stylex.props(styles.link)} href="https://stylexjs.com" target="_blank" rel="noreferrer">
                    <StyleXLogo {...stylex.props(styles.logo, styles.stylexLogo)} />
                </a>
            </div>

            <h1 {...stylex.props(styles.h1)}>Stylex + React</h1>
            <div {...stylex.props(styles.card)}>
                <button {...stylex.props(styles.button)} onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p {...stylex.props(styles.readDocs)}>Click on the React and StyleX logos to learn more</p>
        </div>
    );
}
