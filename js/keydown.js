// e: keydown event
function keydownAtEditingTitle (e) {

    // 編集中にエンターキー(確定した)
    if (e.keyCode == KEYCODEENTER) {

        var bookmark_id = $(".title:focus").closest(".nub").attr("_id");

        var newTitle = $(".title:focus").html();

        // 名前に変更がなければ終了
        if (oldTitle == newTitle) {
            $(".title:focus").closest(".nub").addClass("selected active");
            $("span.editable").blur();
            removeSelection();
            $("span.editable").attr("contenteditable", "false");
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

                    // フォーカス関連
                    $(".title:focus").closest(".nub").addClass("selected active");
                    $("span.editable").blur();
                    removeSelection();

                    // エディタブル属性を外す
                    $("span.editable").attr("contenteditable", "false");


                    // 表示中の名前を変更
                    $(".nub").filter(function (idx) {
                        return $(this).attr("_id") == bookmark_id
                    }).find(".title").html(newTitle);

                } else {
                    $(".title:focus").html(oldTitle);
                    $(".title:focus").closest(".nub").addClass("selected active");
                    $("span.editable").blur();
                    removeSelection();
                    $("span.editable").attr("contenteditable", "false");
                }
            }
        );

        return false;

    } else if (e.keyCode == KEYCODEESCAPE) {
        // 編集中にエスケープキーでリネームを中止
        $(".title:focus").html(oldTitle);
        $(".title:focus").closest(".item").addClass("selected active");
        $("span.editable").blur();
        removeSelection();
        $("span.editable").attr("contenteditable", "false");

        return false;
    }

    return true;

}

// delete key 押下時の処理
function keydownDelete() {

    remove()

}

function keydownSpace() {

    toggleInfoPaneOpenState();

}

function keydownEnter() {


    var active = $(".active");

    if (active.hasClass("sidebar_item_container")) {

        if (!active.hasClass("current")) {
            openFolder(active.attr("_id"));
        }

        return false;
    }

    if (active.hasClass("sidebar_fav_item_container")) {

        if (!active.hasClass("current")) {
            openFolder(active.attr("_id"));
        }
        return false;
    }

    if ($(".folder.selected").length == 1) {

        openFolder($(".folder.selected").attr("folder_id"))
        return false;


    }

    // アイテムのみが複数選択されていた場合はすべてタブで開く
    if ($(".folder.selected").length == 0 && $(".item.selected").length > 0) {

        $.each($(".item.selected"), function (idx, obj) {
            chrome.tabs.create({url: $(obj).find("a").attr("url"), active: false});
        });

        return false;

    }


}

function keydownShiftEnter() {

    if ($(".folder.selected").length == 1) {

        var folderId = $(".folder.selected").attr("folder_id");
        var folderTitle = $(".folder.selected").find(".title").html();

        toggleFavoriteState(folderId, folderTitle);

    }
}
function keydownShiftLeft() {

    var active = $(".active");

    if (active.hasClass("sidebar_item_container") || active.hasClass("sidebar_fav_item_container")) {
        return false;
    }

    if (active.prevAll(":visible").first().length !== 0) {
        if (active.prevAll(":visible").first().hasClass("selected")) {

            active.removeClass("selected active");
            active.prevAll(":visible").first().addClass("active");

        } else {
            active.prevAll(":visible").first().addClass("selected active");
            active.removeClass("active");
        }

        // 新しくアクティブになった要素が画面に入るようにする
        scrollToVisible($(".active"));

    } else {
        active.addClass("selected active");
    }

}

