const path = require('path');

module.exports = {
    entry: './src/index.js',
    module: {
        rules: [
            {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '*']
    },
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },

    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};