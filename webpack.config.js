var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        `${__dirname}/sass/style.scss`,
    ],
    output: {
        path: './build/',
        publicPath: '/',
        filename: 'build.js',
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass?outputStyle=expanded'),
                include: `${__dirname}/sass`,
            },
            {
                test: /\.(woff2?|svg|ttf|eot|png|jpe?g|gif|ico|pdf)?$/,
                loader: `file?name=[path][name].[ext]`,
                include: [`${__dirname}/sass`, `${__dirname}/posts`],
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin('style.css', {
            allChunks: true,
        }),
    ],
    devtool: 'eval-cheap-module-source-map',
};
