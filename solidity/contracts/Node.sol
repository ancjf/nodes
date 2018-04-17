pragma solidity ^0.4.4;

import "./Strings.sol";

contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(owner == address(0x0000000000000000000000000000000000000000) || msg.sender == owner);
        _;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract Node is Ownable{
    using Strings for *;

    struct NodeInfo{
        string    property;
        bool    created;
    }

    mapping(string =>NodeInfo) m_nodedata;
    string[] m_nodeids;

    //登记节点信息
    event registerNodeEvent(bool ret);
    function registerNode(string _id, string _property) onlyOwner{
        if(!m_nodedata[_id].created){
            m_nodeids.push(_id);
        }

        m_nodedata[_id] = NodeInfo(_property, true);
        registerNodeEvent(true);
    }

    //登记节点信息
    event unregisterNodeEvent(bool ret);
    function unregisterNode(string _id) onlyOwner{
        if(m_nodedata[_id].created){
            uint i = 0;
            for(; i < m_nodeids.length; i++){
                if(_id.toSlice().compare(m_nodeids[i].toSlice()) == 0)
                    break;
            }

            for(; i < m_nodeids.length-1; i++){
                m_nodeids[i] = m_nodeids[i+1];
            }

            m_nodeids.length--;
            m_nodedata[_id].created = false;
            unregisterNodeEvent(true);
        }else{
            unregisterNodeEvent(false);
        }
    }

    //查询节点信息
    function getNode(string _id) public constant returns(string){
        var slice = "{".toSlice();

        slice = slice.concat("\"id\":\"".toSlice()).toSlice();
        slice = slice.concat(_id.toSlice()).toSlice();

        slice = slice.concat("\",\"property\":\"".toSlice()).toSlice();
        slice = slice.concat(m_nodedata[_id].property.toSlice()).toSlice();

        slice = slice.concat("\"}".toSlice()).toSlice();
        var ret = slice.toString();
        return ret;
    }

    function getAllNode() public constant returns(string){
        var slice = "[".toSlice();
        for(uint i = 0; i < m_nodeids.length; i++){
            var str = getNode(m_nodeids[i]);
            slice = slice.concat(str.toSlice()).toSlice();

            if(i+1 < m_nodeids.length){
                slice = slice.concat(",".toSlice()).toSlice();
            }
        }

        slice = slice.concat("]".toSlice()).toSlice();
        var ret = slice.toString();
        return ret;
    }
}