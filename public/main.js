var app = angular.module( 'bookmark', [ 'ngMaterial','ngAnimate' ] );

function _dflt( data, key, dft ) {
  if ( data && data[ key ] ) {
    return data[ key ];
  }
  return dft;
}

app.controller( 'BookmarkController', [ '$scope', 'BMarkSingleton', 'Category', 'Item', 'TokenHandler', '$mdDialog', '$mdToast', '$http',
  function( $scp, BMarkSgl, Category, Item, TokenHandler, $mdDialog, $mdToast, $http ) {

  $scp.title = "haha";
  $scp.data = [];
  // $scp.data = BMarkSgl.getData();
  $scp.token = {};

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
    .then(function( cate ) {

      var newCate = new Category({
        name: cate.name,
        description: cate.description
      });

      $scp.data.push( newCate );

      console.log("adding cate... cateName: " + cate.name + " des: " + cate.description) ;

      $http({
        method: 'POST',
        url: '/category',
        data: newCate,
        headers: {'x-access-token': $scp.token}
       })
      .then(function(response) {
          //First function handles success
          console.log(response.data.message + "\nToken: " + $scp.token);
          $mdToast.show(
      		  $mdToast.simple()
      		    .content( 'Your category has been added!' )
      		    .position( 'top right' )
      		    .hideDelay( 3000 )
      		);

      }, function(response) {
          //Second function handles error
          console.log("Status: " + response.data.message);
          $mdToast.show(
      		  $mdToast.simple()
      		    .content( 'Failed to add category!' )
      		    .position( 'top right' )
      		    .hideDelay( 3000 )
      		);
      });

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
        cateTitle: cate.name
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
        cateTitle: cate.name
      }
    })
    .then( function(newTitle) {
      cate.name = newTitle;
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

  /* =================================
   * Save all data
   * =================================
   */
  $scp.save = function( ev ) {
    $mdDialog.show({
      controller: saveCtrl,
      controllerAs: 'sc',
      templateUrl: 'save.html',
      targetEvent: ev,
      clickOutsideToClose:true,

    })
    .then( function(acc) {
      console.log("saving... with acc: " + acc.id + " " + acc.password) ;
      var account = {
          email: acc.id,
          password: acc.password
      };
      var config = {
        'x-access-token': $scp.token
      }
      $http.post("/authenticate", account, config)
      .then(function(response) {
          //First function handles success
          $scp.token = response.data.token;
          console.log(response.data.message + "\nToken: " + $scp.token);

      }, function(response) {
          //Second function handles error
          console.log("Status: " + response.data.message);
      });

  		$mdToast.show(
  		  $mdToast.simple()
  		    .content( 'All has been saved!' )
  		    .position( 'top right' )
  		    .hideDelay( 3000 )
  		);

    }, function() {
        console.log( 'You cancelled the dialog.' );
    });
  };
  /* =================================
   * Load data
   * =================================
   */
   $scp.load = function( ev ) {
     $mdDialog.show({
       controller: loadCtrl,
       controllerAs: 'lc',
       templateUrl: 'load.html',
       targetEvent: ev,
       clickOutsideToClose:true,

     })
     .then( function( acc ) {
       console.log("loading... with ID: " + acc.id + " password: " + acc.password);

       var account = {
           email: acc.id,
           password: acc.password
       };

       $http.post("/authenticate", account)
       .then(function(response) {
           //First function handles success
           $scp.token = response.data.token;
           console.log("\nToken: " + $scp.token);
           // load all date to the UI
           $http({
             method: 'GET',
             url: '/category',
             headers: {'x-access-token': $scp.token}
            })
           .then(function (response){
             console.log("status: " + response.data.status + "\n");
             var cateArray = response.data.message;
             for (var i = 0; i <  cateArray.length; ++i){
                 console.log("cate name: " + cateArray[i].name + " cate des: " + cateArray[i].description);
                 $scp.data.push( new Category({
                   name: cateArray[i].name,
                   description: cateArray[i].description,
                   items: cateArray[i].items
                 }));
             }
             // show message
             $mdToast.show(
                $mdToast.simple()
                  .content( 'All has been loaded successfully!' )
                  .position( 'top right' )
                  .hideDelay( 3000 )
              );
            }, function(response) {
                //Second function handles error
                console.log("Status: " + response.data.message);
                // show message
                $mdToast.show(
                  $mdToast.simple()
                    .content( 'Failed to load your data!' )
                    .position( 'top right' )
                    .hideDelay( 3000 )
                );
             }); // end of get category

           // show message
          //  $mdToast.show(
        	// 	  $mdToast.simple()
        	// 	    .content( 'All has been loaded successfully!' )
        	// 	    .position( 'top right' )
        	// 	    .hideDelay( 3000 )
        	// 	);

       }, function(response) {
           //Second function handles error
           console.log("Status: " + response.data.message);
           // show message
           $mdToast.show(
        		  $mdToast.simple()
        		    .content( 'Failed to load your data!' )
        		    .position( 'top right' )
        		    .hideDelay( 3000 )
        		);
       });

     }, function() {
         console.log( 'You cancelled the dialog.' );
     });
   };

}]);

function addCateCtrl( $scope, $mdDialog, $mdToast ) {
    $scope.cate = {
      name: '',
      description: ''
    }
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.add = function( answer ){
        $mdDialog.hide( $scope.cate );
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

function saveCtrl ( $scope, $mdDialog, $mdToast, $http) {
    $scope.acc = {
      id: '',
      password: ''
    };
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.save = function(){
        $mdDialog.hide($scope.acc);
    }
}

function loadCtrl ( $scope, $mdDialog, $mdToast) {
    $scope.acc = {
      id: '',
      password: ''
    };
    $scope.cancel = function (){
        $mdDialog.cancel();
    }
    $scope.load = function(){
        $mdDialog.hide($scope.acc);
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
      name: 'Music',
      description: 'about Music',
      id: '1',
      __expand: false
    });

    var cate2 = new Category({
      name: 'Math',
      description: 'about Math',
      id: '2',
      __expand: false
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
    this.name = _dflt( data, 'name', 'No name' );
    this.description = _dflt( data, 'description', 'No description' );
    this.id = _dflt( data, 'id', '' );
    this.items = [];
    this.__expand = _dflt( data, '__expand', false );
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

app.factory( 'TokenHandler',  [ function($http) {

    function TokenHandler (data) {
      this.token = _dflt( data, 'token', 'No token' );
    }

    var methods =  TokenHandler.prototype;

    methods.authenticate = function (acc) {
      $http.post("/authenticate", acc)
      .then(function(response) {
          //First function handles success
          this.token = response.token;
          console.log(response.message + " Token: " + response.token);

      }, function(response) {
          //Second function handles error
          console.log(response.message);

      });
    }
    return TokenHandler;
}]);
