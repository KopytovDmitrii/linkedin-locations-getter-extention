import React from 'react';
import './ToggleButton.css';

const ToggleButton = ({ isActive, onClick }) => {
  return (
    <button
      className={`toggle-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {isActive ? 'Выключить сбор' : 'Включить сбор'}
    </button>
  );
};

export default ToggleButton;
