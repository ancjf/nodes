pragma solidity ^0.4.4;

contract File {
    mapping (string => string) fileHash;

    event setEvent(string value, string hash);
    function register(string _name, string _hash) external{
        fileHash[_name] = _hash;
        setEvent(_name, _hash);
    }

    function getHash(string _name) view external returns (string) {
        return fileHash[_name];
    }
}