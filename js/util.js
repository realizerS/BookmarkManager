/**
 * Created by realizerS on 16/03/15.
 */

// urlから表示すべきフォルダのIDを返す
function getPrintFolderId() {

    var url = location.href;
    var parameters = url.split("#");

    var base_url = parameters[0];

    var params = parameters[1].split("&");

    var paramsArray = [];

    for (var i = 0; i < params.length; i++) {
        var neet = params[i].split("=");
        paramsArray.push(neet[0]);
        paramsArray[neet[0]] = neet[1];
    }

    // 表示するフォルダのid
    return paramsArray["id"];

}

function clearContent() {
    $("#content_list").empty();
}

function clearFolderList() {
    $("#folder_list").empty();
}

function scrollToVisible(obj) {

    // 現在のスクロール量
    var scrollTop = window.scrollY;
    // 画面の高さ
    var displayHeight = $(window).height();

    // 対象オブジェクトの上の位置
    var objOffsetTop = obj.offset().top;

    // 本当はobj.outerHeight({margin: true)で取得したかったんだけども。
    // li要素だとダメなの?
    var objHeight = obj.height() + parseInt(obj.css("margin-top").slice(0,-2)) + parseInt(obj.css("margin-bottom").slice(0,-2));



    if (scrollTop + 100 > objOffsetTop) { // 上に見切れてる

        $("html, body").scrollTop(objOffsetTop - objHeight);

        // アニメーションだと変化が遅すぎてキーを押しっぱなしにしとくと結局見切れちゃう
        // $("html,body").animate({scrollTop: objOffsetTop - objHeight}, "fast");

    } else if (scrollTop + displayHeight - 50 < objOffsetTop + objHeight) { // 下に見切れてる

        $("html, body").scrollTop(scrollTop + objHeight);

        // $("html,body").animate({scrollTop: scrollTop + objHeight}, "fast");

    }

}

function scrollToVisibleSide(obj) {

    var scrollTop = $("#folder_list").scrollTop()

    var offset = obj.offset();
    var objTop = offset.top;
    var objHeight = obj.height();


    // 上に見切れている場合
    if (objTop -80 < 0) {
        $("#folder_list").scrollTop(scrollTop - objHeight);
    } else if (objTop > 380) {
        $("#folder_list").scrollTop(scrollTop + objHeight);
    }

}

function scrollToVisibleSideFav(obj) {

    var scrollTop = $("#fav_folder_list").scrollTop()

    var offset = obj.offset();
    var objTop = offset.top;
    var objHeight = obj.height();

    var displayHeight = $(window).height();

    console.log(displayHeight);

    // 上に見切れている場合
    if (objTop - 480 < 0) {
        $("#fav_folder_list").scrollTop(scrollTop - objHeight);
    } else if ( objTop > displayHeight - 50 ) {
        $("#fav_folder_list").scrollTop(scrollTop + objHeight);
    }

}



// ブックマークデータがディレクトリであるか否か
function isDirectory(bookmark) {


    if (bookmark.dateGroupModified !== undefined || bookmark.children !== undefined) {
        return true;
    } else {
        return false
    }


}

// ブックマークデータが子を持つか否か
function hasChildren(bookmark) {

    if (bookmark.children !== undefined) {
        return true;
    } else {
        return false;
    }

}

// 選択範囲を削除
function removeSelection() {
    
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
    
}

// 2つの長方形が重なっているかを判定する関数
// 左上の座標とサイズを2つ入力する
function isOverlap(left, top, width, height, itemLeft, itemTop, itemWidth, itemHeight) {

    if (
        (left - itemWidth < itemLeft && itemLeft < left + width) &&
        (top - itemHeight < itemTop && itemTop < top + height)
    ) {
        return true;
    } else {
        return false;
    }

}

