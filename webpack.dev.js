const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const argv = require('yargs').argv;

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    stats: {
        all: true,
    },

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
                test: /\.(png|jpe?g|gif|svg|glb|gltf)$/,
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
            {
                test: /\.(scss|css)$/,

                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',

                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',

                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        disableHostCheck: true,
        historyApiFallback: true,
        stats: 'minimal',
    },

    entry: {
        index: './src/index.js',
    },

    output: {
        path: path.resolve(__dirname, 'public'),
    },

    plugins: [
        new webpack.DefinePlugin({}),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/templates', `index.dev.ejs`),
            days,
        }),
        new MiniCssExtractPlugin(),
    ],

    mode: 'development',

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/,
                },
            },

            chunks: 'async',
            minChunks: 1,
            minSize: 30000,
            name: false,
        },
    },
};
