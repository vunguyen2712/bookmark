// var express = require( 'express' );
// var app = express();
// var bodyParser = require( 'body-parser' );
//
// app.set('port', (process.env.PORT || 5000));
// app.use(express.static(__dirname + '/public'));
//
// app.set( 'superSecret', 'omg');
// app.use( bodyParser.urlencoded( { extended: false } ) );
// app.use( bodyParser.json() );
//
// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

var app = angular.module('bookMarkApp',['ngMaterial', 'ngMessages']);

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('altTheme')
    .primaryPalette('purple');
});
