import React from 'react';
import './Counter.css';

const Counter = ({ count }) => {
  return (
    <div className="counter">Собрано: {count}</div>
  );
};

export default Counter;
