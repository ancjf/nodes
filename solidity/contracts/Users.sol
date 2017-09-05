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

    event addEvent(bool createed, uint amount, bool create);
    function add(string _user, uint _amount, bool _create) external{
        if(!exist(_user)){
            if(!_create){
                addEvent(false, 0, _create);
                return;
            }

            userMap[_user].create = true;
        }

        userMap[_user].amount += _amount;
        addEvent(true, userMap[_user].amount, _create);
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

    event setEvent(bool succed, uint amount, bool create);
    function set(string _user, uint _amount, bool _create) external{
        if(!exist(_user)){
            if(!_create){
                setEvent(false, 0, _create);
                return;
            }

            userMap[_user].create = true;
        }

        userMap[_user].amount = _amount;
        setEvent(true, userMap[_user].amount, _create);
    }

    function get(string _user) external constant returns (bool, uint){
        if(!exist(_user)){
            return (false, 0);
        }

        return (true, userMap[_user].amount);
    }
}
