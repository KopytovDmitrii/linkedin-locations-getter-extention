import React from 'react';
import './ExportButton.css';

const ExportButton = ({ onClick }) => {
  return (
    <button className="export-button" onClick={onClick}>
      Экспорт CSV
    </button>
  );
};

export default ExportButton;
