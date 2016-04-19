'use strict';
var express = require( 'express' );
var app = express();
var jwt = require( 'jsonwebtoken' );
var bodyParser = require( 'body-parser' );
var mySecret = 'sadfsagfav3etv15t3fg34f2t23256613v4tb42562u4542wf2cd2';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _u = require( 'underscore' );
var crypto = require('crypto');
var uristring = process.env.MONGOLAB_URI ||
  'mongodb://127.0.0.1:27017/local/';

mongoose.connect( uristring, function ( err, res ) {
  if ( err ) {
    console.log ('Error connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

//========================= Declaration of schema =========================
var AccountSchema = new Schema( {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    created_date: {
      type: Date,
      required: true
    },
    modified_date: {
      type: Date,
      required: true
    }
});

var CategorySchema = new Schema( {
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  items: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }]
});

var Account = mongoose.model( 'Account', AccountSchema );
var Category = mongoose.model( 'Category', CategorySchema );

function createAccount( data, _callback ) {

  var email = data.email;
  var password = data.password;
  var _date = new Date();

  var _acc = new Account( {
    email: email,
    password: password,
    created_date: _date,
    modified_date: _date
  });

  _acc.save( function( _err ) {
    if ( _err ) {
      ( _callback || _u.noop )( _err, 'Cannot save the account.' );
    } else {
      ( _callback || _u.noop )( null, _acc );
    }
  });
}

function getAccount( data, _callback ) {
  var email = data.email;
  Account.findOne( {
    email: email
  }).exec( function( err, rlt ) {
    if ( err ) {
      ( _callback || _u.noop )( _err, 'Cannot get the account.' );
    } else {
      ( _callback || _u.noop )( null, rlt );
    }
  });
}

function updateCategoryById( data, _callback ) {
  var _id = data._id;
  var account_id = data.account_id;
  if ( _id ) {
    Category.findOne( {
      _id: _id
    }).exec( function( err, rlt ) {
      if ( err ) {
        ( _callback || _u.noop )( _err, 'Cannot update the category.' );
      } else {
        var _cate = rlt;
        _cate.name = data.name;
        _cate.description = data.description;
        _cate.items = data.items;
        if ( _cate.account_id == account_id ) {
          // have to match the same account_id
          _cate.save( function( err_cate ) {
            if ( err_cate ) {
              ( _callback || _u.noop )( _err, 'Cannot update the category.' );
            } else {
              ( _callback || _u.noop )( null, 'Update category successfully.' );
            }
          });
        } else {
          ( _callback || _u.noop )( {}, 'Cannot update the category.' );
        }
      }
    });
  }
}

function getCategoryByAccountId( account_id, _callback ) {
  if ( account_id ) {
    Category.find( {
      account_id: account_id
    }).exec( function( err, rlt ) {
      if ( err ) {
        ( _callback || _u.noop )( err, 'Cannot find category.' );
      } else {
        ( _callback || _u.noop )( null, rlt );
      }
    });
  } else {
    ( _callback || _u.noop )( {}, 'Missing account_id.' );
  }
}

function createCategory( data, _callback ) {

  var name = data.name;
  var description = data.description;
  var account_id = data.account_id;

  var _category = new Category({
    account_id: account_id,
    name: name,
    description: description
  });

  _category.save( function( err ) {
    if ( err ) {
      ( _callback || _u.noop )( _err, 'Cannot create the category.' );
    } else {
      ( _callback || _u.noop )( null, _category );
    }
  });

}

//=========================================================================

app.set('port', (process.env.PORT || 5000));
app.use( express.static(__dirname + '/public') );

app.set( 'superSecret', mySecret );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );

// get the token by authenticate
app.post( '/authenticate', function( req, res ) {
  var email = req.body.email;
  var password = req.body.password;
  if ( !email || !password ) {
    res.json({
      status: 'FAIL',
      message: 'Require email and password',
    })
  }
  else {
    getAccount( {
      email: email
    }, function( err, acc ) {
      if ( err ) {
        console.log( 'haha' );
        res.json({
          status: 'FAIL',
          message: 'Cannot authenticate.'
        })
      } else {
        if ( acc ) {

          if ( acc.password == hash( password ) ) {
            var token = jwt.sign({
              account_id: acc._id
            }, mySecret, {
              expiresIn: 86400
            });
            res.json({
              status: 'SUCCESS',
              message: 'Enjoy your token.',
              token: token
            })
          } else {
            res.json({
              status: 'FAIL',
              message: 'Cannot authenticate.'
            })
          }

        } else {

          createAccount( {
            email: email,
            password: hash( password )
          }, function( err, new_acc ) {

            if ( err ) {
              res.json({
                status: 'FAIL',
                message: 'Cannot authenticate.'
              })
            } else {

              var token = jwt.sign({
                account_id: new_acc._id
              }, mySecret, {
                expiresIn: 86400
              });
              res.json({
                status: 'SUCCESS',
                message: 'Enjoy your token.',
                token: token
              })

            }

          });

        }
      }
    });
  }
});

// create a middleware ahead to avoid accessing without authorization

app.use( function( req, res, next ) {
  var token = req.body.token || req.query.token ||
    req.headers['x-access-token'];
  if( token ) {
    jwt.verify( token, mySecret, function( err, decoded ) {
      if ( err ) {
        return res.json( {
          status: 'FAIL',
          message: 'Failed to authenticate token.'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status( 403 )
      .send( {
        status: 'FAIL',
        message: 'No token provided'
      });
  }
});

// create category
app.post( '/category', function( req, res ) {
  var data = req.body.data;
  if ( data ) {
    data.account_id = req.decoded.account_id;
  }
  if ( validate_create_cate( data ) ) {
    createCategory( data, function( err, rlt ) {
      if ( err ) {
        res.json({
          status: 'FAIL',
          message: 'Cannot create category.'
        })
      } else {
        res.json({
          status: 'SUCCESS',
          message: rlt
        })
      }
    });
  } else {
    res.json({
      status: 'FAIL',
      message: 'Cannot create category.'
    })
  }
});

function validate_create_cate( data ) {
  if ( !data) return false;
  return !data.name && !data.description && !data.account_id;
}

// get all category
app.get( '/category', function( req, res ) {
  getCategoryByAccountId( req.decoded.account_id,
    function( err, rlt ) {
      if ( err ) {
        res.json({
          status: 'FAIL',
          message: 'Cannot get data'
        });
      } else {
        res.json({
          status: 'SUCCESS',
          message: rlt
        });
      }
  });
});

app.put( '/category/:id', function( req, res ) {
  var _id = req.params.id;
  var account_id = req.decoded.account_id;
  var data = req.body;
  updateCategoryById({
    _id: _id,
    account_id: account_id,
    name: data.name,
    description: data.description,
    items: data.items
  }, function( err, rlt ) {
    if ( err ) {
      res.json({
        status: 'FAIL',
        message: 'Cannot update'
      });
    } else {
      res.json({
        status: 'SUCCESS',
        message: 'Update successfully'
      });
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// using sha1 for hashing
function hash( input ) {
  return crypto.createHash( 'sha1' )
    .update( input )
    .digest( 'hex' );
}
