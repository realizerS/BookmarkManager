/**
 * Created by realizerS on 16/03/15.
 */

function changeCurrent(dirId) {

    changeNavCurrent(dirId);
    changeNavFavCurrent(dirId);

}

function changeNavCurrent(dirId) {

    $("#folder_list .current").removeClass("current");

    $.each($(".sidebar_item_container"), function (idx, itemContainer) {

        if($(itemContainer).attr("folder_id") == dirId) {
            $(itemContainer).addClass("current");
        }

    });

}
function changeNavFavCurrent(dirId) {

    $("#fav_folder_list .current").removeClass("current");

    $.each($(".sidebar_fav_item_container"), function (idx, itemContainer) {

        if($(itemContainer).attr("folder_id") == dirId) {
            $(itemContainer).addClass("current");
        }

    });

}

// ページ内容(コンテンツの部分)を書き換える
function repaintContent(dirId) {

    // 左のナビのcurrentクラスを更新
    changeCurrent(dirId);

    // draggable と droppable を削除
    removeDragAndDropListener();

    // コンテンツ部分を消去
    clearContent();

    // コンテンツ部分を描画 & drag&drop のリスナを追加
    if (dirId != null) {

        if (dirId == ROOTID || dirId == "0") {

            //printDirInfo(bookmarkTree)

            printBreadcrumbList(bookmarkTree);
            printBookmarks(bookmarkTree.children)
            setDragAndDropListener();

        } else {

            chrome.bookmarks.get(dirId, function (bookmarks) {
                //printDirInfo(bookmarks[0])
                printBreadcrumbList(bookmarks[0])
                setDragAndDropListener();
            })

            chrome.bookmarks.getChildren(dirId, function (bookmarks) {
                printBookmarks(bookmarks);
                setDragAndDropListener();
            });

        }

    }

}

function repaintFolderListAndContent(dirId) {

    // draggable と droppable を削除
    removeDragAndDropListener();


    // コンテンツ部分を消去
    clearContent();

    // コンテンツ部分を描画 & drag&drop のリスナを追加
    if (dirId != null) {

        if (dirId == ROOTID || dirId == "0") {

            clearFolderList();
            chrome.bookmarks.getTree(function (bookmarkTreeNode) {

                bookmarkTree = bookmarkTreeNode[0];
                bookmarkTree.title = "ROOT";
                for (var i = bookmarkTree.children.length - 1; i >= 0; i-- ) {

                    if (!bookmarkTree.children[i].title.length > 0) {

                        bookmarkTree.children.splice(i,1);

                    }

                }
                printBookmarksInSidebar(bookmarkTree, $("#folder_list"));
            });

            printBookmarks(bookmarkTree.children)

            setDragAndDropListener();

        } else {

            clearFolderList();
            chrome.bookmarks.getTree(function (bookmarkTreeNode) {

                bookmarkTree = bookmarkTreeNode[0];
                bookmarkTree.title = "ROOT";
                for (var i = bookmarkTree.children.length - 1; i >= 0; i-- ) {

                    if (!bookmarkTree.children[i].title.length > 0) {

                        bookmarkTree.children.splice(i,1);

                    }

                }
                printBookmarksInSidebar(bookmarkTree, $("#folder_list"));
            });

            chrome.bookmarks.getChildren(dirId, function (bookmarks) {
                printBookmarks(bookmarks);
                setDragAndDropListener();
            });

        }

    }

    // 左のナビのcurrentクラスを更新
    changeCurrent(dirId);


}

// パンくずリストを作る(書き換える)
function printBreadcrumbList(dir) {

    var bookmarkList = [];
    bookmarkList.unshift(dir);

    printBreadcrumbListIter(dir, bookmarkList);

}