// posObjへitemの画像部分(フォルダアイコンかページの画像)のポジション情報(top, left, width, height)を格納
function setItemPos (item, posObj) {

    if ($(item).hasClass("folder")) {

        itemOffset = $(item).find(".material-icons").offset();
        posObj.itemTop = itemOffset.top;
        posObj.itemLeft = itemOffset.left;
        posObj.itemWidth = $(item).find(".material-icons").width();
        posObj.itemHeight = $(item).find(".material-icons").height();

    } else {

        itemOffset = $(item).find(".page_image").offset();
        posObj.itemTop = itemOffset.top;
        posObj.itemLeft = itemOffset.left;
        posObj.itemWidth = $(item).find(".page_image").width();
        posObj.itemHeight = $(item).find(".page_image").height();

    }

}

// アイテムの選択を消す
function removeItemSelection () {

    $(".active").removeClass("active");
    $("#content_list .item").removeClass("selected");

}

// アイテムを選択する
function selectItem(target) {

    $("#content_list .active").removeClass("active");
    $(target).closest(".nub").addClass("selected active");

}

// アイテムの選択状態を入れ替える
function toggleItemSelection(target) {

    if ($(target).closest(".nub").hasClass("selected")) {

        $(target).closest(".nub").removeClass("selected");

        $("#content_list .active").removeClass("active");
        $("#content_list .selected").addClass("active")

    } else {
        $(target).closest(".nub").addClass("selected");

        $("#content_list .active").removeClass("active");
        $(target).closest(".nub").addClass("active");
    }


}

// 貼り付け可能か否かを
function changePasteState() {

    if (localStorage.cut.length > 0) {
        $(".menu_paste").removeClass("menu_invalid");
    } else {
        $(".menu_paste").addClass("menu_invalid");
    }

}


// フォルダをクローンして必要な項目に値をセット
// 引数に項目値がある
// 引数はbookmarkTreeNode
function cloneFolder(bookmarkFolder) {

    var clone = $("#folder_forClone").clone(true);
    clone.removeAttr("id");
    clone.attr("folder_id", bookmarkFolder.id);
    clone.attr("_id", bookmarkFolder.id);

    clone.attr("created_date", bookmarkFolder.dateAdded);
    clone.attr("modified_date", bookmarkFolder.dateGroupModified);

    $(clone).find(".title").html(bookmarkFolder.title);

    return clone;

}

// ブックマークをクローンし、必要なデータを設定した上で返す
function cloneItem(bookmark) {

    var clone = $("#item_forClone").clone(true);
    clone.removeAttr("id");
    $(clone).find("a").attr("url", bookmark.url)
    clone.attr("item_id", bookmark.id);
    clone.attr("_id", bookmark.id);

    // chrome:// とかも送信しちゃうけどまぁいいか。
    $(clone).find(".page_image").attr("src", heartRailsCaptureApiUrl + bookmark.url);

    if (bookmark.url.indexOf("chrome://") > -1) {
        $(clone).find(".fvc").attr("src", hatenaFaviconApiUrl + "http://none");
    } else {
        $(clone).find(".fvc").attr("src", hatenaFaviconApiUrl + bookmark.url);
    }

    clone.attr("created_date", bookmark.dateAdded);
    clone.attr("modified_date", bookmark.dateGroupModified);

    $(clone).find(".title").html(bookmark.title);

    return clone;
}

// サイドバーに表示するコンテナを作る
function cloneSidebarFolder(bookmarkFolder) {

    var clone = $("#cloneItems .sidebar_item_container").clone(true);
    $(clone).find(".title").html(bookmarkFolder.title);
    $(clone).attr("folder_id", bookmarkFolder.id);
    $(clone).attr("_id", bookmarkFolder.id);

    return clone;
}

// サイドバーに表示するお気に入り用のコンテナを作る
function cloneSidebarFavFolder(bookmarkFolder) {

    var clone = $("#cloneItems .sidebar_fav_item_container").clone(true);
    $(clone).find(".title").html(bookmarkFolder.title);
    $(clone).attr("folder_id", bookmarkFolder.id);
    $(clone).attr("_id", bookmarkFolder.id);

    return clone;

}

