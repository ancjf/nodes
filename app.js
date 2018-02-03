var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logs = require('./routes/logs.js');
var fs = require('fs');
var upload = require('./routes/upload');
var web3 = require('./routes/web3');
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json({uploadDir:'./jsons'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.all('*', users.requireAuthentication);
/*
//设置跨域访问
app.all('*', function(req, res, next) {
    logs.logvar("app.all*******************************************************************************");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    //res.header("X-Powered-By",' 3.2.1')
    //res.header("Content-Type", "application/json;charset=utf-8");
    //app.all('*', users.requireAuthentication(req, res, next));
    //next();
});
*/

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/web3', web3);
app.use('/upload', upload);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var srcfile = './routes/webs.js';
var destfile = './public/javascripts/webs.min.js';
if(!fs.existsSync(destfile) || fs.statSync(srcfile).mtime > fs.statSync(destfile).mtime)
{
    const webpack = require('webpack');

    logs.logvar("begin");
    webpack({
        entry:  __dirname + "/routes/webs.js",//已多次提及的唯一入口文件
        output: {
            path: __dirname + "/public/javascripts",//打包后的文件存放的地方
            filename: "webs.min.js"//打包后输出文件的文件名
        },
        plugins:[new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false}
        })],
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }]
        }
    }, function(err, stats){
        if (err || stats.hasErrors()) {
            logs.logvar("error");
        }else{
            logs.logvar("succeed");
            //logs.logvar(stats);
        }
    });
}

module.exports = app;
