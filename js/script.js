const ROOTID             = "root________";
const BOOKMARKMENUID     = "menu________";
const BOOKMARKTOOLBARID  = "toolbar_____";
const UNFILEDBOOKMARKSID = "unfiled_____";


var bookmarkRoot; // ブックマークのルート
var bookmarkMenu; // ブックマークメニュー
var bookmarkToolbar; // ブックマークツールバー
var unfiledBookmarks; // 未整理のブックマーク

// 初期化
chrome.bookmarks.getTree(function(bookmarkTreeNode) {

    bookmarkRoot = bookmarkTreeNode[0];

    console.log(bookmarkRoot.children);

    bookmarkRoot.children.forEach(function(bookmark) {

        switch(bookmark.id) {
            case BOOKMARKMENUID:
                bookmarkMenu = bookmark;
                break;
            case BOOKMARKTOOLBARID:
                bookmarkToolbar = bookmark;
                break;
            case UNFILEDBOOKMARKSID:
                unfiledBookmarks = bookmark;
                break;
            default:
                break;

        }

    });

    // ブックマークツールバーの中身を再帰的に書きだしてみる

    printBookmarks(unfiledBookmarks)

});

var indent = "";

function printBookmarks(bookmarks) {

    if (isDirectory(bookmarks)) {

        if (hasChildren(bookmarks)) {

            console.log(indent + bookmarks.title);
            indent += "  ";
            bookmarks.children.forEach(function(child) {

                printBookmarks(child);

            });


        } else {

            console.log(indent + bookmarks.title)

        }

        indent = indent.substr(0, indent.length - 2);

    } else {

        console.log(indent + bookmarks.title);

    }


}

function isDirectory(bookmarks) {

    if (bookmarks.dateGroupModified !== undefined) {
        return true;
    } else {
        return false
    }


}

function hasChildren(bookmarks) {

    if (bookmarks.children !== undefined) {
        return true;
    } else {
        return false
    }

}