// パンくずリストはルートのアイテムを作る場合があるのでタイトルで分岐させる
function cloneBreadcrumbListItem(bookmarkFolder) {

    var listItem = $("#cloneItems .breadcrumb_list_item").clone(true);
    listItem.attr("folder_id", bookmarkFolder.id);
    listItem.attr("_id", bookmarkFolder.id);

    if (bookmarkFolder.parentId != null) {
        listItem.find("a").html(bookmarkFolder.title)
    } else {
        listItem.find("a").html("ROOT")
    }

    return listItem;

}

// フォルダを作成する
function createFolder() {

    var parentId = getPrintFolderId();

    chrome.bookmarks.create(
        {
            parentId: parentId,
            index: 0,
            title: "new folder",
        },
        function (result) {
            if (result != null) {

                // draggable と droppable を削除
                removeDragAndDropListener()

                // メインのコンテンツ部分へフォルダを追加
                var prependTarget = $("#content_list");

                var item = cloneFolder(result)

                item.prependTo(prependTarget);

                $(".selected").removeClass("selected active");

                $(item).find(".title").attr("contenteditable", "true");

                oldTitle = result.title;
                item.find(".title").focus();
                document.execCommand('selectAll', false, null)

                // サイドのフォルダリストへフォルダを追加

                // これから作るフォルダ要素を格納する場所を探す
                prependTarget = $(".sidebar_child_item_container").filter(function (idx) {
                    return $(this).attr("parent_id") == parentId
                });

                // 作ったフォルダ要素に値を設定
                var sidebarItem = cloneSidebarFolder(result);

                // 作ったフォルダにはまだ子要素は無いはずなので、アイコンは非表示に
                sidebarItem.find(".material-icons").css("display", "none");
                sidebarItem.prependTo(prependTarget);


                // 親フォルダに必要なら開閉アイコンを表示させる
                var parentFolder = prependTarget.prev();
                if (parentFolder.find(".material-icons-keyboard-arrow-right").css("display") == "none" &&
                    parentFolder.find(".material-icons-keyboard-arrow-down").css("display") == "none") {

                    parentFolder.find(".material-icons-keyboard-arrow-right").css("display", "inline-block");

                }

                // 作ったフォルダの子要素を格納するためのコンテナを追加する
                var childContainer = $("#cloneItems .sidebar_child_item_container").clone(true);
                childContainer.attr("parent_id", result.id)
                childContainer.insertAfter(sidebarItem);

                // リスナを再設定
                setDragAndDropListener();

            } else {

                console.log("失敗")

            }
        }
    )

}

// リネーム処理
// というかリネームを開始する処理
function rename() {


    if ($(".active").length == 1) {

        $(".active").find(".title").attr("contenteditable", "true");

        oldTitle = $(".active").find(".title").html();
        $(".active").find(".title").focus();
        document.execCommand('selectAll', false, null)
        $(".active").removeClass("selected active")

    }

}

// 右クリックの切り取り処理
function cut() {

    var cutIdList = [];
    $(".cut").removeClass("cut");
    $.each($(".folder.selected"), function (idx, selected) {
        cutIdList.push($(this).attr("folder_id"));
        $(selected).addClass("cut");
    });

    $.each($(".item.selected"), function (idx, selected) {
        cutIdList.push($(this).attr("item_id"));
        $(selected).addClass("cut");
    });

    localStorage.cut = JSON.stringify(cutIdList)
}

