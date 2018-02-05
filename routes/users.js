/**
 * Created by ac on 2018/2/1.
 */

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var logs = require('./logs.js');
var Web3 = require('web3');
var SQLite3 = require('sqlite3').verbose();

/**
 * 使用sqlite3持久化数据
 * 需求：把一个数组中的每个对象,每个对象中的属性,存到xxx.db文件中去,像数据库一样的去操作它
 * 功能：1. 创建数据库(数据库存在的话，那就直接打开)
 *       2. 创建一个表(表存在的话就不用创建啦)
 *       3. 有了数据库和表, 最最基础的功能就是：
 *          插入数据(单个数据插入或者多个并行插入)
 *          更新数据(根据不同的条件更新每列数据)
 *          删除数据(根据不同的条件来删除每列数据)
 *          查询数据(单个数据查询，多个数据查询)
 */
class HandleDB {

    constructor(options) {
        this.databaseFile = options && options.databaseFile || `./account.db`;    // 数据库文件(文件路径+文件名)
        this.tableName = options && options.tableName || `account`;   // 表名

        this.db = null;    // 打开的数据库对象
    }

    // 连接数据库(不存在就创建,存在则打开)
    connectDataBase() {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.db = new SQLite3.Database(_self.databaseFile, function(err) {
                if (err) reject(new Error(err));
                resolve('open database succeed!');
            });
        });
    }

    /**
     * 创建表
     * @param sentence    CREATE TABLE 语句
     * @used
     let sentence = `
     create table if not exists ${this.tableName}(
     begin_time varchar(255),
     create_time varchar(255),
     end_time varchar(255),
     play_id varchar(255),
     postion_id int(50),
     status int(50),
     task_id int(50)
     );`;
     this.createTable(sentence);
     */
    createTable(sentence) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.db.exec(sentence, function(err) {
                if (err) reject(new Error(err));
                resolve(`exist`);
            });
        });
    }

    /**
     * 执行 增  删  改  查(单个数据查询或者多个数据查询)
     * @param sql    sql语句
     * @param param     参数(可以是数组或者数字或者字符串,根据sql语句来定)
     * @param mode    执行模式, 默认run,执行sql,如果查询的话,则使用get(单个)all(多个)
     * @returns {Promise}
     @used
     增 : this.sql(`insert into ${this.tableName} (begin_time, create_time, end_time, play_id, postion_id, status, task_id) values(?, ?, ?, ?, ?, ?, ?)`,
     [obj.begin_time, obj.create_time, obj.end_time, obj.play_id, obj.postion_id, obj.status, obj.task_id]);

     删 : this.sql(`delete from ${this.tableName} where id = ?`, id);

     改 : this.sql(`update ${this.tableName} set begin_time = ?, status = ? where postion_id = ?`, [begin_timeValue, statusValue, postion_idValue]);

     查 : this.sql(`select * from ${this.tableName} where id = ?`, id, 'get/all');
     */
    sql(sql, param, mode) {
        let _self = this;
        mode = mode == 'all' ? 'all' : mode == 'get' ? 'get' : 'run';
        return new Promise((resolve, reject) => {
            _self.db[mode](sql, param,
                function (err, data) {    // data: Array, Object
                    //logs.logvar(sql, param, err, data);
                    if (err) {
                        reject(new Error(err.code));
                    } else {
                        if (data) {
                            resolve(data);    // 返回数据查询成功的结果
                        } else {
                            resolve('success');    // 提示 增 删 改 操作成功
                        };
                    };
                }
            );
        });
    }
};

// used:
let db = new HandleDB({
    databaseFile: './account.db',
    tableName: 'account'
});

db.connectDataBase().then((result)=>{
    console.log(result);
    // 创建表(如果不存在的话,则创建,存在的话, 不会创建的,但是还是会执行回调)
    let sentence = `
       create table ${db.tableName}(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account varchar(255) UNIQUE,
            password varchar(300),
            last_time varchar(255)
        );`;
    return db.createTable(sentence);
}).then((result)=>{
    //logs.logvar(result);
    doLogic();
}).catch((err)=>{
    //logs.logvar(err);
});

