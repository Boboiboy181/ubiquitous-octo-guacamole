import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import stylexPlugin from 'unplugin-stylex/rspack';

export default defineConfig({
    plugins: [pluginReact(), pluginSvgr()],
    tools: {
        rspack: {
            plugins: [stylexPlugin()],
        },
    },
});
