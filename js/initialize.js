/**
 * Created by realizerS on 16/03/15.
 */

// 定数を定義
var ROOTID
if (navigator.userAgent.indexOf("Chrome") > -1) {

    ROOTID = "0";
} else {
    ROOTID = "root________";
}
const BOOKMARKMENUID = "menu________";
const BOOKMARKTOOLBARID = "toolbar_____";
const UNFILEDBOOKMARKSID = "unfiled_____";

// キーコード
const KEYCODEENTER = 13;

const KEYCODESHIFT = 16;
const KEYCODECTRL = 17;

const KEYCODEESCAPE = 27;

const KEYCODESPACE = 32;

const KEYCODELEFT = 37;
const KEYCODEUP = 38;
const KEYCODERIGHT = 39;
const KEYCODEDOWN = 40;

const KEYCODEDELETE = 46;

const KEYCODEA = 65;
const KEYCODEB = 66;
const KEYCODEC = 67;
const KEYCODED = 68;
const KEYCODEE = 69;
const KEYCODEF = 70;
const KEYCODEG = 71;
const KEYCODEH = 72;
const KEYCODEI = 73;
const KEYCODEJ = 74;
const KEYCODEK = 75;
const KEYCODEL = 76;
const KEYCODEM = 77;
const KEYCODEN = 78;
const KEYCODEO = 79;
const KEYCODEP = 80;
const KEYCODEQ = 81;
const KEYCODER = 82;
const KEYCODES = 83;
const KEYCODET = 84;
const KEYCODEU = 85;
const KEYCODEV = 86;
const KEYCODEW = 87;
const KEYCODEX = 88;
const KEYCODEY = 89;
const KEYCODEZ = 90;


const KEYCODEF1  = 112;
const KEYCODEF2  = 113;
const KEYCODEF3  = 114;
const KEYCODEF4  = 115;
const KEYCODEF5  = 116;
const KEYCODEF6  = 117;
const KEYCODEF7  = 118;
const KEYCODEF8  = 119;
const KEYCODEF9  = 120;
const KEYCODEF10 = 121;
const KEYCODEF11 = 122;
const KEYCODEF12 = 123;

// 変数を定義
var bookmarkRoot; // ブックマークのルート
var bookmarkMenu; // ブックマークメニュー
var bookmarkToolbar; // ブックマークツールバー
var unfiledBookmarks; // 未整理のブックマーク


var heartRailsCaptureApiUrl = "http://capture.heartrails.com/400x300?";

var hatenaFaviconApiUrl = "http://favicon.hatena.ne.jp/?url=";

var bookmarkTree;

var oldTitle = "";

// cutデータの初期化
localStorage.cut = "";

window.onload = function () {

    chrome.bookmarks.getTree(function(bookmarkTreeNode) {

        bookmarkTree = bookmarkTreeNode[0];
        bookmarkTree.title = "ROOT";

        for (var i = bookmarkTree.children.length - 1; i >= 0; i-- ) {

            if (!bookmarkTree.children[i].title.length > 0) {

                bookmarkTree.children.splice(i,1);

            }

        }
        doneInitialize();

    });

};