// 貼り付けを行う
function paste() {

    // フォルダへ貼り付けられない。
    var parentId;
    if ($(".active").length == 0) {
        parentId = getPrintFolderId();
    } else if ($(".active").hasClass("sidebar_item_container") ||
        $(".active").hasClass("sidebar_fav_item_container") ||
        $(".active").hasClass("folder")) {
        parentId = $(".active").attr("folder_id")
    } else {
        return;
    }

    var current_folder_id = getPrintFolderId();

    removeDragAndDropListener();

    // parentIdを含むフォルダのIDのリストを作成
    var parentIds = [];
    $.each($(".sidebar_item_container"), function (idx, i_container) {

        if ($(i_container).attr("_id") == parentId) {

            while ($(i_container).length > 0) {
                parentIds.push($(i_container).attr("_id"));
                i_container = $(i_container).closest(".sidebar_child_item_container").prev();
            }

        }

    });


    // folder_listを変更する用
    // 移動先フォルダ
    var child_item_container;
    $.each($(".sidebar_child_item_container"), function (idx, c_item_container) {

        if ($(c_item_container).attr("parent_id") == parentId) {
            child_item_container = c_item_container;
            return false;
        }
    });

    var cutIdList = JSON.parse(localStorage.cut);

    cutIdList.forEach(function (cutId, idx) {

        // 貼り付け(移動)可能か確認
        if (parentIds.indexOf(cutId) > -1) {
            return false;
        }

        // folder_listの 移動元フォルダを探す
        var item_container = null;
        $.each($(".sidebar_item_container"), function (idx, i_container) {
            if ($(i_container).attr("_id") == cutId) {
                item_container = i_container;
                return false;
            }
        });

        // 移動先のフォルダにフォルダを移動した場合は開閉アイコンを表示する
        if ($(child_item_container).find(".sidebar_item_container").length === 0) {
            $(child_item_container).prev().find(".material-icons-keyboard-arrow-right").css("display", "inline-block");
        }

        var current_child_item_container = $(item_container).closest(".sidebar_child_item_container");

        // folder_listを移動
        $(item_container).next().detach().prependTo(child_item_container)
        $(item_container).detach().prependTo(child_item_container)


        // 現在のフォルダにフォルダがなくなったら開閉アイコンを消す
        if ($(current_child_item_container).find(".sidebar_item_container").length === 0) {
            $(current_child_item_container).prev().find(".material-icons").css("display", "none")
        }


        // メインコンテンツ部分の変更
        // カットされたアイテムを消去
        $.each($(".item"), function (idx, item) {
            if ($(item).attr("_id") == cutId) {
                $(item).remove();
            }
        });

        // ペーストの対象フォルダがカレントフォルダなら表示
        if (parentId == current_folder_id) {
            chrome.bookmarks.getSubTree(
                cutId,
                function (result) {

                    result = result[0];

                    if (isDirectory(result)) {

                        var item = cloneFolder(result);

                        item.prependTo($("#content_list"));

                    } else {

                        var item = cloneItem(result);

                        item.prependTo($("#content_list"));

                    }
                }
            )
        }



        // 移動
        chrome.bookmarks.move(
            cutId,
            {parentId: parentId, index: 0},
            function (result) {
                console.log(result);
                // リスナーを再登録
                setDragAndDropListener();
            }
        )
    });

    localStorage.cut = "";



}

