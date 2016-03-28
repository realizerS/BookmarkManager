/**
 * Created by realizerS on 16/03/15.
 */
function draggableHelper() {

    var selected = $('.item.selected');
    if (selected.length === 0) {
        selected = $(this);
    } else if (selected.length === 1) {
        return selected.clone().css("opacity", ".5");
    }
    var container = $('<div/>').attr('id', 'draggingContainer');
    container.append(selected.clone().css("opacity", ".5"));
    return container;

}

function onDropFoledr(event, ui) {

    if (!$(event.target).closest(".item").hasClass("selected")) {
        ui.helper.remove();

        var parentId = $("#content_list .drop_target").attr("folder_id");
        $(".drop_target").removeClass("drop_target");

        // 左上のフォルダリストを更新するときの移動先のフォルダを探す
        var child_item_container;
        $.each($(".sidebar_child_item_container"), function (idx, c_item_container) {

            if ($(c_item_container).attr("parent_id") == parentId) {
                child_item_container = $(c_item_container);
            }

        });

        $.each($("#content_list .selected"), function (idx, selected) {

            var id = $(selected).attr("_id");

            chrome.bookmarks.move(
                id,
                {parentId: parentId, index: 0},
                function (result) {

                    // move成功
                    // カレントフォルダ内でD&Dした場合は常に成功するはず

                    // 左上のフォルダリストの構造を変更

                    // 動かした時、フォルダがなくなった場合の処理(開閉アイコンの表示非表示)に気をつける
                    // ただコンテンツペインのフォルダへのDrag&Dropだとそういう状況にはならない
                    // 移動先のフォルダには開閉アイコンを表示する必要が出てくるかも
                    $.each($(".sidebar_item_container"), function (idx, item_container) {

                        //  この条件に引っかかった時点でフォルダを移動してるってことが分かる
                        if ($(item_container).attr("_id") == id) {

                            // 移動先のフォルダにフォルダを移動した場合は開閉アイコンを表示する
                            if ($(child_item_container).find(".sidebar_item_container").length === 0) {
                                $(child_item_container).prev().find(".material-icons-keyboard-arrow-right").css("display", "inline-block");
                            }

                            $(item_container).next().detach().prependTo(child_item_container)
                            $(item_container).detach().prependTo(child_item_container)

                        }

                    });

                    $(selected).remove();

                }
            );

        });

    }
}

var timers = {};
function onOverSidebarItemContainer(event, ui) {

    $(this).addClass("drop_target")

    var folder_id = $(event.target).attr("folder_id")


    timers[folder_id] = setTimeout(function () {
        toggleSidebarOpenState(event.target)
    }, 500)

}

function onOutSidebarItemContainer(event, ui) {

    var folder_id = $(event.target).attr("folder_id")

    $(this).removeClass("drop_target");
    clearTimeout(timers[folder_id]);

}

function onDropSidebarItemContainer(event, ui) {

    console.log(isDropToFavList)

    // 長さが1以上なら帰る
    if (isDropToFavList.length > 0) {
        $("#folder_list .drop_target").removeClass("drop_target");
        return ;
    }

    var folder_id = $(event.target).attr("folder_id")

    clearTimeout(timers[folder_id]);

    var parentId = $(".drop_target").attr("folder_id");

    ui.helper.remove();

    // カレントフォルダへのD&Dは意味ないので帰る
    if ($(".drop_target").hasClass("current")) {
        $(".drop_target").removeClass("drop_target");
        return;
    }


    // parentId と folder_id 同じじゃね?
    // まぁいいか

    // move可能か判定のために、移動先のフォルダを含むフォルダリストを得る
    var drop_target = $(".drop_target");
    var parentIdList = [];
    parentIdList.push(parentId)
    while ($(drop_target).parent(".sidebar_child_item_container").prev().length > 0) {
        parentIdList.push($(drop_target).parent(".sidebar_child_item_container").prev().attr("_id"))
        drop_target = $(drop_target).parent(".sidebar_child_item_container").prev();
    }


    var child_item_container = $(".drop_target").next();

    $(".drop_target").removeClass("drop_target");


    var current_folder_id = getPrintFolderId();
    var current_child_item_container;
    $.each($(".sidebar_child_item_container"), function (idx, child_item_container) {
        if ($(child_item_container).attr("parent_id") == current_folder_id) {
            current_child_item_container = $(child_item_container);
        }
    });

    try {

        $.each($("#content_list .selected"), function (idx, selected) {

            var id = $(selected).attr("_id");

            // result で処理の成功不成功を判定できないので、move可能かどうかは先に判断してやる
            // move不可なら次のループへ
            if (parentIdList.indexOf(id) > -1) {
                return true;
            }


            chrome.bookmarks.move(
                id,
                {parentId: parentId, index: 0},
                function (result) {


                    // 移動先のフォルダには開閉アイコンを表示する必要が出てくるかも
                    $.each($(".sidebar_item_container"), function (idx, item_container) {

                        if ($(item_container).attr("_id") == id) {

                            // 移動先のフォルダにフォルダを移動した場合は開閉アイコンを表示する
                            if ($(child_item_container).find(".sidebar_item_container").length === 0) {
                                $(child_item_container).prev().find(".material-icons-keyboard-arrow-right").css("display", "inline-block");
                            }

                            $(item_container).next().detach().prependTo(child_item_container)
                            $(item_container).detach().prependTo(child_item_container)
                        }
                    });

                    // 現在のフォルダにフォルダがなくなったら開閉アイコンを消す
                    if ($(current_child_item_container).find(".sidebar_item_container").length === 0) {
                        $(current_child_item_container).prev().find(".material-icons").css("display", "none")
                    }


                    $(selected).remove();


                }
            );


        });
    } catch (e) {
        console.log("catch")
        console.log(e)
    }

}

