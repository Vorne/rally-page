/*global require, module, __dirname */

const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.config.some(item => item === 'webpack.prod.js');

    return {
        output: {
            path: path.resolve(__dirname, 'deploy'),
            publicPath: '/',
            library: 'Entry',
        },

        entry: {
            'blockingrelease': path.resolve(__dirname, 'src/blockingrelease.js'),
            'demoplan': path.resolve(__dirname, 'src/demoplan.js'),
            'standup': path.resolve(__dirname, 'src/standup.js'),
        },

        plugins: [
            new webpack.ProgressPlugin(),
            new HtmlWebpackPlugin({
                filename: 'demoplan.html',
                chunks: ['demoplan'],
                template: path.resolve(__dirname, 'src/index.html'),
                // use a different script tag to load rally script depending on if we're running
                // locally (dev) or within the rally website
                custom: isProduction
                    ? '<script type="text/javascript" src="/apps/2.1/sdk.js"></script>'
                    : '<script type="text/javascript" src="https://rally1.rallydev.com/apps/2.1/sdk.js"></script>',
                inlineSource: '.(js|css)$',
                // needed to npm run watch reloads properly
                cache: false,
            }),
            new HtmlWebpackPlugin({
                filename: 'blockingrelease.html',
                chunks: ['blockingrelease'],
                template: path.resolve(__dirname, 'src/index.html'),
                // use a different script tag to load rally script depending on if we're running
                // locally (dev) or within the rally website
                custom: isProduction
                    ? '<script type="text/javascript" src="/apps/2.1/sdk.js"></script>'
                    : '<script type="text/javascript" src="https://rally1.rallydev.com/apps/2.1/sdk.js"></script>',
                inlineSource: '.(js|css)$',
                // needed to npm run watch reloads properly
                cache: false,
            }),
            new HtmlWebpackPlugin({
                filename: 'standup.html',
                chunks: ['standup'],
                template: path.resolve(__dirname, 'src/widget.html'),
                inlineSource: '.(js|css)$',
                // needed to npm run watch reloads properly
                cache: false,
            }),
            new HtmlInlineScriptPlugin(),
            new ESLintPlugin({
                configType: 'flat',
                threads: true,
                cache: false,
                // fix: true,
                exclude: [
                    'node_modules',
                ],
            }),
            new webpack.DefinePlugin({
                'isProduction': isProduction,
            }),
        ],

        // slightly more minimization, mostly gets rid of the whitespace and new lines in the original html file
        // caution, setting all of the minimizerOptions values causes odd behavior when deployed
        optimization: {
            minimize: true,
            minimizer: [
                new HtmlMinimizerPlugin({
                    exclude: /standup\.html$/,
                    minimizerOptions: {
                        collapseWhitespace: true,
                        caseSensitive: false,
                        conservativeCollapse: true,
                        keepClosingSlash: false,
                        minifyCSS: true,
                        minifyJS: true,
                        removeComments: false,
                        removeScriptTypeAttributes: false,
                        removeStyleLinkTypeAttributes: false,
                    }
                }),
                new HtmlMinimizerPlugin({
                    test: /standup\.html$/,
                    minimizerOptions: {
                        collapseWhitespace: true,
                        caseSensitive: false,
                        conservativeCollapse: true,
                        keepClosingSlash: false,
                        minifyCSS: true,
                        minifyJS: {
                            format: {
                                comments: /\$RallyContext:(Begin|End)\s*$/,
                            },
                        },
                        removeComments: false,
                        removeScriptTypeAttributes: false,
                        removeStyleLinkTypeAttributes: false,
                    }
                }),
            ],
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    include: [path.resolve(__dirname, 'src')],
                    loader: 'babel-loader'
                },
                {
                    test: /.(sa|sc|c)ss$/,

                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',

                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'sass-loader',

                            options: {
                                sourceMap: true
                            }
                        },
                    ]
                }
            ]
        }
    };
};
