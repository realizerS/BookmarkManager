/*
 Open a new tab, and load "managementpage.html" into it.
 */
function openMyPage() {
    console.log("injecting");
    chrome.tabs.create({
        "url": chrome.extension.getURL("html/managementpage.html")
    });
}


/*
 Add openMyPage() as a listener to clicks on the browser action.
 */
chrome.browserAction.onClicked.addListener(openMyPage);