function printBreadcrumbListIter(dir, bookmarkList) {


    if (dir.parentId != null) {

        // 書き換えに必要なブックマークの情報を集める
        chrome.bookmarks.get(
            dir.parentId,
            function (bookmarks) {
                bookmarkList.unshift(bookmarks[0]);
                printBreadcrumbListIter(bookmarks[0], bookmarkList);

            }
        );


    } else {

        // 再帰が終わった時にパンくずリストを作成する
        var counter = 0;
        bookmarkList.forEach(function (bookmark, idx) {

            counter = idx;
            var bookmark = bookmarkList[idx];

            // パンくずリストのidx番目がある場合
            if ($("#breadcrumb_list_container .breadcrumb_list_item").eq(idx)[0] != null) {

                var itemTitle = $("#breadcrumb_list_container .breadcrumb_list_item").eq(idx).find(".title").html();
                var itemId = $("#breadcrumb_list_container .breadcrumb_list_item").eq(idx).attr("_id");

                if (
                     itemTitle == "ROOT" ||
                     ( itemTitle == bookmark.title && itemId == bookmark.id )
                ) {
                    // 何もしない
                } else {
                    // 内容の書き換え
                    $("#breadcrumb_list_container .breadcrumb_list_item").eq(idx).attr("folder_id", bookmark.id);
                    $("#breadcrumb_list_container .breadcrumb_list_item").eq(idx).attr("_id", bookmark.id);
                    $("#breadcrumb_list_container .breadcrumb_list_item").eq(idx).find(".title").html(bookmark.title);
                }


            } else {

                var listItem = cloneBreadcrumbListItem(bookmark);
                $("#breadcrumb_list_container .breadcrumb_list").append(listItem);

            }
        });

        // 余分なパンくずを消去
        $("#breadcrumb_list_container .breadcrumb_list_item:gt(" + counter + ")").remove();

        // 一番右のパンくずをカレントに
        $("#breadcrumb_list_container .current").removeClass("current");
        $("#breadcrumb_list_container .breadcrumb_list_item").last().addClass("current");

    }

}



// bookmarks is an array of bookmarks, may be null.
// appendTarget is an jQuery obj for append cloned object.
function printBookmarksInSidebar(bookmark, appendTarget) {


    if (bookmark.children != null) {

        bookmark.children.forEach(function (bookmark) {


            if (isDirectory(bookmark)) {

                var clone = cloneSidebarFolder(bookmark);

                clone.appendTo(appendTarget);

                var childContainer = $("#cloneItems .sidebar_child_item_container").clone(true);
                childContainer.attr("parent_id", bookmark.id)
                childContainer.appendTo(appendTarget);

                if (hasChildren(bookmark)) {


                    printBookmarksInSidebar(bookmark, childContainer);

                    // フォルダの子を持っていなかったら開閉の矢印を非表示に
                    if (childContainer.find(".sidebar_item_container").length === 0) {
                        clone.find(".sidebar_icon_container i").css("display", "none");
                    }

                } else {

                    // 開閉の矢印を非表示
                    clone.find(".sidebar_icon_container i").css("display", "none");


                }

            }

        });

    }


}

function printFavoriteBookmarks() {

    var appendTarget = $("#fav_folder_list");

    // 初期値はundefinedであることに注意
    var favList = localStorage.favorite;

    if (favList != null) {
        favList = JSON.parse(localStorage.favorite);
    }

    if (favList == null || favList.length === 0) {
        return ;
    }

    favList.forEach(function (fav) {

        var clone = cloneSidebarFavFolder(fav);

        clone.appendTo(appendTarget);

    })


}

// print bookmarks (not recursive)
// bookmarks is an array of bookmarks, may be null.
function printBookmarks(bookmarks) {

    var appendTarget = $("#content_list");

    if (bookmarks != null && bookmarks.length > 0) {

        bookmarks.forEach(function (bookmark) {

            if (isDirectory(bookmark)) {

                var item = cloneFolder(bookmark)

                item.appendTo(appendTarget);

            } else {

                var item = cloneItem(bookmark); 

                item.appendTo(appendTarget);

            }

        });


    }

}

function printBookmarksRecursively(bookmark, re) {

    if (isDirectory(bookmark)) {

        // 正規表現に合致したら表示
        if (re.test(bookmark.title)) {

            var item = cloneFolder(bookmark);

            if ($("#content_list .folder").length > 0) {
                item.insertAfter($("#content_list .folder").last());
            } else {
                item.prependTo($("#content_list"));
            }

        }


        if (hasChildren(bookmark)) {

            bookmark.children.forEach(function (child) {

                printBookmarksRecursively(child, re);

            });
        }

    } else {

        // 正規表現に合致したらアイテムを表示
        if (re.test(bookmark.title)) {
            var item = cloneItem(bookmark);

            item.appendTo($("#content_list"));

        }

    }

}

