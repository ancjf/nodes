module.exports = {
    entry: './routes/webs.js',
    output: {
        path: __dirname,
        filename: './public/javascripts/webs.min.js',
    },/*
    plugins:[
        //new webpack.optimize.OccurrenceOrderPlugin(),

        new webpack.optimize.UglifyJsPlugin({ //压缩输出块的大小       
            compress: {
                warnings: false,
                drop_console: true
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ],*/
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
}