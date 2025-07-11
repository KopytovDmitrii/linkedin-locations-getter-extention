// Логгер (локально, т.к. importScripts не работает в content script)
function logInfo(...args) { console.log('[INFO]', ...args); }
function logWarn(...args) { console.warn('[WARN]', ...args); }
function logError(...args) { console.error('[ERROR]', ...args); }

logInfo('Content script loaded');

function parseLinkedInBlock() {
  const list = document.querySelector('ul[role="list"]');
  const allLis = list ? Array.from(list.querySelectorAll('li')) : [];
  const profiles = allLis.filter(li => li.querySelector('div[data-chameleon-result-urn]'));
  logInfo('[LinkedInStats] Найдено профилей:', profiles.length);
  const results = [];
  profiles.forEach(profile => {
    const name = profile.querySelector('span[aria-hidden="true"]')?.innerText?.trim() || '';
    // const location = profile.querySelector('div.wkuwaivzqVqBIfTQAOYqPnstlNGlQqrEkQpE')?.innerText?.trim() || '';
    const t14Blocks = profile.querySelectorAll('div.t-14.t-normal');
    const location = t14Blocks.length >= 2 ? t14Blocks[1].innerText.trim() : '';
    if (name && location) {
      results.push({ name, location });
    }
  });
  logInfo('[LinkedInStats] Результат парсинга:', results);
  return results;
}

function autoCollect() {
  logInfo('autoCollect: start');
  chrome.storage.local.get(['autoCollectEnabled', 'linkedinStats'], (result) => {
    logInfo('autoCollectEnabled:', result.autoCollectEnabled);
    if (!result.autoCollectEnabled) return;
    const newData = parseLinkedInBlock();
    let allData = result.linkedinStats || [];
    let added = false;
    newData.forEach(item => {
      if (!allData.some(d => d.name === item.name && d.location === item.location)) {
        allData.push(item);
        added = true;
      }
    });
    if (added) {
      chrome.storage.local.set({ linkedinStats: allData }, () => {
        logInfo('Обновлено storage, всего строк:', allData.length);
      });
    } else {
      logInfo('Новых данных не найдено');
    }
  });
}

// Отслеживаем изменение URL (переключение страниц)
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    logInfo('Обнаружено изменение URL:', lastUrl);
    setTimeout(autoCollect, 1000); // задержка для загрузки контента
  }
}, 1000);

// Отслеживаем изменения DOM (например, ajax-подгрузка)
const observer = new MutationObserver(() => {
  chrome.storage.local.get(['autoCollectEnabled'], (result) => {
    if (result.autoCollectEnabled) {
      logInfo('MutationObserver: запуск autoCollect');
      autoCollect();
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// Для совместимости с ручным запуском (если потребуется)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'collect_data') {
    logInfo('Получен collect_data через runtime message');
    const data = parseLinkedInBlock();
    sendResponse({ data });
  }
}); 