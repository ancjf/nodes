pragma solidity ^0.4.4;

import "./Strings.sol";

contract Node{
    using Strings for *;

    enum NodeType{
        None,
        Core,   // 核心
        Full,   // 全节点
        Light   //  轻节点
    }
    
    struct NodeInfo{
        string    ip;            
        uint    port;
        uint8    category;
    }

    mapping(string =>NodeInfo) m_nodedata;
    string[] m_nodeids;

    //登记节点信息
    event registerNodeEvent(bool ret);
    function registerNode (string _id, string _ip, uint _port, uint8 _category)  returns(bool) {
        bool find=false;

        for(uint i=0; i < m_nodeids.length; i++){
            if(_id.toSlice().compare(m_nodeids[i].toSlice()) == 0)
            {
                find=true;
                break;
            }
        }

        if( find ){
            registerNodeEvent(true);
            return false;
        }

        m_nodeids.push(_id);
        m_nodedata[_id] = NodeInfo(_ip, _port, _category);

        registerNodeEvent(true);
        return true;
    }
  
    //查询节点信息
    function getNode(string _id) public constant returns(string){
        var slice = "{".toSlice();

        slice = slice.concat("\"id\":\"".toSlice()).toSlice();
        slice = slice.concat(_id.toSlice()).toSlice();

        slice = slice.concat("\",\"ip\":\"".toSlice()).toSlice();
        slice = slice.concat(m_nodedata[_id].ip.toSlice()).toSlice();

        slice = slice.concat("\",\"port\":\"".toSlice()).toSlice();
        uint port = uint(m_nodedata[_id].port);
        slice = slice.concat(port.uintToBytes().bytes32ToString().toSlice()).toSlice();

        slice = slice.concat("\",\"type\":\"".toSlice()).toSlice();
        uint category = uint(m_nodedata[_id].category);
        slice = slice.concat(category.uintToBytes().bytes32ToString().toSlice()).toSlice();

        slice = slice.concat("\"}".toSlice()).toSlice();
        var ret = slice.toString();
        return ret;
    }

    function getNodeType(uint8 _category) public constant returns(string){
        var slice = "[".toSlice();
        for(uint i = 0; i < m_nodeids.length; i++){
            if(_category == uint(NodeType.None) || _category == m_nodedata[m_nodeids[i]].category){
                var str = getNode(m_nodeids[i]);
                slice = slice.concat(str.toSlice()).toSlice();

                if(i+1 < m_nodeids.length){
                    slice = slice.concat(",".toSlice()).toSlice();
                }
            }

        }

        slice = slice.concat("]".toSlice()).toSlice();
        var ret = slice.toString();
        return ret;
    }
}