/**
 * Created by realizerS on 16/03/15.
 */

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

function removeDragAndDropListener() {

    if ($("#content_list .li_content").data('ui-draggable')) {
        $("#content_list .li_content").draggable("destroy");
    }
    if ($("#content_list .folder .material-icons").data('ui-droppable')) {
        $("#content_list .folder .material-icons").droppable("destroy");
    }
    if ($("#folder_list .sidebar_item_container").data('ui-droppable')) {
        $("#folder_list .sidebar_item_container").droppable("destroy");
    }
    if ($("#fav_folder_list .sidebar_fav_item_container").data('ui-droppable')) {
        $("#fav_folder_list .sidebar_fav_item_container").droppable("destroy");
    }

}

// ページ内容(コンテンツの部分)を書き換える
function repaintContent(dirId) {

    // 左のナビのcurrentクラスを更新
    changeNavCurrent(dirId);
    changeNavFavCurrent(dirId);

    // draggable と droppable を削除
    removeDragAndDropListener();

    // コンテンツ部分を消去
    clearContent();

    // コンテンツ部分を描画 & drag&drop のリスナを追加
    if (dirId != null) {

        if (dirId == ROOTID || dirId == "0") {

            //printDirInfo(bookmarkTree)

            clearBreadcrumbList();
            printBreadcrumbList(bookmarkTree);
            printBookmarks(bookmarkTree.children)
            setDragAndDropListener();

        } else {

            chrome.bookmarks.get(dirId, function (bookmarks) {
                clearBreadcrumbList();
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
    changeNavCurrent(dirId);
    changeNavFavCurrent(dirId);


}

// パンくずリストを作る
function printBreadcrumbList(dir) {

    var listItem = cloneBreadcrumbListItem(dir);

    if (dir.parentId != null) {

        $("#breadcrumb_list_container .breadcrumb_list").prepend(listItem);

        chrome.bookmarks.get(
            dir.parentId,
            function (bookmarks) {

                printBreadcrumbList(bookmarks[0]);

            }
        );


    } else {

        // ルート要素にたどり着いた時。再帰は終了する。

        $("#breadcrumb_list_container .breadcrumb_list").prepend(listItem);

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
    
    var favList = JSON.parse(localStorage.favorite);

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


// イベントを入力に
// コンテクストメニューを表示
function printContextMenu(e) {

    // invalid状況の初期化
    $(".menu_invalid").removeClass("menu_invalid");

    // cutの状況に応じてコンテクストメニューに表示する貼り付けの状態を変化させる
    changePasteState();

    // アクティブを変更
    if ($(e.target).closest(".handle").closest(".li_content").hasClass("selected")) {

    } else if ($(e.target).closest(".handle").closest(".li_content").length > 0) {

        $(".selected").removeClass("selected");
        $(".active").removeClass("active");
        $(e.target).closest(".li_content").addClass("selected active");

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

