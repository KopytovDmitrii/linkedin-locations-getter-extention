//=require modules/logger.js
//=require modules/utils.js
//=require modules/constants.js

function updateCount() {
  chrome.storage.local.get([STORAGE_KEYS.linkedinStats], (result) => {
    const count = (result[STORAGE_KEYS.linkedinStats] || []).length;
    setText(IDS.count, `Собрано: ${count}`);
  });
}

function updateToggleButton() {
  chrome.storage.local.get([STORAGE_KEYS.autoCollectEnabled], (result) => {
    const enabled = !!result[STORAGE_KEYS.autoCollectEnabled];
    setText(IDS.toggleBtn, enabled ? 'Выключить сбор' : 'Включить сбор');
  });
}

getEl(IDS.toggleBtn).onclick = () => {
  chrome.storage.local.get([STORAGE_KEYS.autoCollectEnabled], (result) => {
    const enabled = !result[STORAGE_KEYS.autoCollectEnabled];
    chrome.storage.local.set({ [STORAGE_KEYS.autoCollectEnabled]: enabled }, () => {
      updateToggleButton();
    });
  });
};

getEl(IDS.exportBtn).onclick = () => {
  chrome.storage.local.get([STORAGE_KEYS.linkedinStats], (result) => {
    const allData = result[STORAGE_KEYS.linkedinStats] || [];
    const csv = makeCSV(allData);
    chrome.runtime.sendMessage({ action: 'download_csv', data: csv }, (res) => {
      setText(IDS.status, MSG.exported);
    });
  });
};

getEl(IDS.resetBtn).onclick = () => {
  chrome.storage.local.set({ [STORAGE_KEYS.linkedinStats]: [] }, () => {
    setText(IDS.status, MSG.reset);
    chrome.storage.local.set({ [STORAGE_KEYS.autoCollectEnabled]: false }, () => {
      updateToggleButton();
      updateCount();
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  updateCount();
  updateToggleButton();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEYS.linkedinStats]) {
    updateCount();
  }
}); 