// ←
function keydownLeft() {

    $(".selected").removeClass("selected");
    var active = $(".active");

    if (active.hasClass("item")) {

        if (!active.length > 0) {
            $(".item:visible").first().addClass("selected active");
            return false;
        }
        if (active.prevAll(":visible").first().length !== 0) {
            active.prevAll(":visible").first().addClass("selected active");
            active.removeClass("active");

            // 新しくアクティブになった要素が画面に入るようにする
            scrollToVisible($(".active"));

        } else {
            active.addClass("selected active");
        }

    } else if (active.hasClass("sidebar_item_container")) {

        // フォルダが開いているなら閉じる
        if (active.find(".material-icons-keyboard-arrow-down").css("display") == "inline-block") {
            // アイコンの状態を変更
            active.find(".material-icons-keyboard-arrow-down").css("display", "none");
            active.find(".material-icons-keyboard-arrow-right").css("display", "inline-block");
            active.next().css("display", "none");

            scrollToVisibleSide(active);

        }


    } else if (active.hasClass("sidebar_fav_item_container")) {

    } else {
        active.removeClass("active");
        $(".item").first().addClass("selected active");
    }

}

function keydownShiftRight() {

    var active = $(".active");


    if (active.hasClass("sidebar_item_container") || active.hasClass("sidebar_fav_item_container")) {
        return false;
    }


    if (active.nextAll(":visible").first().length !== 0) {

        if (active.nextAll(":visible").first().hasClass("selected")) {

            active.removeClass("selected active");
            active.nextAll(":visible").first().addClass("active");

        } else {
            active.nextAll(":visible").first().addClass("selected active");
            active.removeClass("active");
        }

        // 新しくアクティブになった要素が画面に入るようにする
        scrollToVisible($(".active"));

    } else {
        active.addClass("selected active");
    }

}

function keydownRight() {

    $(".selected").removeClass("selected");
    var active = $(".active");

    if (active.hasClass("item")) {

        if (!active.length > 0) {
            $(".item:visible").first().addClass("selected active");
            return false;
        }
        if (active.nextAll(":visible").first().length !== 0) {
            active.nextAll(":visible").first().addClass("selected active");
            active.removeClass("active");

            // 新しくアクティブになった要素が画面に入るようにする
            scrollToVisible($(".active"));

        } else {
            active.addClass("selected active");
        }

    } else if (active.hasClass("sidebar_item_container")) {

        // フォルダが閉じているなら開く
        if (active.find(".material-icons-keyboard-arrow-right").css("display") == "inline-block") {
            // アイコンの状態を変更
            active.find(".material-icons-keyboard-arrow-down").css("display", "inline-block");
            active.find(".material-icons-keyboard-arrow-right").css("display", "none");

            active.next().css("display", "block");

            scrollToVisibleSide(active);

        }

    } else if (active.hasClass("sidebar_fav_item_container")) {


    } else {
        active.removeClass("active");
        $(".item").first().addClass("selected active");
    }

}

function keydownShiftUp() {

    var active = $(".active");

    if (active.hasClass("sidebar_item_container") || active.hasClass("sidebar_fav_item_container")) {
        return false;
    }

    var up = active;
    var count = Math.floor($("#content_list").width() / $("#folder_forClone").width());
    for (var i = 0; i < count; i++) {
        up = up.prevAll(":visible").first();
    }
    if (up.length !== 0) {

        var up = active;
        for (var i = 0; i < count; i++) {

            if (up.prevAll(":visible").first().hasClass("selected")) {
                up.removeClass("selected");
            } else {
                up.prevAll(":visible").first().addClass("selected");
            }
            up = up.prevAll(":visible").first();
        }

        up.addClass("selected active");
        active.removeClass("active")

        // 新しくアクティブになった要素が画面に入るようにする
        scrollToVisible($(".active"));


    } else {
        active.addClass("selected active");
    }

}

