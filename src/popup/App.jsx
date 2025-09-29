import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ToggleButton from './components/ToggleButton';
import ExportButton from './components/ExportButton';
import ResetButton from './components/ResetButton';
import Counter from './components/Counter';
import StatusMessage from './components/StatusMessage';
import './App.css';

const STORAGE_KEYS = {
  linkedinStats: 'linkedinStats',
  autoCollectEnabled: 'autoCollectEnabled',
};

const MESSAGES = {
  exported: 'Экспортировано!',
  reset: 'Данные сброшены',
};

function App() {
  const [count, setCount] = useState(0);
  const [isAutoCollectEnabled, setIsAutoCollectEnabled] = useState(false);
  const [status, setStatus] = useState('');

  // Функция для создания CSV
  const makeCSV = (data) => {
    return 'Имя,Местоположение\n' + data.map(d => `"${d.name}","${d.location}"`).join('\n');
  };

  // Обновление счетчика
  const updateCount = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEYS.linkedinStats], (result) => {
        const data = result[STORAGE_KEYS.linkedinStats] || [];
        setCount(data.length);
      });
    }
  };

  // Обновление состояния кнопки переключения
  const updateToggleButton = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEYS.autoCollectEnabled], (result) => {
        setIsAutoCollectEnabled(!!result[STORAGE_KEYS.autoCollectEnabled]);
      });
    }
  };

  // Переключение автосбора
  const toggleAutoCollect = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const newState = !isAutoCollectEnabled;
      chrome.storage.local.set({ [STORAGE_KEYS.autoCollectEnabled]: newState }, () => {
        setIsAutoCollectEnabled(newState);
      });
    }
  };

  // Экспорт в CSV
  const exportToCSV = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.runtime) {
      chrome.storage.local.get([STORAGE_KEYS.linkedinStats], (result) => {
        const allData = result[STORAGE_KEYS.linkedinStats] || [];
        const csv = makeCSV(allData);
        chrome.runtime.sendMessage({ action: 'download_csv', data: csv }, (res) => {
          setStatus(MESSAGES.exported);
          setTimeout(() => setStatus(''), 2000);
        });
      });
    }
  };

  // Сброс данных
  const resetData = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [STORAGE_KEYS.linkedinStats]: [] }, () => {
        setStatus(MESSAGES.reset);
        setTimeout(() => setStatus(''), 2000);
        chrome.storage.local.set({ [STORAGE_KEYS.autoCollectEnabled]: false }, () => {
          setIsAutoCollectEnabled(false);
          updateCount();
        });
      });
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    updateCount();
    updateToggleButton();

    // Слушатель изменений в storage
    const handleStorageChange = (changes, area) => {
      if (area === 'local' && changes[STORAGE_KEYS.linkedinStats]) {
        updateCount();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  return (
    <div className="app">
      <Header />
      <ToggleButton isActive={isAutoCollectEnabled} onClick={toggleAutoCollect} />
      <ExportButton onClick={exportToCSV} />
      <ResetButton onClick={resetData} />
      <Counter count={count} />
      <StatusMessage message={status} />
    </div>
  );
}

export default App;
