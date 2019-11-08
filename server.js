//Imports start here
var express = require("express");
var fs = require('fs');
var jwt = require('jsonwebtoken')
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const cors =require('cors');
var bcrypt = require('bcrypt');
const crypto = require("crypto");
var cookieParser = require('cookie-parser');


//File Requirements
var db = require('./config/database.js')
var ENV = require('./config/ENV_VARS.js')
var user = require('./models/user')
var JWT_OPTIONS = require('./config/jwt.js')

// PRIVATE and PUBLIC key
var privateKEY  = fs.readFileSync('./keys/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./keys/public.key', 'utf8');


//Express initializtion
var app = express();



//Using Cors
app.use(cors());
app.use(cookieParser());


//To get data from the angular project
app.use(bodyParser.json());

//To get rid of the promise exception
mongoose.Promise = global.Promise; 



var activeUsers = 0;



//DB CONNECTION
// This is an async funtion
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true}) //Changed this line to link to a database file instead of having everything in one file to provide quick and easy access for further work
    .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


app.use(express.static("styles"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


//STARTING SERVER HERE
app.listen(ENV.PORT, process.env.IP, function(req, res) //The Serv.port is from a config file
{
    console.log("SERVER STARTED");
});

//Basic Housekeeping ends here. Refer back here for the Import Errors that you may get



app.get('/', function(req, res){
	if(req.cookies.access_token!=undefined){
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie().redirect('/login')
      }
      else{
        console.log(decodedToken)
      }
  })
  }
	else{
    console.log('This user has no cookie. Rendering the homepage')
		res.render('index')
	}
})

app.post('/', function(req, res){
  if(req.cookies.access_token!=undefined){
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie().redirect('/login')
      }
      else{
        //have to put in whatever post request is necessary here.
      }
    })
  }
  else{
    console.log("This user is unauthenticated. He must log in")
    
  }
})

app.get('/register', function(req, res){
  if(req.cookies.access_token!=undefined){
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie().redirect('/login')
      }
      else{
        res.redirect('/home')
      }
    })
  }
  else{
    res.render('register')
  }
})

app.post('/register', function(req, res){
  bcrypt.hash(req.body.password, ENV.SALT_ROUNDS, function(err, BCRYPT_HASH){
    if(err){
      console.log(err)
      res.redirect(500, '/register')
    }
    else{
      var newUser = new user({
        DisplayName: req.body.DisplayName,
        password: BCRYPT_HASH,
        userType: "user"
      })

      newUser.save(function(err, obj){
        if(err){
          console.log(err)
        }
        else{
          console.log("Successful User Registration. Proceed to login")
          console.log(obj)
          res.redirect('/login')
        }
      })
    }
  })

})

app.get('/login', function(req, res){
  if(req.cookies.access_token!=undefined){
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie('access_token').redirect('/login')
      }
      else{
          res.redirect('/home')
      }
    })
  }
  else{
    res.render('login')
  }
})

app.post('/login', function(req, res){
  user.findOne({DisplayName: req.body.DisplayName}, function(err, USER_OBJ){
    if(err){
      console.log(err)
    }
    else{
      bcrypt.compare(req.body.password, USER_OBJ.password, function(err, BCRYPT_RES){
        if(err){
          console.log(err)
        }
        else{
          if(BCRYPT_RES==true){
            var token = jwt.sign({nickname: req.body.DisplayName, id: USER_OBJ._id, role: USER_OBJ.userType}, privateKEY, JWT_OPTIONS.signOptions)
            console.log("jwt generated")
            res.cookie('access_token', token, {expires: new Date(Date.now() + 24 * 60 * 60 * 1000)})
            activeUsers = activeUsers + 1;
            if(USER_OBJ.userType == 'admin'){
              res.redirect('/admindash')
            }
            else{
              res.redirect('/home')
            }

          }
          else{
            console.log("Authentication Failed")
            res.redirect('/login')
          }
        }
      })
    }
  })
})

app.get('/home' ,function(req, res){
  if(req.cookies.access_token!=undefined){
    console.log(req.cookies.access_token)
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie('access_token').redirect('/login')
      }
      else{
        res.render('home', {token: decodedToken})
      }
    })
  }
  else{
    console.log("jwt not found. redirecting to login")
    res.redirect('/login')
  }
  
})


app.get('/login', function(req, res){
  if(req.cookies.access_token!=undefined){
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie('access_token').redirect('/login')
      }
      else{
          res.redirect('/home')
      }
    })
  }
  else{
    res.render('login')
  }
})

app.get('/admindash' ,function(req, res){
  if(req.cookies.access_token!=undefined){
    console.log(req.cookies.access_token)
    jwt.verify(req.cookies.access_token, publicKEY, JWT_OPTIONS.verifyOptions, function(err, decodedToken){
      if(err){
        console.log(err)
        res.clearCookie('access_token').redirect('/login')
      }
      else{
        if(decodedToken.role == 'admin'){
          res.render('admindash', {token: decodedToken, users: activeUsers})
        }
        else{
          res.send("Unauthorized to perform this action")
        }

      }
    })
  }
  else{
    console.log("jwt not found. redirecting to login")
    res.redirect('/login')
  }
  
})



app.get('/logout', function(req, res){
  activeUsers = activeUsers-1;
  console.log("Getting the logout method and clearing cookies")
  res.clearCookie('access_token').redirect('/login')
})