function onDropSidebarFavItemContainer(event, ui) {

    isDropToFavList = []

    var parentId = $(event.target).attr("folder_id");

    // draggableヘルパーの削除
    ui.helper.remove();

    // 同じ場所にD&Dしても意味ないので帰る
    if ($(event.target).hasClass("current")) {
        $(".drop_target").removeClass("drop_target");
        return;
    }

    // drop_targetクラスの削除
    $(".drop_target").removeClass("drop_target");

    // move可能か判定のために、移動先のフォルダを含むフォルダリストを得る

    var parentIdList = [];
    $.each($(".sidebar_item_container"), function (idx, item_container) {
        if ($(item_container).attr("_id") == parentId) {

            parentIdList.push($(item_container).attr("_id"));
            while ($(item_container).parent(".sidebar_child_item_container").prev().length > 0) {
                parentIdList.push($(item_container).parent(".sidebar_child_item_container").prev().attr("_id"))
                item_container = $(item_container).parent(".sidebar_child_item_container").prev();
            }

        }
    });

    var current_parent_id = getPrintFolderId();

    // ルートフォルダは変更できないので
    if (current_parent_id == ROOTID) {
        return ;
    }

    var current_child_item_container;
    var child_item_container;
    $.each($(".sidebar_child_item_container"), function (idx, c_item_container) {

        if ($(c_item_container).attr("parent_id") == current_parent_id) {
            current_child_item_container = c_item_container
        } else if ($(c_item_container).attr("parent_id") == parentId) {
            child_item_container = c_item_container;
        }

    });




    $.each($("#content_list .selected"), function (idx, selected) {

        var id = $(selected).attr("_id");

        if (parentIdList.indexOf(id) > -1) {
            return true;
        }

        chrome.bookmarks.move(
            id,
            {parentId: parentId, index: 0},
            function (result) {

                // 移動先のフォルダには開閉アイコンを表示する必要が出てくるかも
                $.each($(".sidebar_item_container"), function (idx, item_container) {

                    if ($(item_container).attr("_id") == id) {

                        // 移動先のフォルダにフォルダを移動した場合は開閉アイコンを表示する
                        if ($(child_item_container).find(".sidebar_item_container").length === 0) {
                            $(child_item_container).prev().find(".material-icons-keyboard-arrow-right").css("display", "inline-block");
                        }

                        $(item_container).next().detach().prependTo(child_item_container)
                        $(item_container).detach().prependTo(child_item_container)
                    }
                });

                // 現在のフォルダにフォルダがなくなったら開閉アイコンを消す
                if ($(current_child_item_container).find(".sidebar_item_container").length === 0) {
                    $(current_child_item_container).prev().find(".material-icons").css("display", "none")
                }

                $(selected).remove();

            }

        );


    });

}



var isDragging = false;

