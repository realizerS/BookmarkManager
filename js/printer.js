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

    var listItem = $("#cloneItems .breadcrumb_list_item").clone(true);
    listItem.attr("folder_id", dir.id);
    listItem.attr("_id", dir.id);

    if (dir.parentId != null) {

        listItem.find("a").html(dir.title)
        $("#breadcrumb_list_container .breadcrumb_list").prepend(listItem);

        chrome.bookmarks.get(
            dir.parentId,
            function (bookmarks) {

                printBreadcrumbList(bookmarks[0]);

            }
        );


    } else {

        // ルート要素にたどり着いた時。再帰は終了する。

        listItem.find("a").html("ROOT")
        $("#breadcrumb_list_container .breadcrumb_list").prepend(listItem);

        $("#breadcrumb_list_container .current").removeClass("current");
        $("#breadcrumb_list_container .breadcrumb_list_item").last().addClass("current");

    }

}



// メインペインの上部にディレクトリの詳細を表示
function printDirInfo(dir) {


    $("#folder_title_container h2").html(dir.title);

    if (dir.dateAdded != null) {
        var created_date = new Date();
        created_date.setTime(parseInt(dir.dateAdded))
        $("#created_date_container span").html("作成日時: " + created_date.toLocaleDateString() );

    }
    if (dir.dateGroupModified != null) {
        var modified_date = new Date();
        modified_date.setTime(parseInt(dir.dateGroupModified))
        $("#modified_date_container span").html("最終更新日時: " + modified_date.toLocaleDateString());
    }

}

// bookmarks is an array of bookmarks, may be null.
// appendTarget is an jQuery obj for append cloned object.
function printBookmarksInSidebar(bookmark, appendTarget) {


    if (bookmark.children != null) {

        bookmark.children.forEach(function (bookmark) {


            if (isDirectory(bookmark)) {

                var clone = $("#cloneItems .sidebar_item_container").clone(true);
                $(clone).find(".title").html(bookmark.title);
                $(clone).attr("folder_id", bookmark.id);
                $(clone).attr("_id", bookmark.id);
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
    
    favList = localStorage.favorite;


    if (favList == null) {
        return ;
    }

    favList = JSON.parse(favList);

    favList.forEach(function (fav) {

        var clone = $("#cloneItems .sidebar_fav_item_container").clone(true);
        $(clone).find(".title").html(fav.title);
        $(clone).attr("folder_id", fav.id);
        $(clone).attr("_id", fav.id);
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

                var item = $("#folder_forClone").clone(true);
                item.removeAttr("id");
                item.attr("folder_id", bookmark.id);
                item.attr("_id", bookmark.id);

                item.attr("created_date", bookmark.dateAdded);
                item.attr("modified_date", bookmark.dateGroupModified);

                $(item).find(".title").html(bookmark.title);

                item.appendTo(appendTarget);

            } else {

                var item = $("#item_forClone").clone(true);
                item.removeAttr("id");
                $(item).find("a").attr("url", bookmark.url)
                item.attr("item_id", bookmark.id);
                item.attr("_id", bookmark.id);

                // chrome:// とかも送信しちゃうけどまぁいいか。
                $(item).find("img").attr("src", heartRailsCaptureApiUrl + bookmark.url);

                item.attr("created_date", bookmark.dateAdded);
                item.attr("modified_date", bookmark.dateGroupModified);

                $(item).find(".title").html(bookmark.title);

                $(item).find(".title").html(bookmark.title);

                item.appendTo(appendTarget);

            }

        });


    }

}

function printBookmarksRecursively(bookmark, re) {

    if (isDirectory(bookmark)) {

        // 正規表現に合致したら表示
        if (re.test(bookmark.title)) {

            var item = $("#folder_forClone").clone(true);
            item.removeAttr("id");
            item.attr("folder_id", bookmark.id);
            item.attr("_id", bookmark.id);

            item.attr("created_date", bookmark.dateAdded);
            item.attr("modified_date", bookmark.dateGroupModified);

            $(item).find(".title").html(bookmark.title);

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
            var item = $("#item_forClone").clone(true);
            item.removeAttr("id");
            $(item).find("a").attr("url", bookmark.url)
            item.attr("item_id", bookmark.id);
            item.attr("_id", bookmark.id);

            // chrome:// とかも送信しちゃうけどまぁいいか。
            $(item).find("img").attr("src", heartRailsCaptureApiUrl + bookmark.url);

            item.attr("created_date", bookmark.dateAdded);
            item.attr("modified_date", bookmark.dateGroupModified);

            $(item).find(".title").html(bookmark.title);

            $(item).find(".title").html(bookmark.title);

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

