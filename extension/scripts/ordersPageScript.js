// If we came here from the listings page it was probably the injected cancel button that brought us here
// Go forward to the listings page (if we go back we will get stale data)
if (document.referrer.search(/:\/\/mlb18.theshownation.com\/community_market\/listings/) >= 0) {
  window.location.replace(document.referrer);
}