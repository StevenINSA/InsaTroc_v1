const express = require('express');
const bodyParser = require('body-parser'); //permet de formater les données en JSON
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var id=0;

const mariadb = require('mariadb');
const pool = mariadb.createPool({database:'insatroc', host: 'localhost', user:'toto2', password: 'pwdtoto'});

const app = express();

function attributeID(category){
  var categoryID;

  switch (category){
    case "Chambre":
    categoryID = 1;
    break;

    case "Cuisine":
    categoryID = 2;
    break;

    case "Salle de bain":
    categoryID = 3;
    break;

    case "Bureau":
    categoryID = 4;
    break;

    case "Loisirs/Sport":
    categoryID = 5;
    break;

    case "Autre":
    categoryID = 6;
    break;
    }
  return categoryID;
}

app.use((req, res, next) => { //header permettant de communiquer entre les deux serveurs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());//formate en JSON les données pour n'importe quelle route

app.post('/addPost', (req, res, next) => {
	console.log(req.body);  //affiche les éléments de la requête
	req.body._id = id;

	console.log("id : ",req.body._id);
	console.log("Title : ",req.body.title);
	console.log("Description : ",req.body.description);
	console.log("Category : ",req.body.category);
	console.log("Price : ",req.body.price);
	console.log("Urls : ",req.body.urls);

	var catID = attributeID(req.body.category);
	console.log("Category id : ",catID);

  var title = req.body.title;
  console.log("titre =",title);
  console.log(typeof req.body.title);

  var price = req.body.price.toString();
  console.log("prix =",price);
  console.log(typeof req.body.price);
  console.log(typeof price);

  var description = req.body.description;
  console.log("description =",description);
  console.log(typeof req.body.description);

	//enlever AnnounceID -> défini dans la DB
	//dans la BD : clé primaire entière qui s'auto incrémente
  conn=pool.getConnection()
    .then(conn => {
      //conn.query("INSERT INTO Announce value ('+req.body.title+','+req.body.price+','+req.body.description+','+catID+')", [1, "mariadb"])
      conn.query("INSERT INTO Announce (Title, Price, Description, CategoryID) VALUES ('\title\','\price\','\description\','\catID\')")
      //conn.query("INSERT INTO Announce (Title, Price, Description, CategoryID) VALUES ('chat','32', 'dsdsncsjc', '3')")
        .then((rows) => {
          console.log(rows); //[ {val: 1}, meta: ... ]
                //Table must have been created before
                // " CREATE TABLE myTable (id int, val varchar(255)) "
          return conn.query("SELECT * FROM Announce");
         })
        .catch(err => {
          //handle error
        })
      }).catch(err => {
      //not connected
    });
	id++;


	res.status(201).json({  //statut "ressource créée"
		message: 'objet créé'
	});

});

app.use((req, res) => {
  res.json({message:'coucou'});
});


/*
app.use('/addPost', (req, res) => {
  const annonce = [
    {
		_id: string,
      title: string,
      category: string,
      price: number,
      description: string,
      urls : []

    },
  ];
  res.status(200).json(stuff);
});*/




module.exports = app;

// ******** PARTIE PENELOPE ********


/*********************************
 * Passport
 * ******************************/

// define strategy used by passport
passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    if(username === "admin@admin.com" && password === "admin"){
      console.log("username & password ok");
      return done(null, username);
    } else {
      console.log("unauthorized acces");
      return done("unauthorized access", false);
    }
  }

  // function(username, password, done) {
  //   User.findOne({ email: username }, function (err, user) {
  //     if (err) { return done(err); }
  //     // Return if user not found in database
  //     if (!user) {
  //       return done(null, false, {
  //         message: 'User not found'
  //       });
  //     }
  //     // Return if password is wrong
  //     if (!user.validPassword(password)) {
  //       return done(null, false, {
  //         message: 'Password is wrong'
  //       });
  //     }
  //     // If credentials are correct, return the user object
  //     return done(null, user);
  //   });
  // }

));

// to facilitate user data storage in the session and retrieving the data on subsequent requests
passport.serializeUser(function(user, done) {
  if(user) done(null, user);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});

app.use(passport.initialize());
app.use(passport.session());


// middleware that intercepts the authentication request and makes the Passport authentication call
const auth = () => {
  return (req, res, next) => {
    console.log("blablabla");
    console.log(req.body);
    passport.authenticate('local', (error, user, info) => {
      console.log("requête d'authentification reçue dans auth :");
      console.log(user);
      console.log(info);
      // if Passport catches an error
      if(error) res.status(400).json({"statusCode" : 200, "message" : error});
      // if a user is found
      else if(user){
        res.status(200).json({"user" : user});
        // res.status(200);
        // res.json({"token": token});
      }
      // if user is not found
      else{
        res.status(401).json({"message" : "wrong authentication", info});
      }
      // req.login(user, function(error) {
      //   console.log("passport.authenticate");
      //   if(error) return next(error);
      //   next();
      // });
    })(req, res, next);
  }
}

// passport.authenticate('local', (error, user, info) => {})(req, res);

// requête http POST pour l'authentification
app.post('/authenticate/', auth(), (req, res) => {
  console.log("requête d\'authentification reçue");
  console.log(req.body);
	res.status(200).json({"statusCode" : 200, "message" : "hello"});
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(400).json({"statusCode" : 400, "message" : "not authenticated"});
}
