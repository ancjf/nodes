/**
 * Created by cjf on 2017/12/26.
 */

var logs = require('./logs.js');
var express = require('express');
var router = express.Router();

var mutipart= require('connect-multiparty');
//router.use(mutipart({uploadDir:'./jsons'}));

router.use(mutipart({//设置文件上传到的位置
    dest: './jsons',
    rename: function (fieldname, filename) {
        return filename;
    }
}));

var mutipartMiddeware = mutipart();

router.post('/upload', mutipartMiddeware, function(req, res, next) {
    logs.logvar(req.files);
    /*//do something
     * 成功接受到浏览器传来的文件。我们可以在这里写对文件的一系列操作。例如重命名，修改文件储存路径 。等等。
     *
     *
     * */

    //给浏览器返回一个成功提示。
    res.send('upload success!');
});

module.exports = router;