let doLogic = function() {

    // 增
    db.sql(`insert into ${db.tableName} (account, password, last_time) values(?, ?, ?)`,
        ['admin', Web3.prototype.sha3('123456'), Date().toString()]).then((res)=>{
        logs.logvar(res);
    }).catch((err)=>{
        logs.logvar(err);
    });
/*
    // 一次性插入多个数据
    var data = {
        "Body": [
            {
                "account": "user1",
                "password": Web3.prototype.sha3('123456'),
                "last_time": Date().toString()
            },
            {
                "account": "user2",
                "password": Web3.prototype.sha3('123456'),
                "last_time": Date().toString()
            }
        ],
        "Code": 0,
        "Message": ""
    };
    var arr = data.Body;
    var promises = arr.map(function(obj) {
        return db.sql(`insert into ${db.tableName} (account, password, last_time) values(?, ?, ?)`,
            [obj.account, obj.password, obj.last_time]);
    });
    Promise.all(promises).then(function (posts) {
        logs.logvar('全部插入完毕', posts)
    }).catch(function(reason){
        logs.logvar(reason);
    });

    // 删
    db.sql(`delete from ${db.tableName} where account = ?`, 'user1').then((res)=>{
        logs.logvar(res);
    }).catch((err)=>{
        logs.logvar(err);
    });

    // 改
    db.sql(`update ${db.tableName} set last_time = ? where account = ?`, ['user2', Date().toString()]).then((res)=>{
        logs.logvar(res);
    }).catch((err)=>{
        logs.logvar(err);
    });

    // 查
    db.sql(`select * from ${db.tableName} where account = ?`, 'admin', 'get').then((res)=>{
        logs.logvar(res);
    }).catch((err)=>{
        logs.logvar(err);
    });
    */
};

function create_account(account, password, ballback) {
    logs.logvar(account, password);
    db.sql(`insert into ${db.tableName} (account, password, last_time) values(?, ?, ?)`,
        [account, password, Date().toString()]).then((res)=>{
        //logs.logvar(res);
        ballback(false, res);
    }).catch((err)=>{
        //logs.logvar(err.name, typeof(err.message), err.message, err);
        var msg = err.message;
        if(msg == 'SQLITE_CONSTRAINT')
            msg = '账号已经存在!';
        ballback(true, msg);
    });
}

function updateLastLoginTime(account){
    db.sql(`update ${db.tableName} set last_time = ? where account = ?`, [Date().toString(), account]).then((res)=>{
        logs.logvar(account, res);
    }).catch((err)=>{
        logs.logvar(account, err);
    });
}

function auth_login(account, password, callback){
    db.sql(`select * from ${db.tableName} where account = ?`, account, 'get').then((res)=>{
        logs.logvar(typeof (res), res);
        if(typeof (res) == "object"){
            if(res.password == password){
                callback(0, res);
            }else{
                callback(1);
            }
        }else{
            callback(2);
        }
    }).catch((err)=>{
        logs.logvar(err);
        callback(false);
    });
}

router.requireAuth = function(req, res, next){
    if(req.path.substring(0, 8) != "/secure/") {
        next();
        return;
    }

    //logs.logvar(typeof(req.cookies), req.cookies);
    if(typeof(req.cookies) != 'undefined'  && req.cookies["account"] != null){
        var cook = JSON.parse(req.cookies.account);
        var account = cook.account;
        var password = cook.password;
        //logs.logvar(account, password, cook);

        auth_login(account, password, function (result) {
            if(0 == result){
                //logs.log(req.cookies.account.account + " had logined.");
                next();
            }else{
                res.redirect('/login.html?back=' + req.path);
            }
        });

        return;
    }

    res.redirect('/login.html?back=' + req.path);
};

function login(args, res, next){
    var account = args.account;
    var password = args.password;
    logs.logvar(account, password);

    auth_login(account, password, function (result, row) {
        switch(result){
            case 0: //success
                updateLastLoginTime(account);
                //logs.logvar("login ok last", account);
                var cookie = {"account":{account: account, password: password, last: row.last_time},"attr":{expires: 60000}};
                res.send({msg:"登陆成功",cookie:cookie});
                break;
            case 1: //password error
                res.send({msg:"密码错误"});
                break;
            case 2: //user not found
                res.send({msg:"用户名不存在"});
                break;
        }
    })
};

router.post('/login', function(req, res, next){
    login(req.body, res, next);
});

router.get('/login', function(req, res, next){
    login(req.query, res, next);
});

function register(args, res, next){
    var account = args.account;
    var password = args.password;
    logs.logvar(account, password);

    create_account(account, password, function (err, result) {
        logs.logvar(err, result);
        if (!err) {
            res.send({msg: "注册成功"});
        } else {
            res.send({msg: result});
        }
    });
};

router.post('/register', function(req, res, next){
    register(req.body, res, next);
});

router.get('/register', function(req, res, next){
    register(req.query, res, next);
});

module.exports = router;
