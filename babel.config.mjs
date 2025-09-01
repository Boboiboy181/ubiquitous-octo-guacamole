import styleXPlugin from '@stylexjs/babel-plugin';

const isDev = process.env.NODE_ENV === 'development';

const config = {
    presets: ['@babel/preset-typescript', '@babel/preset-react'],
    plugins: [
        [
            styleXPlugin,
            {
                runtimeInjection: false,
                dev: isDev,
                debug: isDev,
            },
        ],
    ],
};

export default config;
