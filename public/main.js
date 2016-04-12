var app = angular.module( 'bookmark', [ 'ngMaterial' ] );

function _dflt( data, key, dft ) {
  if ( data && data[ key ] ) {
    return data[ key ];
  }
  return dft;
}

app.controller( 'BookmarkController', [ '$scope', 'BMarkSingleton', 'Category', 'Item', '$mdDialog', '$mdToast',
  function( $scp, BMarkSgl, Category, Item, $mdDialog, $mdToast ) {

  $scp.title = "haha";
  $scp.data = [];
  $scp.data = BMarkSgl.getData();

  /*
  * Add a category
  */
  $scp.addCate = function( ev ) {
    $mdDialog.show({
      controller: addCateCtrl,
      controllerAs: 'acc',
      templateUrl: 'addCate.html',
      title: 'Add Category',
      content: 'Add Category',
      targetEvent: ev,
      clickOutsideToClose:true
    })
    .then(function( cateTitle ) {
      $scp.data.push( new Category({
        title: cateTitle
      }));

  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'Your category has been added!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() { // cancel goes here
        console.log( 'You cancelled the dialog.' );
    });
  };

  /*
  * Add an item
  */
  $scp.addItem = function( ev, cate ) {
    $mdDialog.show({
      controller: addItemCtrl,
      controllerAs: 'aic',
      templateUrl: 'addItem.html',
      title: 'Add item to Category X',
      content: 'Add item to Category X',
      targetEvent: ev,
      clickOutsideToClose:true,
      locals:{
        cate: cate
      }
    })
    .then( function( item ) {

      cate.add(new Item({
        title: item.title,
        url: item.url
      }));

  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'Your item has been added!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() { // cancel goes here
        console.log( 'You cancelled the dialog.' );
    });
  };

  /*
  * Delete an item
  */
  $scp.deleteItem = function( ev, cate, index ) {
    $mdDialog.show({
      controller: deleteItemCtrl,
      controllerAs: 'dic',
      templateUrl: 'deleteItem.html',
      targetEvent: ev,
      locals: {
        itemTitle: cate.items[index].title
      },
      clickOutsideToClose:true
    })
    .then( function() {  // save goes here
      cate.items.splice(index, 1);

  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'Your item has been successfully deleted!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() { // cancel goes here
        console.log( 'You cancelled the dialog.' );
    });
  };

  /*
  * Delete a Category
  */
  $scp.deleteCate = function( ev, cate, index ) {
    $mdDialog.show({
      controller: deleteCateCtrl,
      controllerAs: 'dcc',
      templateUrl: 'deleteCategory.html',
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        cateTitle: cate.title
      },
    })
    .then( function() {
      $scp.data.splice(index, 1);

  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'Your category has been successfully deleted!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() {
        console.log( 'You cancelled the dialog.' );
    });
  };

  /*
  * Rename a category
  */
  $scp.renameCate = function( ev, cate ) {
    $mdDialog.show({
      controller: renameCateCtrl,
      controllerAs: 'rcc',
      templateUrl: 'renameCate.html',
      targetEvent: ev,
      clickOutsideToClose:true,
      locals:{
        cateTitle: cate.title
      }
    })
    .then( function(newTitle) {
      cate.title = newTitle;
  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'Your category name has been successfully changed!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() {
        console.log( 'You cancelled the dialog.' );
    });
  };

  /*
  * Edit a bookmark
  */
  $scp.editItem = function( ev, cate, index ) {
    $mdDialog.show({
      controller: editItemCtrl,
      controllerAs: 'eic',
      templateUrl: 'editItem.html',
      targetEvent: ev,
      clickOutsideToClose:true,
      locals:{
        item: cate.items[index]
      }
    })
    .then( function(item) {
      cate.items[index] = item;

  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'Your bookmark has been successfully changed!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() {
        console.log( 'You cancelled the dialog.' );
    });
  };

}]);

function addCateCtrl( $scope, $mdDialog, $mdToast ) {
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.add = function( answer ){
        $mdDialog.hide( $scope.title );
    }
}

function addItemCtrl( $scope, $mdDialog, $mdToast, cate, Item ) {
    $scope.cate = cate;
    $scope.item = {
      title: '',
      url: ''
    };

    $scope.cancel = function (){
        $mdDialog.cancel();
    }

    $scope.add = function(){
        $mdDialog.hide( $scope.item );
    }
}

function deleteItemCtrl( $scope, $mdDialog, $mdToast, itemTitle ) {

    console.log('inside deleteItem Ctrl: ' + itemTitle);
    $scope.itemTitle = itemTitle;

    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.delete = function(){
        $mdDialog.hide();
    }
}

function deleteCateCtrl( $scope, $mdDialog, $mdToast, cateTitle ) {
    console.log('inside deleteCateCtrl: ' +  cateTitle);
    $scope.cateTitle = cateTitle;
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.delete = function(){
        $mdDialog.hide();
    }
}

function renameCateCtrl( $scope, $mdDialog, $mdToast, cateTitle ) {
    console.log('inside deleteCateCtrl: ' +  cateTitle);
    $scope.cateTitle = cateTitle;
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.rename = function(){
        $mdDialog.hide($scope.cateTitle);
    }
}

function editItemCtrl( $scope, $mdDialog, $mdToast, item ) {
    $scope.item = item;
    console.log('inside editItemCtrl: ' + $scope.item);
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.save = function(){
        $mdDialog.hide(item);
    }
}

app.filter( 'bmCapital', function() {
  return function( input ) {
    return input.toUpperCase();
  };
});


app.factory( 'BMarkSingleton', [ 'Category', 'Item',
  function( Category, Item ) {

    var data = [];

    var cate1 = new Category({
      title: 'Music',
      id: '1'
    });

    var cate2 = new Category({
      title: 'Math',
      id: '2'
    })

    data.push( cate1 );
    data.push( cate2 );

    cate1.add( new Item({
      title: 'Link to material design',
    }));

    cate1.add( new Item({
      title: 'Link to website',
    }));

    cate2.add( new Item({
      title: 'Doing homework for someday',
    }));

    return {
      getData: function() {
        return data;
      }
    };
}]);

app.factory( 'Category', [ function() {

  function Category( data ) {
    this.title = _dflt( data, 'title', 'No title' );
    this.id = _dflt( data, 'id', '' );
    this.items = [];
  }

  var methods = Category.prototype;

  methods.add = function( item ) {
    this.items.push( item );
  };

  return Category;
}]);

app.factory( 'Item', [ function() {

  function Item( data ) {
    this.title = _dflt( data, 'title', 'No title' );
    this.id = _dflt( data, 'id', '' );
    this.url = _dflt( data, 'url', '' );
  }

  return Item;
}]);
