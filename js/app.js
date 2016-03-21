///**
// * アプリケーションの定義
// */
//const ROOTID = "root________";
//const BOOKMARKMENUID = "menu________";
//const BOOKMARKTOOLBARID = "toolbar_____";
//const UNFILEDBOOKMARKSID = "unfiled_____";
//
//
//var bookmarkRoot; // ブックマークのルート
//var bookmarkMenu; // ブックマークメニュー
//var bookmarkToolbar; // ブックマークツールバー
//var unfiledBookmarks; // 未整理のブックマーク
//
//var service = angular.module("fetchBookmarks", []);
//service.factory("myService", ["$q", function($q) {
//
//    // 返り値がインスタンス化されるやつ。
//    // サービスはシングルトンなのでここで変数を定義すると共有できる
//    return {
//
//        bookmarkTree:  {},
//        currentTree: {},
//        getRootBookmarks: function() {
//
//            var d = $q.defer();
//
//            // すべてのブックマークの配列を作ってみる
//            chrome.bookmarks.getTree(function (bookmarkTreeNode) {
//
//                console.log(bookmarkTreeNode[0])
//                // ルートにルートと名前をつけておく(デフォルトでタイトルが空文字なので)
//                bookmarkTreeNode[0].title = "ROOT"
//
//                // どうもfirefoxのブックマークにはルートの直下に変な要素があるのでそれを削除
//                for (var i = bookmarkTreeNode[0].children.length-1; i >= 0; i--) {
//
//                    if (bookmarkTreeNode[0].children[i].title == "") {
//
//                        bookmarkTreeNode[0].children.splice(i,1);
//
//                    }
//
//                }
//                bookmarkTree = bookmarkTreeNode[0];
//                currentTree = bookmarkTree;
//                d.resolve(bookmarkTree)
//
//
//            });
//
//            return d.promise;
//
//        },
//        getBookmarks: function(id) {
//
//            // これだと戻るをした時にもcurrentTreeから探してしまうのでだめ。
//            // idのみから目的のツリーを返す他の処理方法を考える必要がある
//
//            var ret = currentTree;
//
//            currentTree.children.forEach(function (bookmark) {
//
//                if (bookmark.id == id) {
//                    ret = bookmark;
//                }
//
//            });
//            currentTree = ret;
//
//            return ret;
//
//        }
//
//    }
//}]);
//
//
//
//var app = angular.module('BookmarkManager', ["fetchBookmarks", 'ngRoute']);
//app.config(['$routeProvider', function($routeProvider) {
//
//    $routeProvider
//        .when('/:id', {
//            templateUrl: 'view/items.html',
//            controller: 'bookmarkController'
//        })
//        .otherwise({
//            redirectTo: '/0',
//        })
//
//
//
//}]);
//app.controller('bookmarkController', ['$scope', '$routeParams', 'myService', function ($scope, $routeParams, myService) {
//
//    // データはサービスに保持しといてもらったほうが良いぞ!
//
//    $scope.myService = myService;
//
//    $scope.printFolder = {};
//
//    $scope.tes = function () {
//
//        console.log($scope);
//
//    };
//
//    if($routeParams.id != undefined) {
//
//        // 表示するフォルダのID
//        $scope.myService.folderId = $routeParams.id;
//        // 表示するフォルダの情報
//
//        // 初期化
//        // お約束をもらう
//        var promise;
//        if ($scope.myService.folderId == 0) {
//
//            promise = myService.getRootBookmarks();
//            // ブックマークを格納する
//            promise.then(function (bookmarks) {
//                // 現在地のツリーのノード(初めはルート)
//                $scope.myService.printFolder = bookmarks;
//
//            });
//
//
//
//        } else {
//
//            // ルートフォルダでない時は、今いるフォルダを探索すればよい
//
//            $scope.myService.printFolder = myService.getBookmarks($routeParams.id);
//
//            //console.log("test")
//            //console.log($scope.printFolder);
//            //$scope.printFolder.children.some(function (bookmark, index) {
//            //
//            //    if (bookmark.id = $scope.folderId) {
//            //        $scope.printFolder = bookmark;
//            //        return;
//            //
//            //    }
//            //})
//
//
//        }
//
//
//        $scope.myService.folder_clicked = function (idx, event){
//
//            $scope.myService.printFolder.children.forEach(function (bookmark) {
//                bookmark.isSelected = false;
//            })
//
//            $scope.myService.printFolder.children[idx].isSelected = true;
//            $scope.myService.printFolder.children[idx].isActive = true;
//            //$scope.printFolder = $scope.printFolder.children[idx];
//
//        };
//
//        $scope.myService.folder_dblClicked = function (idx, event) {
//
//            location.href = "#/" + $scope.myService.printFolder.children[idx].id
//            //$scope.printFolder = $scope.printFolder.children[idx];
//
//        }
//
//        $scope.myService.isSelected = function(idx) {
//            return $scope.myService.printFolder.children[idx].isSelected == true;
//        }
//        $scope.myService.isActive = function(idx) {
//            return $scope.myService.printFolder.children[idx].isActive == true;
//        }
//
//        //console.log(bookmarkMenu);
//        //console.log(bookmarkToolbar);
//        //console.log(unfiledBookmarks);
//        //printBreadcrumbList(BOOKMARKTOOLBARID);
//
//
//        //printDirInfo(bookmarkToolbar);
//
//        //printBookmarks(bookmarkToolbar.children)
//
//        // サイドバーの描画(本当は上の関数の再帰と同時に行うべき)
//        //printBookmarksInSidebar(bookmarkToolbar.children, $("#folder_list"));
//
//
//        //setListener();
//
//    }
//
//
//
//}]);
//
