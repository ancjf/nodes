
function rpc_funs() {
    return {
        "eth_protocolVersion": {"params": [], "order": [], "returns" : "" },
        "eth_blockNumber": {"params": [], "order": [], "returns" : ""},
        "eth_getBlockByNumber": {"params": ["", false],"order": [], "returns": {}},
        "eth_getBlockByHash": {"params": ["", false],"order": [], "returns": {}},
        "eth_getTransactionByHash": {"params": [""], "order": [], "returns": {}},
        "eth_getTransactionByBlockHashAndIndex": {"params": ["", ""], "order": [], "returns": {}},
        "eth_getTransactionByBlockNumberAndIndex": {"params": ["", ""], "order": [], "returns": {}},
        "eth_getTransactionReceipt": {"params": [""], "order": [], "returns": {}},
        "personal_listAccounts": {"params": [], "returns": [] },
        "personal_newAccount": {"params": [""], "returns": "" },
        "personal_unlockAccount": {"params": ["", "", 0], "returns": true },
        "admin_peers": {"params": [], "returns": {}},
        "admin_addPeer": {"params": [""], "returns": true},
        "eth_mining": {"params": [], "order": [], "returns" : false },
        "eth_gasPrice": {"params": [], "order": [], "returns" : "" },
        "eth_accounts": {"params": [], "order": [], "returns" : [] },
        "eth_getBalance": {"params": ["", ""], "order": [], "returns" : ""},
        "eth_getStorageAt": {"params": ["", "", ""], "order": [], "returns": ""},
        "eth_getStorageRoot": {"params": ["", ""], "order": [], "returns": ""},
        "eth_getTransactionCount": {"params": ["", ""], "order": [], "returns" : ""},
        "eth_pendingTransactions": {"params": [], "order": [], "returns" : ""},
        "eth_getBlockTransactionCountByHash": {"params": [""], "order": [], "returns" : {}},
        "eth_getBlockTransactionCountByNumber": {"params": [""], "order": [], "returns" : {}},
        "eth_getCode": {"params": ["", ""], "order": [], "returns": ""},
        "eth_getUncleByBlockHashAndIndex": {"params": ["", ""], "order": [], "returns": {}},
        "eth_getUncleCountByBlockHash": {"params": [""], "order": [], "returns" : {}},
        "eth_getUncleCountByBlockNumber": {"params": [""], "order": [], "returns" : {}}/*,
        "eth_getLogs": {"params": [{}], "order": [], "returns": []},
        "eth_getLogsEx": {"params": [{}], "order": [], "returns": []},
        "eth_hashrate": {"params": [], "order": [], "returns" : "" },
        "eth_coinbase": {"params": [], "order": [], "returns" : "" },
        "eth_sendTransaction": {"params": [{}], "order": [], "returns": ""},
        "eth_call": {"params": [{}, ""], "order": [], "returns": ""},
        "eth_flush": {"params": [], "order": [], "returns" : true},
        "eth_getUncleByBlockNumberAndIndex": {"params": ["", ""], "order": [], "returns": {}},
        "eth_newFilter": {"params": [{}], "order": [], "returns": ""},
        "eth_newFilterEx": {"params": [{}], "order": [], "returns": ""},
        "eth_newBlockFilter": {"params": [], "order": [], "returns": ""},
        "eth_newPendingTransactionFilter": {"params": [], "order": [], "returns": ""},
        "eth_uninstallFilter": {"params": [""], "order": [], "returns": true},
        "eth_getFilterChanges": {"params": [""], "order": [], "returns": []},
        "eth_getFilterChangesEx": {"params": [""], "order": [], "returns": []},
        "eth_getFilterLogs": {"params": [""], "order": [], "returns": []},
        "eth_getFilterLogsEx": {"params": [""], "order": [], "returns": []},
        "eth_getWork": {"params": [], "order": [], "returns": []},
        "eth_submitWork": {"params": ["", "", ""], "order": [], "returns": true},
        "eth_submitHashrate": {"params": ["", ""], "order": [], "returns": true},
        "eth_register": {"params": [""], "order": [], "returns": ""},
        "eth_unregister": {"params": [""], "order": [], "returns": true},
        "eth_fetchQueuedTransactions": {"params": [""], "order": [], "returns": []},
        "eth_signTransaction": {"params": [{}], "order": [], "returns": ""},
        "eth_inspectTransaction": {"params": [""], "order": [], "returns": {}},
        "eth_sendRawTransaction": {"params": [""], "order": [], "returns": ""},
        "eth_notePassword": {"params": [""], "order": [], "returns": true},
        "eth_syncing": {"params": [], "order": [], "returns": {}},
        "eth_estimateGas": {"params": [{}], "order": [], "returns": ""}*/
    };
}

function rpc_fun(name){
    var funs = rpc_funs();

    return funs[name];
}

function rpc_ret(name){
    var funs = rpc_funs();

    return funs[name].returns;
}

function rpc_call(url, name, params, fun) {
    var data = {"jsonrpc":"2.0","id":"2","method":name,"params":params};
    data = JSON.stringify(data);
    console.log("typeof(data)=", typeof(data), 'data=', data, ",url=", url);
    $.ajax({
        "url":url,
        "type": 'post',
        "dataType": 'String',
        //"contentType": 'application/x-www-form-urlencoded',
        "contentType": 'application/json',
        /*
        xhrFields:{
            withCredentials:true
        },
        */
        crossDomain:true,
        //processData: false,
        "data": data,
        complete:function(XMLHttpRequest, textStatus){
            console.log('textStatus=', textStatus);
            if(textStatus == 'timeout'/* || textStatus == 'parsererror'*/){
                console.log('XMLHttpRequest.responseText=', XMLHttpRequest.responseText);
                var xmlhttp = getRequest();
                xmlhttp.abort();
                console.log('timeout');
                fun(true, textStatus);
                return;
            }

            fun(false, XMLHttpRequest.responseText);
        }
    });
}