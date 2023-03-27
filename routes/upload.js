/**
 * Created by cjf on 2017/12/26.
 */

const logs = require('@ancjf/logs');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var utils = require('./utils.js');

logs.log(utils.path());

var mutipart= require('connect-multiparty');
router.use(mutipart({uploadDir:utils.path()}));

/*
router.use(mutipart({//设置文件上传到的位置
    dest: './jsons',
    rename: function (fieldname, filename) {
        logs.log(fieldname, filename);
        return filename;
    }
}));
*/

var mutipartMiddeware = mutipart();


router.post('/upload', mutipartMiddeware, function(req, res, next) {
    var account = utils.get_account(req);
    //logs.log(account, req.cookies, req.files);

    //logs.log(req.files.keys());
    for(var value in req.files) {
        //logs.log(value, req.files[value]);
        var dest = req.files[value].name;
        //logs.log(dest);
        
        utils.add(req.files[value].path, account, dest);

    }

    var files = utils.files(account);
    res.send(files);
});

router.get('/delete', function(req, res, next) {
    var account = utils.get_account(req);
    logs.log(account, req.query.name);
    utils.delete(account, req.query.name);

    var files = utils.files(account);
    res.send(files);
});

router.post('/delete', function(req, res, next) {
    var account = utils.get_account(req);
    var dest = account + '/' + req.body.name;
    logs.log(account, req.body);
    utils.delete(account, req.body.name);

    var files = utils.files(account);
    res.send(files);
});

router.get('/query', function(req, res, next) {
    var account = utils.get_account(req);
    var files = utils.files(account);

    logs.log(account, files);
    res.send(files);
});

router.post('/query', function(req, res, next) {
    var account = utils.get_account(req);
    var files = utils.files(account);

    logs.log(account, files);
    res.send(files);
});

module.exports = router;
