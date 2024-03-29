const path = require('path');
// const glob = require('glob');

module.exports = {
    module: {
        rules: [
            {
                include: [path.resolve(__dirname, 'src')],
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            '@babel/env',
                            {
                                modules: false,
                            },
                        ],
                    ],
                },

                test: /\.js$/,
            },
            {
                test: /\.(png|jpe?g|gif|svg|gltf|glb)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: ['raw-loader', 'glslify-loader'],
            },
        ],
    },

    entry: './src/index.js',
    // output: '[name]',
    output: {
        library: 'DCDScene',
        libraryTarget: 'umd',
        // crossOriginLoading: 'anonymous',
        publicPath: '/dist/',
    },

    stats: {
        all: true,
    },

    plugins: [],

    mode: 'production',

    optimization: {
        minimize: true,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/,
                },
            },

            // chunks: 'all',
            minChunks: 1,
            minSize: 3000,
            name: false,
        },
    },
};