// 選択されたフォルダとアイテムを削除
function remove(){

    var removeObj;

    if ($(".active").hasClass("item")) {
        removeObj = $("#content_list .selected")
    } else if ($(".active").hasClass("sidebar_item_container")) {
        removeObj = $(".active");
    } else if ($(".active").hasClass("sidebar_fav_item_container")) {

        toggleFavoriteState($(".active").attr("_id"), null);
        return ;
    }

    // 空でないフォルダは削除しない
    $.each(removeObj, function (idx, selected) {

        var id = $(selected).attr("_id");

        // 削除の結果による分岐ができないので、先に削除可能か判定してやる
        // childrenがなければ削除可能
        if ($(selected).hasClass("folder") || $(selected).hasClass("sidebar_item_container")) {

            // 子供を持つか?
            chrome.bookmarks.getChildren(
                id,
                function (results) {
                    if (results.length === 0) {
                        // 持たないなら削除可能

                        // メインコンテンツペインから削除
                        $.each($(".item"), function (idx, item) {
                            if ($(item).attr("_id") == id) {
                                $(item).remove();
                            }
                        });

                        // 左上のフォルダリストから削除
                        $.each($(".sidebar_item_container"), function (idx,item_container) {

                            if ($(item_container).attr("_id") == id) {
                                $(item_container).next().remove(); // child_item_containerを削除

                                if ($(item_container).closest(".sidebar_child_item_container").find(".sidebar_item_container").length === 1) {
                                    $(item_container).closest(".sidebar_child_item_container").prev().find(".material-icons").css("display", "none");
                                }
                                // removeを先にやっちゃうと上で$(item_container)が使えないことに注意
                                $(item_container).remove();

                            }

                        });

                        //

                        // 左下のお気に入りフォルダリストから削除
                        $.each($(".sidebar_fav_item_container"), function (idx,item_container) {

                            if ($(item_container).attr("_id") == id) {
                                $(item_container).remove();
                            }

                        });

                        // favListを削除
                        var favList = JSON.parse(localStorage.favorite);
                        var len = favList.length;
                        for(var i = 0; i < len; i++) {

                            if (favList[i].id == id) {
                                favList.splice(i,1);
                                break;
                            }

                        }
                        localStorage.favorite = JSON.stringify(favList);


                        chrome.bookmarks.remove(
                            id,
                            function (result) {
                            }
                        )
                    }
                }
            );

        } else {
            $(selected).remove();
            chrome.bookmarks.remove(
                id,
                function (result) {
                }
            )
        }

    });

}

// list は {key: xxx, value: xxx} というオブジェクトの配列
// valueで並べ替え
// re-order association listの略
function reorderAssoc(list) {

    list.sort(function (a,b) {

        if (a.value < b.value) {
            return -1
        } else if (a.value > b.value) {
            return 1
        }
        return 0;

    });

}

// chrome.bookmarks.moveの処理の完了を待って再帰
function reorderAsync(list, parentId, idx) {

    if (list.length  == idx) {
        repaintFolderListAndContent(getPrintFolderId());
    } else {
        chrome.bookmarks.move(
            list[idx].key,
            {parentId: parentId, index: idx},
            function (result) {
                reorderAsync(list, parentId, idx+1)
            }
        )

    }

}

function reorderByTitle() {

    var parentId = getPrintFolderId();

    var folderIdTitleList = [];
    $.each($("#content_list .folder"), function (idx, folder) {
        folderIdTitleList.push({key: $(folder).attr("folder_id"), value: $(folder).find(".title").html().toLocaleLowerCase()});
    });
    reorderAssoc(folderIdTitleList);

    var itemIdTitleList = [];
    $.each($("#content_list .bookmark"), function (idx, item) {
        itemIdTitleList.push({key: $(item).attr("item_id"), value: $(item).find(".title").html().toLocaleLowerCase()});
    });
    reorderAssoc(itemIdTitleList);

    var list = folderIdTitleList;
    itemIdTitleList.forEach(function (listItem) {
        list.push(listItem)
    });

    reorderAsync(list, parentId, 0);


}

// urlで並び替え。ただしフォルダはタイトル順
function reorderByUrl() {

    var parentId = getPrintFolderId();

    // urlで並べ替えるときフォルダにはurlが無いので結局タイトル順
    var folderIdTitleList = [];
    $.each($("#content_list .folder"), function (idx, folder) {
        folderIdTitleList.push({key: $(folder).attr("folder_id"), value: $(folder).find(".title").html().toLocaleLowerCase()});
    });
    reorderAssoc(folderIdTitleList);


    var itemIdUrlList = [];
    $.each($("#content_list .bookmark"), function (idx, item) {
        itemIdUrlList.push({key: $(item).attr("item_id"), value: $(item).find("a").attr("url")});
    });
    reorderAssoc(itemIdUrlList);


    var list = folderIdTitleList;
    itemIdUrlList.forEach(function (listItem) {
        list.push(listItem)
    });

    reorderAsync(list, parentId, 0);


}

