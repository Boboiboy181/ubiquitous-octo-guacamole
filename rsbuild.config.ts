import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';
import stylexPlugin from 'unplugin-stylex/rspack';

export default defineConfig({
    plugins: [pluginReact(), pluginSvgr()],
    tools: {
        rspack: {
            plugins: [
                stylexPlugin(),
                tanstackRouter({
                    target: 'react',
                    autoCodeSplitting: true,
                }),
            ],
        },
    },
    resolve: {
        alias: {
            '~': '/src',
        },
    },
    html: {
        title: 'Drafts App',
        favicon: './src/assets/favicon.ico',
        meta: {
            description: 'Draft app for learning purposes',
        },
    },
});
