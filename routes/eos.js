import Eos from 'eosjs';

function is_eos_pub(key){
    if(key.indexOf('EOS') == 0){
        assert(key.length == 53, 'EOS key length err!');
        return true;
    }

    return false;
}

function neweos(wif, httpEndpoint){
    config = {
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', // 32 byte (64 char) hex string
        keyProvider: [wif], // WIF string or array of keys..
        httpEndpoint: httpEndpoint || 'http://mainnet.genereos.io',
        expireInSeconds: 60,
        broadcast: true,
        verbose: false, // API activity
        sign: true
    }

    return Eos(config);
}

function updateauth(wif, acc, newpub, newownerpub, httpEndpoint){
    var eos = neweos(wif, httpEndpoint);
    eos.transaction(function(tr){
        tr.updateauth({
            "account": acc,
            "permission": "active",
            "parent": "owner",
            "auth": {"keys":[{"key":newpub,"weight":1}],"waits":[],"accounts":[],"threshold":1}
        }, {
            authorization: acc + '@owner',
            broadcast: true,
            sign: true,
        });

        tr.updateauth({
            "account": acc,
            "permission": "owner",
            "parent": "",
            "auth": {"keys":[{"key":newownerpub,"weight":1}],"waits":[],"accounts":[],"threshold":1}
        }, {
            authorization: acc + '@owner',
            broadcast: true,
            sign: true,
        });
    }).then(function (tr) {
        console.log('transaction_id', tr.transaction_id);
        console.log('acc:', acc);
        console.log('new owner:', newownerpub);
        console.log('new avitve:', newpub);
    }).catch(function (error) {
        console.log('error:', error);
    });
}

var eos = function (rpc) {}
eos.prototype.updateauth = updateauth;
eos.prototype.is_eos_pub = is_eos_pub;

if(typeof window!=="undefined")
    window.webs = eos;
else
    module.exports = eos;