// 作成日時順で並び替え
function reorderByAddedDate() {

    var parentId = getPrintFolderId();

    var folderIdAddedDateList = [];
    $.each($("#content_list .folder"), function (idx, folder) {
        folderIdAddedDateList.push({key: $(folder).attr("folder_id"), value: parseInt($(folder).attr("created_date"))});
    });
    reorderAssoc(folderIdAddedDateList);


    var itemIdAddedDateList = [];
    $.each($("#content_list .bookmark"), function (idx, item) {
        itemIdAddedDateList.push({key: $(item).attr("item_id"), value: parseInt($(item).attr("created_date"))});
    });
    reorderAssoc(itemIdAddedDateList);


    var list = folderIdAddedDateList;
    itemIdAddedDateList.forEach(function (listItem) {
        list.push(listItem)
    });

    reorderAsync(list, parentId, 0);
}


// 右の情報表示部分の表示非表示の切替
function toggleInfoPaneOpenState() {

    if (parseInt($("#info_pane").css("right").slice(0,-2)) < 0) {

        if ($(".selected").length == 1) {

            var active = $(".selected")

            var bookmark_id = active.attr("_id");

            $("#info_pane").attr("bookmark_id", bookmark_id);

            // ブックマークid と ヘッダーに 画像を設定
            if (active.hasClass("folder")) {
                $("#info_pane #detail_header img").css("display", "none");
            } else if (active.hasClass("item")) {
                $("#info_pane #detail_header img").css("display", "inline-block");
                $("#info_pane #detail_header img").attr("src", $(".selected img").attr("src"));
            }


            // タイトル
            $("#detail_title_container textarea").val(active.find(".title").html());

            // タグ
            var tagListStr = localStorage.tag;
            if (tagListStr != null) {

                var tagList = JSON.parse(localStorage.tag);

                var tagArray = tagList[bookmark_id];
                if (tagArray != null) {
                    $("#detail_tag_container textarea").val(tagArray.join(" "));
                } else {
                    $("#detail_tag_container textarea").val("");
                }


            } else {
                $("#detail_tag_container textarea").val("");
            }


            // url
            $("#detail_link_container textarea").val(active.find("a").attr("url"));

            // 作成日時
            if (active.attr("created_date") != null) {

                $("#detail_created_date_container").css("display", "block")
                var created_date = new Date();
                created_date.setTime(parseInt(active.attr("created_date")))
                $("#detail_created_date").html("作成日時: " + created_date.toLocaleDateString());

            } else {
                $("#detail_created_date_container").css("display", "none")

            }

            // 最終更新日時
            if (active.attr("modified_date") != null) {

                $("#detail_modified_date_container").css("display", "block")

                var modified_date = new Date();
                modified_date.setTime(parseInt(active.attr("modified_date")))
                $("#detail_modified_date").html("最終更新日時: " + modified_date.toLocaleDateString());

            } else {
                $("#detail_modified_date_container").css("display", "none")

            }

            // リンクのurl
            $("#detail_open_url").attr("url", active.find("a").attr("url"));

            // 開く
            $("#info_pane").animate({right: "0"}, "fast");

        }
    } else {
        //閉じる
        $("#info_pane").animate({right: "-300px"}, "fast");
    }

}


// idとタイトルを入力に、お気に入りの状態を切替
function toggleFavoriteState(folderId, folderTitle) {

    removeDragAndDropListener()

    // chrome.storage が firefoxでどうも使えないのでlocalstorageでどうにかする。
    var favList = localStorage.favorite;

    if (favList == null) {
        favList = "[]";
    }

    favList = JSON.parse(favList);


    var len = favList.length;

    var i = 0;
    for (; i < len; i++) {

        if (favList[i].id == folderId) {
            favList.splice(i, 1);
            $("#fav_folder_list .sidebar_fav_item_container").eq(i).remove();
            break;
        }

    }
    if (i == len) {
        favList.push({id: folderId, title: folderTitle});
        favList = JSON.stringify(favList);

        var clone = $("#cloneItems .sidebar_fav_item_container").clone(true);
        $(clone).find(".title").html(folderTitle);
        $(clone).attr("folder_id", folderId);
        $(clone).attr("_id", folderId);
        clone.appendTo($("#fav_folder_list"));

    } else {
        favList = JSON.stringify(favList)
    }

    localStorage.favorite = favList;


    setDragAndDropListener();

}


