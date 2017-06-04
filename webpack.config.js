/** Created by ge on 2/17/17. */

module.exports = {
    entry: [
        './demo/index.js',
    ],
    module: {
        loaders: [
            {
                test: /.js$/,
                exclude: /node_modules/,
                loader: 'babel?presets[]=es2015'
            }
        ]
    },
    output: {
        filename: 'index.bundle.js',
        path: './demo/dist'
    },
    devServer: {
        host: "localhost",
        port: 4001,
        contentBase: "./demo",
        https: true,
        secure: true,
        stats: {colors: true},
        noInfo: true, //  --no-info option
        hot: true,
        inline: true
    }

};