// この配列に一つでも要素が入っていれば、fav_listにdropしたってこと
var isDropToFavList = [];
function setDragAndDropListener() {

    $("#content_list .item").draggable({
        revert: true,
        scroll: true,
        handle: ".handle",
        scrollSensitivity: 100,
        start: function (e, ui) {
            isDragging = true;
        },
        stop: function () {
            isDragging = false;
        }
        ,
        helper: draggableHelper
    });
    $("#content_list .folder .material-icons").droppable({
        tolerance: "pointer",
        over: function (event, ui) {
            $(this).closest(".folder").addClass("drop_target")
        },
        out: function (event, ui) {
            $(this).closest(".folder").removeClass("drop_target")
        },
        drop: onDropFoledr
    });
    $("#folder_list .sidebar_item_container").droppable({
        tolerance: "pointer",
        over: onOverSidebarItemContainer,
        out: onOutSidebarItemContainer,
        drop: onDropSidebarItemContainer
    });

    $("#fav_folder_list .sidebar_fav_item_container").droppable({
        tolerance: "pointer",
        over: function (event, ui) {
            $(this).addClass("drop_target")
            isDropToFavList.push("push");
            console.log(isDropToFavList);
        },
        out: function (event, ui) {
            $(this).removeClass("drop_target");
            isDropToFavList.pop();
            console.log(isDropToFavList);
        },
        drop: onDropSidebarFavItemContainer
    });


    $("#fav_folder_list").sortable({
        placeholder: "sortable_placeholder",
        start: function (e, ui) {
            isDragging = true;
            $("#fav_folder_list .sidebar_fav_item_container").droppable("disable");

        },
        stop: function (e, ui) {
            isDragging = false;
            $("#fav_folder_list .sidebar_fav_item_container").droppable("enable");

        },
        update: function (e, ui) {

            var favList = [];

            $.each($("#fav_folder_list .sidebar_fav_item_container"), function (idx, fav_item_container) {
                favList.push({
                    id: $(fav_item_container).attr("_id"),
                    title: $(fav_item_container).find(".title").html()
                });
            });

            localStorage.favorite = JSON.stringify(favList);

        }
    });

}


var searchExecuted = false;

