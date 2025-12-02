import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import svgr from 'vite-plugin-svgr';
import babelConfig from './babel.config.cjs';

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react({
            babel: babelConfig,
        }),
        svgr(),
    ],
    resolve: {
        alias: {
            '~': '/src',
        },
    },
});
