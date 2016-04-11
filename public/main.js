var app = angular.module( 'bookmark', [ 'ngMaterial' ] );

function _dflt( data, key, dlt ) {
  if ( data && data[ key ] ) {
    return data[ key ];
  }
  return dft;
}

app.controller( 'BookmarkController', [ '$scope', 'BMarkSingleton', '$mdDialog', '$mdToast',
  function( $scp, BMarkSgl, $mdDialog, $mdToast ) {

  $scp.title = "haha";
  $scp.data = [];
  $scp.data = BMarkSgl.getData();

  $scp.addItem = function(ev) {
    $mdDialog.show({
      controller: addItemCtrl,
      controllerAs: 'aic',
      templateUrl: 'addItem.html',
      targetEvent: ev,
      clickOutsideToClose:true
    })
    .then(function(answer) {  // save goes here
        var item = {
            title: answer.what,
            url: answer.where
        };

        console.log(item);

		$scp.data.push(item);

		$mdToast.show(
		  $mdToast.simple()
		    .content('Your item has been added!')
		    .position('top right')
		    .hideDelay(3000)
		);

    }, function() { // cancel goes here
        console.log('You cancelled the dialog.');
    });
  };

}]);


function addItemCtrl($scope, $mdDialog, $mdToast) {
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.save = function(){
        $mdDialog.hide();
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

    data.push( new Category({
      title: 'Music',
      id: '1'
    }));

    data.push( new Category({
      title: 'Math',
      id: '2'
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