function keydownUp() {

    $(".selected").removeClass("selected");
    var active = $(".active");

    if (active.hasClass("item")) {


        var up = active;
        var count = Math.floor($("#content_list").width() / $("#folder_forClone").width());
        for (var i = 0; i < count; i++) {
            up = up.prevAll(":visible").first();
        }
        if (up.length !== 0) {
            up.addClass("selected active");
            active.removeClass("active")

            // 新しくアクティブになった要素が画面に入るようにする
            scrollToVisible($(".active"));

        } else {
            active.addClass("selected active");
        }

    } else if (active.hasClass("sidebar_item_container")) {

        // フォルダを開いているなら
        if (active.prev().prev().find(".material-icons-keyboard-arrow-down").css("display") == "inline-block") {

            active.prev().find(".sidebar_item_container:visible").last().addClass("active");
            active.removeClass("active");
            scrollToVisibleSide(active);
            // active.prev().children().last().prev().addClass("active");
            // active.removeClass("active");

        } else if (active.prev().prev()[0] != null) {

            active.prev().prev().addClass("active");
            active.removeClass("active");
            scrollToVisibleSide(active);

        } else if (active.closest(".sidebar_child_item_container").prev()[0] != null){

            active.closest(".sidebar_child_item_container").prev().addClass("active");
            active.removeClass("active");
            scrollToVisibleSide(active);

        }

    } else if (active.hasClass("sidebar_fav_item_container")) {

        if (active.prev()[0] != null) {
            active.prev().addClass("active");
            active.removeClass("active");
            scrollToVisibleSideFav(active);
        }

    } else {
        active.removeClass("active");
        $(".item").first().addClass("selected active");
    }




}

function keydownShiftDown() {

    var active = $(".active");


    if (active.hasClass("sidebar_item_container") || active.hasClass("sidebar_fav_item_container")) {
        return false;
    }


    var down = active;
    var count = Math.floor($("#content_list").width() / $("#folder_forClone").width());
    for (var i = 0; i < count; i++) {
        down = down.nextAll(":visible").first();
    }
    if (down.length !== 0) {

        var down = active;
        for (var i = 0; i < count; i++) {

            if (down.nextAll(":visible").first().hasClass("selected")) {
                down.removeClass("selected");
            } else {
                down.nextAll(":visible").first().addClass("selected");
            }
            down = down.nextAll(":visible").first();

        }

        down.addClass("active");
        active.removeClass("active")

        // 新しくアクティブになった要素が画面に入るようにする
        scrollToVisible($(".active"));


    } else {
        active.addClass("selected active");
    }
}

function keydownDown() {

    $(".selected").removeClass("selected");
    var active = $(".active");

    if (active.hasClass("item")) {
        var down = active;
        var count = Math.floor($("#content_list").width() / $("#folder_forClone").width());
        for (var i = 0; i < count; i++) {
            down = down.nextAll(":visible").first();
        }
        if (down.length !== 0) {
            down.addClass("selected active");
            active.removeClass("active")

            // 新しくアクティブになった要素が画面に入るようにする
            scrollToVisible($(".active"));

        } else {
            active.addClass("selected active");
        }
    } else if (active.hasClass("sidebar_item_container")) {


        // フォルダを開いているなら
        if (active.find(".material-icons-keyboard-arrow-down").css("display") == "inline-block") {

            active.next().children().first().addClass("active");
            active.removeClass("active");
            scrollToVisibleSide(active);

        } else if (active.next().next()[0] != null) {

            active.next().next().addClass("active");
            active.removeClass("active");
            scrollToVisibleSide(active);

        } else {

            var child_item_container = active.closest(".sidebar_child_item_container");

            while (child_item_container[0] != null) {

                if (child_item_container.next()[0] != null){

                    child_item_container.next().addClass("active");
                    active.removeClass("active");
                    scrollToVisibleSide(active);
                    break;
                }

                child_item_container = child_item_container.parent(".sidebar_child_item_container");
            }

        }

    } else if (active.hasClass("sidebar_fav_item_container")) {

        if (active.next()[0] != null) {
            active.next().addClass("active");
            active.removeClass("active");
            scrollToVisibleSideFav(active);
        }

    } else {
        active.removeClass("active");
        $(".item").first().addClass("selected active");
    }

}

function keydownF2 () {

    rename();

}

