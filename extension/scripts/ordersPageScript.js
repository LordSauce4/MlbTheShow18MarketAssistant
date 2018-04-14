// If we came here from a listing it was probably the injected cancel button that brought us here
// Go forward to the listing (if we go back we will get stale data)
if (document.referrer.search(/:\/\/mlb18.theshownation.com\/community_market\/listings\/\/*/) >= 0) {
    window.location.replace(document.referrer);
}