function printBookmarksRecursivelyByTag(bookmark, re, tagList) {

    var match = false;
    var _id = bookmark.id;
    var tagListArray = tagList[_id];

    if (tagListArray != null) {
        var len = tagListArray.length;
        for (var i = 0; i < len; i++) {
            if (re.test(tagListArray[i])) {
                match = true;
                break;
            }
        }
    }


    if (isDirectory(bookmark)) {

        // 正規表現に合致したら表示
        if (match) {

            var item = cloneFolder(bookmark);

            if ($("#content_list .folder").length > 0) {
                item.insertAfter($("#content_list .folder").last());
            } else {
                item.prependTo($("#content_list"));
            }

        }


        if (hasChildren(bookmark)) {

            bookmark.children.forEach(function (child) {

                printBookmarksRecursivelyByTag(child, re, tagList);

            });
        }

    } else {

        // 正規表現に合致したらアイテムを表示
        if (match) {
            var item = cloneItem(bookmark);

            item.appendTo($("#content_list"));

        }

    }

}

function printBookmarksRecursivelyByAll(bookmark, re, tagList) {

    var match = false;
    var _id = bookmark.id;
    var tagListArray = tagList[_id];

    if (bookmark.id != ROOTID && bookmark.title.length > 0) {

        if (re.test(bookmark.title) || re.test(bookmark.url)) {

            match = true;

        } else if (tagListArray != null) {

            var len = tagListArray.length;
            for (var i = 0; i < len; i++) {
                if (re.test(tagListArray[i])) {
                    match = true;
                    break;
                }
            }

        }

    }



    if (isDirectory(bookmark)) {

        // 正規表現に合致したら表示
        if (match) {

            var item = cloneFolder(bookmark);

            if ($("#content_list .folder").length > 0) {
                item.insertAfter($("#content_list .folder").last());
            } else {
                item.prependTo($("#content_list"));
            }

        }


        if (hasChildren(bookmark)) {

            bookmark.children.forEach(function (child) {

                printBookmarksRecursivelyByAll(child, re, tagList);

            });
        }

    } else {

        // 正規表現に合致したらアイテムを表示
        if (match) {
            var item = cloneItem(bookmark);

            item.appendTo($("#content_list"));

        }

    }

}


// イベントを入力に
// コンテクストメニューを表示
function printContextMenu(e) {

    // invalid状況の初期化
    $(".menu_invalid").removeClass("menu_invalid");

    // cutの状況に応じてコンテクストメニューに表示する貼り付けの状態を変化させる
    changePasteState();

    // アクティブを変更
    if ($(e.target).closest(".handle").closest(".item").hasClass("selected")) {

    } else if ($(e.target).closest(".handle").closest(".item").length > 0) {

        $(".selected").removeClass("selected");
        $(".active").removeClass("active");
        $(e.target).closest(".item").addClass("selected active");

    } else if (
        $(e.target).closest(".nub").hasClass("sidebar_item_container") ||
        $(e.target).closest(".nub").hasClass("sidebar_fav_item_container") ){

        $(".selected").removeClass("selected");
        $(".active").removeClass("active");
        $(e.target).closest(".nub").addClass("active")

    } else {

        $(".selected").removeClass("selected");
        $(".active").removeClass("active");

    }

    // activeの場所により、表示される内容を変更
    if ($(".active").hasClass("sidebar_item_container") || $(".active").hasClass("sidebar_fav_item_container")) {

        $(".menu_create").addClass("menu_invalid");
        $(".menu_cut").addClass("menu_invalid");
        $(".menu_get_image").addClass("menu_invalid");
        $(".menu_reorder").addClass("menu_invalid");

    }

    // 検索中は整理不可
    if (parseInt($("#search_bar").css("top").slice(0, -2)) > 0) {

        $(".menu_reorder").addClass("menu_invalid");

    }



        // メニューを表示する。
    // position fixed なのでスクロール量は考慮する必要なし
    $("#menu").css({left: e.clientX, top: e.clientY, display: "block"})



}

