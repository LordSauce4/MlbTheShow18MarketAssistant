chrome.browserAction.onClicked.addListener(function (activeTab) {
  chrome.tabs.create({ url: 'https://mlb18.theshownation.com/community_market/assistant?min_price=5000&max_price=10000' })
}); 