const path = require('path');

module.exports = {
    mode: "production",
    entry: './dist/browser.js',
    output: {
        filename: 'fetcher.bundle.js',
        path: path.resolve(__dirname, 'build'),
        library: "LogglyFetcher",
        libraryTarget: "umd",
    },
    externalsPresets: {
        node: true // in order to ignore built-in modules like path, fs, etc. 
    },
    /* module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, 'dist/controllers/settings/strategies/FileStrategy.js'),
                    path.resolve(__dirname, 'dist/controllers/settings/strategies/TerminalStrategy.js')
                ]
            }
        ]
    } */
};