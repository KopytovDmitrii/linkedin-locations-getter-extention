importScripts('../shared/logger.js', '../shared/utils.js', '../shared/constants.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download_csv') {
    try {
      const csv = request.data;
      const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      chrome.downloads.download({
        url: dataUrl,
        filename: 'linkedin_stats.csv',
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          logError('Download error:', chrome.runtime.lastError.message);
          sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: 'ok', downloadId });
        }
      });
    } catch (e) {
      logError('DataURL/Download exception:', e);
      sendResponse({ status: 'error', message: e.message });
    }
    return true;
  }
}); 