/**
 * Created by ac on 2018/2/1.
 */

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var logs = require('./logs.js');

function hashPW(userName, pwd){
    var hash = crypto.createHash('md5');
    hash.update(userName + pwd);
    return hash.digest('hex');
}

// just for tutorial, it's bad really
var userdb = [
    {
        userName: "admin",
        hash: hashPW("admin", "123456"),
        last: ""
    },
    {
        userName: "foruok",
        hash: hashPW("foruok", "888888"),
        last: ""
    }
];

function getLastLoginTime(userName){
    for(var i = 0; i < userdb.length; ++i){
        var user = userdb[i];
        if(userName === user.userName){
            return user.last;
        }
    }
    return "";
}

function updateLastLoginTime(userName){
    for(var i = 0; i < userdb.length; ++i){
        var user = userdb[i];
        if(userName === user.userName){
            user.last = Date().toString();
            return;
        }
    }
}

function authenticate(userName, hash){

    for(var i = 0; i < userdb.length; ++i){
        var user = userdb[i];
        if(userName === user.userName){
            if(hash === user.hash){
                return 0;
            }else{
                return 1;
            }
        }
    }

    return 2;
}

function isLogined(req){
    if(typeof(req.cookies) != 'undefined'  && req.cookies["account"] != null){
        var account = req.cookies["account"];
        var user = account.account;
        var hash = account.hash;
        if(authenticate(user, hash)==0){
            console.log(req.cookies.account.account + " had logined.");
            return true;
        }
    }
    return false;
};

router.requireAuthentication = function(req, res, next){
    logs.logvar(req.path.substring(0, 8));
    if(req.path.substring(0, 8) != "/secure/")
    {
        next();
        return;
    }

    logs.logvar(typeof(req.cookies), req.cookies);
    if(typeof(req.cookies) != 'undefined'  && req.cookies["account"] != null){
        var account = JSON.parse(req.cookies.account);
        var user = account.account;
        var hash = account.hash;
        logs.logvar(user, hash, account);
        if(authenticate(user, hash)==0){
            logs.log(req.cookies.account.account + " had logined.");
            next();
            return;
        }
    }

    var url = '/login.html?back=' + req.path;
    logs.logvar(url);

    res.redirect(url);
};

router.post('/login', function(req, res, next){
    logs.logvar('11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111');
    logs.logvar(req.body);

    var account = req.body.account;
    var hash = hashPW(account, req.body.password);
    logs.logvar(account, hash);

    switch(authenticate(userName, hash)){
        case 0: //success
            var lastTime = getLastLoginTime(account);
            updateLastLoginTime(account);
            logs.log("login ok, last - " + lastTime);
            res.cookie("account", {account: account, hash: hash, last: lastTime}, {maxAge:3600000});
            res.redirect('/');
            logs.log("after redirect");
            break;
        case 1: //password error
            logs.log("password error");
            res.render('login', {msg:"密码错误"});
            break;
        case 2: //user not found
            logs.log("user not found");
            res.render('login', {msg:"用户名不存在"});
            break;
    }
});

router.get('/login', function(req, res, next){
    logs.logvar('11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111');
    logs.logvar(req.query);

    var account = req.query.account;
    var hash = hashPW(account, req.query.password);
    logs.logvar(account, hash);

    switch(authenticate(account, hash)){
        case 0: //success
            var lastTime = getLastLoginTime(account);
            updateLastLoginTime(account);
            logs.log("login ok, last - " + lastTime);
            var cookie = {"account":{account: account, hash: hash, last: lastTime},"attr":{expires: 60000}};
            res.cookie("account", {account: account, hash: hash, last: lastTime}, {maxAge: 60000});
            res.send({msg:"登陆成功",cookie:cookie});
            logs.log("after redirect");
            break;
        case 1: //password error
            logs.log("password error");
            //res.render('login', {msg:"密码错误"});
            res.send({msg:"密码错误"});
            break;
        case 2: //user not found
            logs.log("user not found");
            //res.render('login', {msg:"用户名不存在"});
            res.send({msg:"用户名不存在"});
            break;
    }
});

/*
router.get('/login', function(req, res, next){
    logs.log("cookies:");
    logs.log(req.cookies);
    if(isLogined(req)){
        res.redirect('/profile?'+Date.now());
    }else{
        logs.log("render login:");
        res.render('login');
    }
});
*/
router.get('/logout', function(req, res, next){
    res.clearCookie("account");
    res.redirect('/login?'+Date.now());
});

router.get('/profile', function(req, res, next){
    res.render('profile',{
        msg:"您登录为："+req.cookies["account"].account,
        title:"登录成功",
        lastTime:"上次登录："+req.cookies["account"].last
    });
});

module.exports = router;
