/**
 * Created by realizerS on 16/03/15.
 */

// 初期化が完了した時に呼ばれる関数
// ブックマークマネジメントの初めのページで一度だけ行う
// (画面をF5とかで更新した時もやるので、urlの変更を怠らない。)
function doneInitialize() {


    history.pushState(null, null, "#id=" + ROOTID)


    var folder_id = getPrintFolderId();

    // リスナの登録
    setListener();


    //メインコンテンツの描画
    printBookmarks(bookmarkTree.children);

    // コンテンツ上部にフォルダの情報を描画
    printDirInfo(bookmarkTree);


    // パンくずリスト
    printBreadcrumbList(bookmarkTree);


    // 左のサイドバーの描画(本当は上の関数の再帰と同時に行うべき)
    printBookmarksInSidebar(bookmarkTree, $("#folder_list"));

    // お気に入りフォルダを左のサイドバーへ描画
    printFavoriteBookmarks();

    setDragAndDropListener();

}


$(window).on('popstate', function (e) {

    console.log("popstate")

    var printFolderId = getPrintFolderId();

    repaintContent(printFolderId);



});

