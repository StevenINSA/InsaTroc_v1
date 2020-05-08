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

/***************************************************************************************************
 * ***************   Fin de Passport - Début des requêtes concernant les annonces  *****************
 * *************************************************************************************************/



// requête http POST pour ajouter une nouvelle annonce dans la DB
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

	conn=pool.getConnection()
    .then(conn => 
      conn.query("INSERT INTO Announce (Title, Price, Description, CategoryID,StudentID, PublicationDate) VALUES ('"+req.body.title+"','"+req.body.price+"','"+req.body.description+"','2','1','23-01-20')")
    });

	res.status(201).json({  //statut "ressource créée"
		message: 'Objet ajouté dans la BD';
	});

});


// requête http GET pour afficher une annonce spécifique
app.get('/getPost/:id', (req, res, next) => {
  console.log("id de l'annonce demandée : ", req.params.id);
  // aller chercher l'annonce dans la base de données
  res.json({message: 'voilà l\'annonce'});
  // return res.json({post: post});
  // retourner l'annonce au front end
});


app.use((req, res) => {
  console.log("coucou");
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