function setListener() {


    // パンくずリストをクリックしたときはカレントフォルダでなければ移動
    $("#cloneItems .breadcrumb_list_item").click(function (e) {

        if (!$(this).hasClass("current")) {

            var folder_id = $(this).attr("folder_id")
            openFolder(folder_id);

        }

    });


    // 右上の検索マークをクリックした時
    $("header .material-icons-search").click(function (e) {

        toggleSearchBarShowState();

    });

    // 右上の設定マークをクリックした時
    $("header .material-icons-settings").click(function (e) {

        openSettingMenu();

    });

    // 左上のフォルダリストをクリックした時
    $("#cloneItems .sidebar_item_container").click(function (e) {

        $(".active").removeClass("active");
        $(e.target).closest(".nub").addClass("active")

        if ($(e.target).closest(".sidebar_icon_container").length > 0) {

            // 矢印のところがクリックされた場合は開閉を行う
            toggleSidebarOpenState(this);


        } else {

            // 名前の所がクリックされたらそのフォルダを開く
            if ($(e.target).closest(".sidebar_item_container").hasClass("current")) {
                return false;
            }
            var folder_id = $(this).attr("folder_id")


            openFolder(folder_id)


        }


    });
    // 名前の所をダブルクリックでもリストの開閉を指せる
    $(".sidebar_folder_name_container").dblclick(function (e) {

        toggleSidebarOpenState($(this).closest(".sidebar_item_container"))


    });

    // お気に入りフォルダをクリック
    $("#cloneItems .sidebar_fav_item_container").click(function (e) {

        $(".active").removeClass("active");
        $(e.target).closest(".nub").addClass("active")

        // 名前の所がクリックされたらそのフォルダを開く

        if ($(e.target).closest(".sidebar_fav_item_container").hasClass("current")) {
            return false;
        }

        var folder_id = $(this).attr("folder_id")

        openFolder(folder_id);

    });


    // フォルダアイコンダブルクリックでそのフォルダへ移動
    $("#folder_forClone .material-icons").dblclick(function (e) {

        var printFolderId = $(this).closest(".folder").attr("folder_id")

        openFolder(printFolderId)

        return false;

    });


    $("#item_forClone img").dblclick(function (e) {

        openUrl($(this).closest(".item").find("a").attr("url"));

    });

    $("#info_pane #detail_open_url").click(function (e) {

        openUrl($(this).attr("url"))

    });

    $("#info_pane #detail_close").click(function (e) {
        $("#info_pane").animate({right: "-300px"}, "fast");
    });


    // 検索時の処理
    $("#search form").submit(function (e) {

        var value = $(this).find("input").val();

        var re = "";
        if (value) {
            re = new RegExp(value, "i");
        }
        searchExecuted = true;

        switch($("#search_scope_selector").val()) {

            case "all":
                searchAll(re);
                break;
            case "current":
                searchCurrentFolder(re);
                break;
            case "recursive":
                searchCurrentFolderRecursive(re);
                break;
            case "tag":
                searchCurrentFolderByTag(re);
                break;
            case "tag_recursive":
                searchCurrentFolderRecursiveByTag(re);
                break;
            default:
                break;

        }
        return false;
    });

    $("#search_scope_selector").change(function (e) {

        switch ($("#search_scope_selector").val()) {

            case "all":
            case "current":
            case "recursive":
            case "tag":
            case "tag_recursive":
            default:
                if (searchExecuted) {
                    searchExecuted = false;
                    repaintContent(getPrintFolderId());
                }
                break;

        }

        return false;

    });



    // マウスをドラッグして範囲を作る
    var isMouseDown = false;
    var isCtrl = false;
    var isRightClick = false;
    var paintFlame = false;
    var startX;
    var startY;
    var endX;
    var endY;

    // アイテムをクリックで選択できるようにする
    // selectクラスは選択されたことを表すため
    // activeクラスは最後に選択された場所を表すため
    $("body").mousedown(function (e) {

        // マウスが押下された座標を取得する。
        if (e.button == 0) { // 左クリックの時

            isMouseDown = true;
            startX = e.clientX + window.scrollX;
            startY = e.clientY + window.scrollY;

        }

        // 右クリックは無視
        // contextmenuイベントの方で処理
        if (e.button === 2) {
            isRightClick = true;
            return true;
        }
        // メニューの項目をクリックした場合はメニュー項目に対するリスナで処理する。ここでは何もしない
        if ($(e.target).closest("#menu").length === 1) {
            return true;
        }

        // メニューでないとこをクリックしたらメニューを閉じる
        if ($(e.target).closest("#menu").length === 0) {
            $("#menu").css("display", "none");
        }

        // 設定メニューでないとこをクリックしたらメニューを閉じる
        if ($(e.target).closest("#setting_menu_container").length === 0) {
            $("#setting_menu_container").css("display", "none");
        }

        // アイコンでも画像でもタイトルでも無いところをクリックした
        if (!$(e.target).hasClass("handle")) {
            removeItemSelection();
            return true;

        } else {

            // コントロールキーが押されておらずに
            // 選択された要素をクリック(つまりドラッグを開始しようとしている)
            if (!e.ctrlKey && $(e.target).closest(".item").hasClass("selected")) {
                return true;
            }

            // コントロールキーが押されていれば複数選択
            // 押されていなければ
            if (!e.ctrlKey) {
                removeItemSelection();
                selectItem(e.target);
            } else {
                isCtrl = true;
                toggleItemSelection(e.target)
            }

        }

    });


    $("body").mousemove(function (e) {

        if (isMouseDown && !isDragging) {

            paintFlame = true;
            $("#drag_flame").css("display", "block");

            endX = e.clientX + window.scrollX;
            endY = e.clientY + window.scrollY;

            $("#drag_flame").css("left", Math.min(startX, endX) + "px");
            $("#drag_flame").css("top", Math.min(startY, endY) + "px");
            $("#drag_flame").css("width", Math.abs(startX - endX) + "px");
            $("#drag_flame").css("height", Math.abs(startY - endY) + "px");

        } else if (isMouseDown) {

            $("#drag_flame").css("display", "none");

        }

        // 何も押されていない
        // フレームを作った後ウィンドウの外に出てマウスのドラッグをやめたとき、フレームが残っちゃうので
        // てかisMouseDownって自作しなくてもe.buttonsで判定すればいいのか?
        if (e.buttons == 0) {

            $("#drag_flame").css("display", "none");

        }


    });

    $("body").mouseup(function (e) {

        if (paintFlame) {
            $("#drag_flame").css("display", "none");

            // フレームの左上座標とサイズ
            var left = Math.min(startX, endX);
            var top = Math.min(startY, endY);
            var width = Math.abs(startX - endX);
            var height = Math.abs(startY - endY);

            var selectedItems = $(".item:visible").filter(function (idx) {


                var itemImagePos = {};

                // アイテムの画像部分の左上座標とサイズを設定する
                setItemPos(this, itemImagePos);

                // アイテムのタイトル部分の左上座標とサイズを設定する
                var itemOffset2 = $(this).find(".title").offset();
                var itemTop2 = itemOffset2.top;
                var itemLeft2 = itemOffset2.left;
                var itemWidth2 = $(this).find(".title").width();
                var itemHeight2 = $(this).find(".title").height();


                return isOverlap(left, top, width, height, itemImagePos.itemLeft, itemImagePos.itemTop, itemImagePos.itemWidth, itemImagePos.itemHeight) ||
                    isOverlap(left, top, width, height, itemLeft2, itemTop2, itemWidth2, itemHeight2)

            });

            selectedItems.addClass("selected");
            selectedItems.last().addClass("active");

        } else if (!isCtrl && !isRightClick) {
            removeItemSelection();
            $(e.target).closest(".handle").closest(".item").addClass("selected active");
        }
        isMouseDown = false;
        isCtrl = false;
        isRightClick = false;
        paintFlame = false;

    });



    // 右クリック時の処理
    // コンテクストメニューを表示する
    $("body").contextmenu(function (e) {

        printContextMenu(e);
        return false;

    });

    // コンテクストメニューをクリックした時のイベント
    $(".menuItem").click(function (e) {


        $("#menu").css("display", "none");

        // 無効になったアイテムをクリックしても何も起こさない
        if ($(e.target).hasClass("menu_invalid")) {
            return false;
        }


        if ($(this).hasClass("menu_create")) {

            createFolder();
            return false;

        } else if ($(this).hasClass("menu_rename")) {

            // リネーム
            rename();
            return false;


        } else if ($(this).hasClass("menu_cut")) {

            // 切り取り
            cut();
            return false;

        } else if ($(this).hasClass("menu_paste")) {

            // 貼り付け
            paste();
            return false;

        } else if ($(this).hasClass("menu_remove")) {

            // 削除
            remove();
            return false;

        } else if ($(this).hasClass("menu_toggle_fav")) {

            if ($(".folder.selected").length == 1 || $("#folder_list .active").length == 1 || $("#fav_folder_list .active").length == 1) {

                var folderId = $(".active").attr("folder_id");
                var folderTitle = $(".active").find(".title").html();

                toggleFavoriteState(folderId, folderTitle);

            }

        } else if ($(this).hasClass("menu_reorder_title")) {

            // 並べ替え - タイトル昇順
            reorderByTitle();
            return false;


        } else if ($(this).hasClass("menu_reorder_url")) {

            // 並べ替え - URL昇順
            reorderByUrl();
            return false;

        } else if ($(this).hasClass("menu_reorder_added_date")) {

            // 並べ替え - 登録日時昇順
            reorderByAddedDate();
            return false;

        } else if ($(this).hasClass("menu_close")) {

            // 上で右クリックのメニューを閉じてるので良い。
            $("nav .active").removeClass("active")
            console.log("close");

        }


    });

    // コンテクストメニューをクリックした時のイベント
    $(".settingMenuItem").click(function (e) {

        $("#setting_menu_container").css("display", "none");

        if ($(this).hasClass("setting_menu_auto_sort")) {

            console.log("auto sort")
            return false;

        } else if ($(this).hasClass("setting_menu_settings")) {

            // リネーム
            console.log("setting")
            return false;


        }
    });


    // キーボードによる操作
    // keydownXXXみたいな関数名なのは、実際の処理とイベントの処理を分離するため
    $("body").keydown(function (e) {

        // フォーカスがどっかにあたっている時の処理
        // このときはtrueを返すことで通常の処理も行う
        if ($("input:focus").length > 0) {
            return true;
        }

        if ($("textarea:focus").length > 0) {
            return true;
        }

        if ($(".title:focus").length > 0) {

            return keydownAtEditingTitle(e);

        }

        if (e.ctrlKey) {

            switch (e.keyCode) {

                case KEYCODEA:
                    $("#content_list .item:visible").addClass("selected")
                    break;
                case KEYCODES:
                case KEYCODEF:
                case KEYCODEM:
                    console.log("test")
                    toggleSearchBarShowState();
                    break;

            }

        } else if (e.shiftKey) {

            switch (e.keyCode) {

                case KEYCODEENTER:
                    keydownShiftEnter(); // お気に入り状態の切替
                    return false;
                case KEYCODELEFT:
                    keydownShiftLeft();
                    return false; // 自動スクロール抑制
                case KEYCODEUP:
                    keydownShiftUp();
                    return false; // 自動スクロール抑制
                case KEYCODERIGHT:
                    keydownShiftRight();
                    return false; // 自動スクロール抑制
                case KEYCODEDOWN:
                    keydownShiftDown();
                    return false; // 自動スクロール抑制
                default:
                    break;

            }

        } else {

            switch (e.keyCode) {

                case KEYCODEENTER:
                    keydownEnter(); // フォルダならそのフォルダへ移動 urlなら開く
                    return false;
                case KEYCODESPACE:
                    keydownSpace(); // info paneの開閉
                    return false;
                case KEYCODELEFT:
                    keydownLeft();
                    return false; // 自動スクロール抑制
                case KEYCODEUP:
                    keydownUp();
                    return false; // 自動スクロール抑制
                case KEYCODERIGHT:
                    keydownRight();
                    return false; // 自動スクロール抑制
                case KEYCODEDOWN:
                    keydownDown();
                    return false; // 自動スクロール抑制
                case KEYCODEDELETE:
                    keydownDelete(); // フォルダとかの削除
                    return false;
                case KEYCODEF2:
                    keydownF2(); // リネーム
                    return false;
                default:
                    break;

            }
        }


    });


    // 並べ替えのサブメニューを出すためのイベント
    var openReorderSubMenuTimer;
    $(".menu_reorder").hover(
        function (e) {
            if ($(this).hasClass("menu_invalid")){
                return false;
            }
            openReorderSubMenuTimer = setTimeout(function () {

                $(".reorder_submenu_container").css({
                    top: $(".menu_reorder").position().top,
                    display: "block"
                })

            }, 200)
        },
        function (e) {

            $(".reorder_submenu_container").css({display: "none"})
            clearTimeout(openReorderSubMenuTimer)

        }
    );


    var oldTitle = "";
    // info_paneからタイトルを変更する
    $("#detail_title_container textarea").focus(function (e) {

        oldTitle = $("#detail_title_container textarea").val();

    });

    // info_paneからタイトルを変更する
    $("#detail_title_container textarea").blur(function (e) {


        var bookmark_id = $("#info_pane").attr("bookmark_id");

        var newTitle = $("#detail_title_container textarea").val();

        if (oldTitle == newTitle) {
            return false;
        }

        chrome.bookmarks.update(
            bookmark_id,
            {title: newTitle},
            function (result) {
                console.log(result);
                if (result != null) {

                    // localStorageのfavoriteの値を必要に応じて更新
                    var favList = JSON.parse(localStorage.favorite);

                    if (favList == null) {
                        favList = [];
                    }

                    var len = favList.length;

                    for(var i = 0; i < len; i++) {
                        if (favList[i].id == bookmark_id) {
                            favList[i] = {id: bookmark_id, title: newTitle};
                            localStorage.favorite = JSON.stringify(favList);
                            break;
                        }
                    }

                    // 表示中の名前を変更
                    $(".nub").filter(function (idx) {
                        return $(this).attr("_id") == bookmark_id
                    }).find(".title").html(newTitle);


                } else {
                    $("#detail_title_container textarea").val(oldTitle);
                }
            }
        );


    });

    var oldTagStr = "";
    // info_paneからタイトルを変更する
    $("#detail_tag_container textarea").focus(function (e) {

        oldTagStr = $("#detail_tag_container textarea").val();

    });

    // info_paneからタイトルを変更する
    $("#detail_tag_container textarea").blur(function (e) {


        var bookmark_id = $("#info_pane").attr("bookmark_id");

        var newTagStr = $("#detail_tag_container textarea").val();

        if (oldTagStr == newTagStr) {
            return false;
        }


        var tagList = {};

        var tagListStr = localStorage.tag;
        if (tagListStr != null) {
            tagList = JSON.parse(tagListStr);
        }


        // タグが空の場合は削除
        if (newTagStr == "") {
            delete tagList[bookmark_id];

            // ローカルストレージのタグリストを更新
            localStorage.tag = JSON.stringify(tagList);

            return false;
        }


        // タグの文字列を配列に変更後、重複を削除
        var newTagArray = newTagStr.split(" ");
        var newTagArraySet = newTagArray.filter(function (tag ,idx, self) {
            return self.indexOf(tag) === idx;
        });

        // タグリストを更新
        tagList[bookmark_id] = newTagArraySet;

        // ローカルストレージのタグリストを更新
        localStorage.tag = JSON.stringify(tagList);



    });
    

}



