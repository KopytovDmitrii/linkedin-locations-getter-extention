import React from 'react';
import './StatusMessage.css';

const StatusMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="status-message">{message}</div>
  );
};

export default StatusMessage;
