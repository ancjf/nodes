pragma solidity ^0.4.4;

contract User {
    struct userInfo
    {
        bool create;
        mapping (string => string) property;
    }

    mapping (string => userInfo) userMap;

    event setEvent(string value);
    function set(string _user, string _pro, string _value) external{
        setEvent(userMap[_user].property[_pro]);
        userMap[_user].property[_pro] = _value;
    }

    function get(string _user, string _pro) constant external returns (string) {
        string val = userMap[_user].property[_pro];
        return val;
    }
}
