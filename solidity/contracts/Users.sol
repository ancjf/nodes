pragma solidity ^0.4.4;

contract Users {
    struct userInfo
    {
        bool create;
        uint amount;
    }

    mapping (string => userInfo) userMap;

    function exist(string _user) constant returns (bool){
        return userMap[_user].create;
    }

    event addEvent(bool createed, uint amount);
    function add(string _user, uint _amount, bool create) external{
        if(!exist(_user)){
            if(!create){
                addEvent(false, 0);
                return;
            }

            userMap[_user].create = true;
        }

        userMap[_user].amount += _amount;
        addEvent(true, userMap[_user].amount);
    }

    event decEvent(bool succed, uint amount);
    function dec(string _user, uint _amount) external{
        if(!exist(_user)){
            decEvent(false, 0);
            return;
        }

        if(userMap[_user].amount < _amount){
            decEvent(false, 1);
        }

        userMap[_user].amount -= _amount;
        decEvent(true, userMap[_user].amount);
    }

    event setEvent(bool succed, uint amount);
    function set(string _user, uint _amount, bool create) external{
        if(!exist(_user)){
            if(!create){
                setEvent(false, 0);
                return;
            }

            userMap[_user].create = true;
        }

        userMap[_user].amount = _amount;
        setEvent(true, userMap[_user].amount);
    }

    function get(string _user) external constant returns (bool, uint){
        if(!exist(_user)){
            return (false, 0);
        }

        return (true, userMap[_user].amount);
    }
}
