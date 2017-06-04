// Karma configuration
// Generated on Tue Jun 07 2016 07:48:29 GMT-0700 (PDT)
const webpack = require('karma-webpack');

module.exports = function (config) {
    config.set({
        basePath: 'src',
        frameworks: ['jasmine'],
        files: [
            "**/github-api.spec.js",
            "**/dropbox-api.spec.js"
        ],
        exclude: [""],
        plugins: [
            webpack,
            'karma-jasmine',
            'karma-safari-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher'
        ],
        preprocessors: {
            '**/*.spec.js': ["webpack"]
        },
        webpack: {
            devtool: 'inline-source-map',
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        exclude: /(node_modules|bower_components)/,
                        loader: 'babel-loader' // omitting '-loader' is not legal anymore.
                    }
                ]
            }
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        // browsers: ['Safari', 'Chrome', 'Firefox'],
        singleRun: false,
        concurrency: Infinity
    })
};
