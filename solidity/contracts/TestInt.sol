pragma solidity ^0.4.4;

contract TestInt {
    uint m_val;

    event setEvent(uint256 _value);
    function set(uint val) returns(uint) {
        m_val = val;
        setEvent(m_val);
        return m_val;
    }

    function get() returns(uint){
        return m_val;
    }
}
