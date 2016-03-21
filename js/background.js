/*
 Open a new tab, and load "managementpage.html" into it.
 */
function openMyPage() {
    console.log("injecting");
    
    // クロームブラウザ
    if (navigator.userAgent.indexOf("Chrome") > -1) {

        chrome.tabs.create({
            "url": chrome.extension.getURL("html/BookmarkManagement.html#id=0")
        });

    } else {
        // firefoxブラウザ
        chrome.tabs.create({
            "url": chrome.extension.getURL("html/BookmarkManagement.html#id=root________")
        });

    }



}


/*
 Add openMyPage() as a listener to clicks on the browser action.
 */
chrome.browserAction.onClicked.addListener(openMyPage);
