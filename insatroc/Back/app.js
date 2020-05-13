const express = require('express');
const bodyParser = require('body-parser'); //permet de formater les données en JSON
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const saltRounds = 10;

const mysql = require('mysql')
const con = mysql.createConnection({
  database: "insatroc",
  host: "localhost",
  user: "toto2",
  password: "pwdtoto"
});

var pwdhash;
/*
const mariadb = require('mariadb');
const pool = mariadb.createPool({database:'insatroc', host: 'localhost', user:'toto2', password: 'pwdtoto'});
*/
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
function addslashes(ch) { //fonction pour échapper les apostrophes et autres qui créaient des erreurs
  ch = ch.replace(/\\/g,"\\\\");
  ch = ch.replace(/\'/g,"\\'");
  ch = ch.replace(/\"/g,"\\\"");
  return ch;
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

  /* A la place de ce qui suit dans cette fonction,
  il faut vérifier si la BD contient un utilisateur dont l'email est "username"
  et si le mot de passe correspondant est bien "password".
  Si oui, alors : return(done, null, username);
  Sinon : return("unauthorized access", false);
  */


  con.query("SELECT Email FROM Student where Email = '"+username+ "'",function (err, user, fields) {
    if (err) {
      throw err;
    } else if (!user){
      console.log("User not found")
    } else {
      console.log("Correct user")
      con.query("SELECT Password FROM Student where Email = '"+username+"'", function (err, result, fields){
        if (err) {
          throw err;
        } else{
          pwdhash = result;
        }
      });
    }
  });


  bcrypt.compare (password, pwdhash, function(err, isMatch){
    if(err){
      throw(err)
    } else if (!isMatch){
      console.log("The password doesn't match!")
    } else {
      console.log("Correct password")
    }
  })




  //if(username === "admin@admin.com" && password === "admin"){
  //  console.log("username & password ok");
  //  return done(null, username);
  //} else {
  //  console.log("unauthorized acces");
  //  return done("unauthorized access", false);
  //}
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

/***************** Authentification**************** */

// créer un token d'authentification pour le renvoyer à angular ?

// middleware that intercepts the authentication request and makes the Passport authentication call
const auth = () => {
return (req, res, next) => {
  console.log("requête d'authentification reçue dans auth :");
  console.log(req.body);
  passport.authenticate('local', (error, user, info) => {
    console.log("utilisateur :");
    console.log(user);
    console.log(info);
    // if Passport catches an error
    if(error) res.status(400).json({"statusCode" : 200, "message" : error});
    // if a user is found
    else if(user){
      // get username and userID in database
      var username = "stevy"
      var userID = 1;
      res.status(200).json({"user" : userID, "username" : username});
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
}}

// passport.authenticate('local', (error, user, info) => {})(req, res);

// requête http POST pour l'authentification
app.post('/authenticate/', auth(), (req, res) => {
console.log("requête d\'authentification reçue");
console.log(req.body);
res.status(200).json({"statusCode" : 200, "message" : "hello"});
});


/***************** Création de compte **************** */

// middleware that intercepts the register request and creates a new user
const register = () => {
  return (req, res, next) => {
    console.log("requête de création de compte reçue dans register :");
    console.log(req.body);

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var username = req.body.username;
    var email = req.body.email;
    var password;
    var userID;

    //création de l'utilisateur avec mot de passe crypté
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err
      } else {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err) {
            throw err
          } else {
            console.log(hash)
            //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
            con.query("INSERT INTO Student (Username,Password,Email,Name,Surname,TelephoneNumber) VALUES ('"+username+"','"+hash+"','"+email+"','"+last_name+"','"+first_name+"','numéro de tel')", function (err, result, fields){
              if (err) {
                throw err;
                res.status(200).json({"user" : result.insertId, "username" : username});
            }});
          }
        })
      }
    })





  }}

// requête http POST pour se créer un compte
app.post('/register/', register(), (req, res) => {
  console.log("requête de création de compte reçue");
  console.log(req.body);
  res.status(200).json({"statusCode" : 200, "message" : "hello"});
});

app.get('/logout/', (req, res) => {
  console.log("requête de déconnexion reçue")
  req.logout();
  res.redirect('/');
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
  console.log("requête de création d'annonce reçue :")
	console.log(req.body);  //affiche les éléments de la requête

  var catID=[];
  for (let i=0; i< req.body.category.length; i++){
    var objet = req.body.category[i];
    catID[i] = attributeID(objet.toString()); //convertion de l'objet en string
  }

  var today = new Date(); //formater la date
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  var titreEchape = addslashes(req.body.title); //échappe les caractères spéciaux, évite les érreurs dans la BD
  var descriptionEchape = addslashes(req.body.description);

  con.query("INSERT INTO Announce (Title, Price, Description, StudentID, PublicationDate) VALUES ('"+titreEchape+"','"+req.body.price+"','"+descriptionEchape+"','1','"+today+"')",
    function (err, result, fields){
      if (err) throw err;
      console.log(result.insertId);
      res.status(201).json({  //statut "ressource créée"
      message: 'objet créé'
      });
      for (let i=0; i<req.body.category.length; i++){

        con.query("INSERT INTO AnnounceCategories (CategoryID, AnnounceID) VALUES ('"+catID[i]+"','"+result.insertId+"')",
          function (err, result, fields){
            if (err) throw err;
            console.log(result);
        });
      }
  });
});


// requête http GET pour afficher une annonce spécifique
app.get('/getPost/:id', (req, res, next) => {
  console.log("id de l'annonce demandée : ", req.params.id);
  con.query("SELECT * FROM Announce WHERE AnnounceID = '"+req.params.id+"'", function (err, result, fields) {
    if (err) throw err;
    //if (result.toString().length == 0){
      //res.json("pas d'annonce correspondante"); //si l'id n'existe plus dans la bd
    //} marche pas, bug à cause du deuxième res.json
    res.status(200).json(result);
  });
});

// requête http GET pour afficher toutes les annonces
app.get('/posts', (req, res, next) => {
  console.log("requête d'affichage de toutes les annonces reçue :")
  con.query("SELECT * FROM Announce", function (err, result, fields) {
    if (err) throw err;
    //var data = JSON.stringify(result);
    console.log(result);
    res.status(200).json(result);
  });
});


app.get('/getUserInfo', (req, res, next) => {
  console.log("requête des infos d'utilisateur reçue :");

  // aller chercher dans la BD les infos de l'utilisateur (dont l'ID et username sont dans le header http)
  res.status(200).json({first_name: 'Pénélope', last_name: 'Roullot', username: 'proullot', email: 'p.r@gmail.com'})
})

app.post('/modifyUserInfo', (req, res, next) => {
  console.log("requête de modification des infos d'utilisateur reçue :");

  // modifier dans la BD les infos de l'utilisateur (dont l'ID et username sont dans le header http)
  // et répondre avec l'ID et l'username (au cas où il a changé)
})

app.get('/getUserPosts', (req, res, next) => {
  console.log("requête pour les annonces d'un utilisateur reçue :");
   // aller chercher dans la BD les annonces de l'utilisateur (dont l'ID et username sont dans le header http)
})


app.use((req, res, next) => {
 console.log("coucou");
 res.json({message:'coucou'});
});






module.exports = app;