// 正規表現を引数に現在表示中のフォルダを探索
// 正規表現のvalidateとかはしてない
function searchCurrentFolder(re) {

    // 空文字から作られる正規表現は true であることに注意
    // ただ検索文字列が空文字の場合re = ""なのでこの分岐が可能
    try {

        if (re) {

            $.each($("#content_list .folder"), function () {

                if (re.test($(this).find(".title").html())) {
                    $(this).css("display", "inline-block");
                } else {
                    $(this).css("display", "none");
                }

            });

            $.each($("#content_list .item"), function () {

                if (re.test($(this).find(".title").html())) {
                    $(this).css("display", "inline-block");
                } else {
                    $(this).css("display", "none");
                }

            });


        } else {

            $(".folder").css("display", "inline-block");
            $(".item").css("display", "inline-block");
        }

    } catch (e) {
        return false;
    }

}

// 正規表現を引数に現在表示中のフォルダを探索
// 正規表現のvalidateとかはしてない
function searchAll(re) {

    // 空文字から作られる正規表現は true であることに注意
    // ただ検索文字列が空文字の場合re = ""なのでこの分岐が可能

    var tagList = {};
    var tagListStr = localStorage.tag;
    if (tagListStr != null) {
        tagList = JSON.parse(tagListStr);
    }

    if (re) {

        removeDragAndDropListener()

        clearContent();

        chrome.bookmarks.getTree(
            function (results) {

                // firefox用に余計なブックマークデータを裂くj
                var results = results[0];
                for (var i = results.children.length - 1; i >= 0; i-- ) {

                    if (!results.children[i].title.length > 0) {

                        results.children.splice(i,1);

                    }
                }

                printBookmarksRecursivelyByAll(results, re, tagList)
                setDragAndDropListener();

            }
        );

    } else {
        searchExecuted = false;
        repaintContent(getPrintFolderId());
    }

}

// 正規表現を引数に現在表示中のフォルダを探索
// 正規表現のvalidateとかはしてない
function searchCurrentFolder(re) {

    // 空文字から作られる正規表現は true であることに注意
    // ただ検索文字列が空文字の場合re = ""なのでこの分岐が可能
    try {

        if (re) {

            $.each($("#content_list .folder"), function () {

                if (re.test($(this).find(".title").html())) {
                    $(this).css("display", "inline-block");
                } else {
                    $(this).css("display", "none");
                }

            });

            $.each($("#content_list .item"), function () {

                if (re.test($(this).find(".title").html())) {
                    $(this).css("display", "inline-block");
                } else {
                    $(this).css("display", "none");
                }

            });


        } else {

            $(".folder").css("display", "inline-block");
            $(".item").css("display", "inline-block");
        }

    } catch (e) {
        return false;
    }

}

// 現在のフォルダから再帰的に検索
function searchCurrentFolderRecursive(re) {

    // 空文字から作られる正規表現は true であることに注意
    // ただ検索文字列が空文字の場合re = ""なのでこの分岐が可能
    if (re) {

        removeDragAndDropListener()

        clearContent();

        chrome.bookmarks.getSubTree(
            getPrintFolderId(),
            function (results) {

                printBookmarksRecursively(results[0], re)
                setDragAndDropListener();

            }
        );


    } else {

        searchExecuted = false;
        repaintContent(getPrintFolderId());

    }

}
function searchCurrentFolderByTag(re) {

    // 空文字から作られる正規表現は true であることに注意
    // ただ検索文字列が空文字の場合re = ""なのでこの分岐が可能

    var tagList = {};
    var tagListStr = localStorage.tag;
    if (tagListStr != null) {
        tagList = JSON.parse(tagListStr);
    }

    try {

        if (re) {

            $.each($("#content_list .item"), function (idx, item) {

                var _id = $(item).attr("_id");
                var match = false;

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



                if (match) {
                    $(item).css("display", "inline-block");
                } else {
                    $(item).css("display", "none");
                }

            });

        } else {

            $(".item").css("display", "inline-block");

        }

    } catch (e) {
        return false;
    }

}

