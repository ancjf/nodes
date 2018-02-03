/**
 * Created by cjf on 2017/12/26.
 */

var logs = require('./logs.js');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var utils = require('./utils.js');

logs.logvar(utils.path());

var mutipart= require('connect-multiparty');
router.use(mutipart({uploadDir:utils.path()}));

/*
router.use(mutipart({//设置文件上传到的位置
    dest: './jsons',
    rename: function (fieldname, filename) {
        logs.logvar(fieldname, filename);
        return filename;
    }
}));
*/

var mutipartMiddeware = mutipart();

router.post('/upload', mutipartMiddeware, function(req, res, next) {
    var account = req.cookies.account.account;
    logs.logvar(account, req.cookies, req.files);

    for(var value in req.files) {
        //logs.logvar(value, req.files[value]);
        var dest = req.files[value].name;
        logs.logvar(dest);
        
        utils.add(req.files[value].path, account, dest);
    }

    var files = utils.files(account);
    logs.logvar(files);
    res.send(files);
});

router.get('/delete', function(req, res, next) {
    var account = req.cookies.account.account;
    logs.logvar(account, req.query.name);
    utils.delete(account, req.query.name);

    var files = utils.files(account);
    res.send(files);
});

router.post('/delete', function(req, res, next) {
    var account = req.cookies.account.account;
    var dest = account + '/' + req.body.name;
    logs.logvar(account, req.body);
    utils.delete(account, req.body.name);

    var files = utils.files(account);
    res.send(files);
});

router.get('/query', function(req, res, next) {
    var account = req.cookies.account.account;
    var files = utils.files(account);

    logs.logvar(account, files);
    res.send(files);
});

router.post('/query', function(req, res, next) {
    var account = req.cookies.account.account;
    var files = utils.files(account);

    logs.logvar(account, files);
    res.send(files);
});

module.exports = router;
