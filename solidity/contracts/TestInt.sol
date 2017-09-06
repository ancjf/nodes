pragma solidity ^0.4.4;

contract TestInt {
    int m_val;

    event setEvent(int256 value);
    function set(int val) returns(int) {
        m_val = val;
        setEvent(m_val);
        return m_val;
    }

    event addEvent(int256 value);
    function add(int val) returns(int) {
        m_val += val;
        addEvent(m_val);
        return m_val;
    }
    event subEvent(int256 value);
    function sub(int val) returns(int) {
        m_val -= val;
        subEvent(m_val);
        return m_val;
    }

    event incEvent(int256 value, uint count);
    function inc(uint count) returns(int) {
        uint i = 0;
        for(; i < count; i++){
            m_val++;
        }

        incEvent(m_val, i);
        return m_val;
    }

    event decEvent(int256 value, uint count);
    function dec(uint count) returns(int) {
        uint i = 0;
        for(; i < count; i++){
            m_val--;
        }

        decEvent(m_val, i);
        return m_val;
    }

    function get() constant returns(int){
        return m_val;
    }
}