function searchCurrentFolderRecursiveByTag(re) {

    // 空文字から作られる正規表現は true であることに注意
    // ただ検索文字列が空文字の場合re = ""なのでこの分岐が可能

    var tagList = {};
    var tagListStr = localStorage.tag;
    if (tagListStr != null) {
        tagList = JSON.parse(tagListStr);
    }

    if (re) {

        removeDragAndDropListener()

        clearContent();

        chrome.bookmarks.getSubTree(
            getPrintFolderId(),
            function (results) {

                printBookmarksRecursivelyByTag(results[0], re, tagList)
                setDragAndDropListener();

            }
        );


    } else {

        searchExecuted = false;
        repaintContent(getPrintFolderId());

    }

}

function openFolder(folder_id) {

    history.pushState(null, null, "#id=" + folder_id);
    repaintContent(folder_id);

}


function openUrl(url) {

    if (url.length > 0) {
        // open メソッドで開こうとすると、chrome://のページが開けないことに注意する
        chrome.tabs.create({url: url, active: false});
    }

}

function toggleSidebarOpenState(sidebarItemContainer) {

    // 開閉の必要が無いアイテムに対しては何もしない
    if ($(sidebarItemContainer).next().find(".sidebar_item_container").length == 0) {
        return;
    }

    if ($(sidebarItemContainer).next().css("display") == "none") {
        // 閉じている場合は開く

        // アイコンの状態を変更
        // この方式よりアイコンオブジェクトのhtmlを書き換えたほうがいいかも。つまり、
        // $(sidebarItemContainer).find(".sidebar_icon_container").html("keyboard-arrow-down");
        // とかの方が楽かも
        // findはすべての子要素を選択するため、不必要な要素の矢印も変更している。
        $(sidebarItemContainer).find(".sidebar_icon_container .material-icons-keyboard-arrow-right").css("display", "none");
        $(sidebarItemContainer).find(".sidebar_icon_container .material-icons-keyboard-arrow-down").css("display", "inline-block");

        // 開く
        $(sidebarItemContainer).next().css("display", "block");

    } else {

        // アイコンの状態を変更
        $(sidebarItemContainer).find(".sidebar_icon_container .material-icons-keyboard-arrow-right").css("display", "inline-block");
        $(sidebarItemContainer).find(".sidebar_icon_container .material-icons-keyboard-arrow-down").css("display", "none");

        $(sidebarItemContainer).next().css("display", "none");

    }


}

function toggleSearchBarShowState() {

    if (parseInt($("#search_bar").css("top").slice(0, -2)) > 0) {
        // 上へ隠す
        $("#search_bar").animate({top: 0}, "fast");


        // 検索バーが隠れた時は要素をすべて表示する
        if (searchExecuted) {
            searchExecuted = false;
            repaintContent(getPrintFolderId());
        }

        //
        // $(".item").css("display", "inline-block");


    } else {
        // 下へ表す

        $("#search_bar").animate({top: 40}, "fast");
        $("#search_bar input").focus();
    }

}

function openSettingMenu() {

    $("#setting_menu_container").css("display", "block");

}

// jquery ui関連のリスナを削除する
function removeDragAndDropListener() {

    if ($("#content_list .item").data('ui-draggable')) {
        $("#content_list .item").draggable("destroy");
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
    if ($("#fav_folder_list").data('ui-sortable')) {
        $("#fav_folder_list").sortable("destroy");
    }

}

