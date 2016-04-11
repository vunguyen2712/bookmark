var app = angular.module( 'bookmark', [ 'ngMaterial' ] );

function _dflt( data, key, dft ) {
  if ( data && data[ key ] ) {
    return data[ key ];
  }
  return dft;
}

app.controller( 'BookmarkController', [ '$scope', 'BMarkSingleton', 'Category', 'Item', '$mdDialog', '$mdToast',
  function( $scp, BMarkSgl, Category, Item, $mdDialog, $mdToast ) {

  $scp.itemTitle = "tempTitle";
  $scp.itemURL = "tempURL";
  $scp.title = "haha";
  $scp.data = [];
  $scp.data = BMarkSgl.getData();

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

      console.log( cateTitle );

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

  $scp.addItem = function( ev, cate ) {
    $mdDialog.show({
      controller: addBmItemCtrl,
      controllerAs: 'aic',
      templateUrl: 'addItem.html',
      title: 'Add item to Category X',
      content: 'Add item to Category X',
      targetEvent: ev,
      clickOutsideToClose:true
    })
    .then( function( itemTitle, itemURL ) {  // save goes here

    //TODO: dont know how to add item in a specific category
		for (var i = 0; i <  $scp.data.length; ++i){
      if ($scp.data[i].title === cate.title){
          $scp.data[i].add(new Item({
            title: itemTitle,
            url: itemURL
          }));
      }
    }

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

}]);

function addCateCtrl( $scope, $mdDialog, $mdToast ) {
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.add = function( answer ){
        $mdDialog.hide( $scope.title );
    }
}

function addBmItemCtrl( $scope, $mdDialog, $mdToast ) {
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.add = function( itemTitle, itemURL ){
        $mdDialog.hide( $scope.itemTitle, $scope.itemURL );
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
