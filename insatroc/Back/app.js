const express = require('express');
const bodyParser = require('body-parser'); //permet de formater les données en JSON
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const tokenValidator = require("./jwt_validator")

const mysql = require('mysql')
const con = mysql.createConnection({
  database: "insatroc",
  host: "localhost",
  user: "toto2",
  password: "pwdtoto"
});
const jwtKey = "privateKey";


//const mariadb = require('mariadb');
//const pool = mariadb.createPool({database:'insatroc', host: 'localhost', user:'toto2', password: 'pwdtoto'});

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
function attributeCategory(categoryID){
  var category = [];

  // for(let i in categoryID){
    switch (categoryID){
      case 1:
      category.push("Chambre");
      break;

      case 2:
      category.push("Cuisine");
      break;

      case 3:
      category.push("Salle de bain");
      break;

      case 4:
      category.push("Bureau");
      break;

      case 5:
      category.push("Loisirs/Sport");
      break;

      case 6:
      category.push("Autre");
      break;
      }
  // }
  return category;
}

function getUsernameFromID(studentID){
  con.query("SELECT Username FROM Student WHERE StudentID = '"+studentID+"'", function(err, result, fields){
    if(err) throw err;
    return result;
  })
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
  con.query("SELECT Email FROM Student where Email = '"+username+ "'",function (err, user, fields) {
    console.log(user);
    if (err) {
      throw err;
    } else if (user.length==0){
      console.log("User not found");
      return done("User not found", false);
    } else {
      console.log("Correct user");
      con.query("SELECT Password FROM Student where Email = '"+username+"'", function (err, result, fields){
        if (err) {
          throw err;
        } else {
          /*var string = JSON.stringify(result); //convertit le result en JSON
          console.log(string);
          var json = JSON.parse(string); //sépare les éléments du JSON
          console.log(json);
          console.log("selection : ", json[0].Password);*/
          var motdepasse = result[0].Password;
          bcrypt.compare (password, motdepasse, function(err, isMatch){
            if (err) {
              throw err;
            } else if (!isMatch){
              console.log("The password doesn't match!");
              return done("Incorrect Email/Password credentials", false);
            } else {
              console.log("Correct password");
              return done(null, username);
            }
          })
        }
      });
    }
  });
}));

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

// middleware that intercepts the authentication request and makes the Passport authentication call
const auth = () => {
return (req, res, next) => {
  console.log("requête d'authentification reçue dans auth :");
  console.log(req.body);
  var username;
  var userID;
  passport.authenticate('local', (error, user, info) => {
    console.log("utilisateur :");
    console.log(user);
    console.log(info);
    // if Passport catches an error
    if(error) res.status(400).json({"statusCode" : 200, "message" : error});
    // if a user is found
    else if(user){
      con.query("SELECT * FROM Student WHERE Email = '"+user+"'", function (err, result, fields) {
        if (err) throw err;
        username = result[0].Username;
        userID = result[0].StudentID;
        const token = jwt.sign({ userID }, jwtKey, {algorithm: "HS256",expiresIn:'1h'});
        res.status(200).json({"token" : token, "username" : username});
      });
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

    con.query("SELECT * FROM Student WHERE Username = '"+username+"' OR Email = '"+email+"'", function (err, result, fields) {
      if (err) throw err;
      if(result.length!=0){
        console.log("username or email already exists")
        res.status(401).json({"message" : "username or password already exists"});
      }
      else{
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
                con.query("INSERT INTO Student (Username,Password,Email,Name,Surname) VALUES ('"+username+"','"+hash+"','"+email+"','"+last_name+"','"+first_name+"')", function (err, result, fields){
                  if (err) {
                    throw err;
                  }
                  var userID = result.insertId;
                  const token = jwt.sign({ userID }, jwtKey, {algorithm: "HS256",expiresIn:'1h'});
                  res.status(200).json({"token" : token, "username" : username});
                });
              }
            })
          }
        });
      }
    });


  }}

// requête http POST pour se créer un compte
app.post('/register/', register(), (req, res) => {
  console.log("requête de création de compte reçue");
  console.log(req.body);
  res.status(200).json({"statusCode" : 200, "message" : "hello"});
});

// requête http GET pour se déconnecter
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
app.post('/addPost',tokenValidator,(req, res, next) => {
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

  var titreEchape = addslashes(req.body.title); //échappe les caractères spéciaux, évite les erreurs dans la BD
  var descriptionEchape = addslashes(req.body.description);

  con.query("SELECT StudentID FROM Student WHERE Username = '"+req.body.username+"'", function(err, result, fields){
    if(err) throw err;
    con.query("INSERT INTO Announce (Title, Price, Description, StudentID, PublicationDate, NbViews) VALUES ('"+titreEchape+"','"+req.body.price+"','"+descriptionEchape+"','"+result[0].StudentID+"','"+today+"', '"+0+"')",
    function (err, result, fields){
      if (err) throw err;
      console.log(result.insertId);
      var postID = result.insertId;
      res.status(201).json({  //statut "ressource créée"
      message: 'objet créé', postID: postID
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
})


// requête http GET pour afficher une annonce spécifique
app.get('/getPost/:id', (req, res, next) => {
  console.log("id de l'annonce demandée : ", req.params.id);
  console.log("req.params :",req.params);
  con.query("SELECT * FROM Announce INNER JOIN Student ON Announce.StudentID = Student.StudentID INNER JOIN AnnounceCategories ON Announce.AnnounceID = AnnounceCategories.AnnounceID WHERE Announce.AnnounceID = '"+req.params.id+"'", function (err, result, fields) {
    if (err) throw err;
    var resultat=[];
    var categoryids=[];
    let j=0; //on travail avec deux pointeurs : i et j
    for (let i=0; i<result.length; i++){

      if (i==0){
        categoryids[0]=result[i].CategoryID;
        resultat[j]={"AnnounceID" : result[i].AnnounceID,
                   "Titre" : result[i].Title,
                   "Prix" : result[i].Price,
                   "Description" : result[i].Description,
                   "StudentID" : result[i].StudentID,
                   "Date de publication" : result[i].PublicationDate,
                   "Nombre de vues" : result[i].NbViews,
                   "Username" : result[i].Username,
                   "N° de telephone" : result[i].TelephoneNumber,
                   "Image" : result[i].Image,
                   "Adresse" : result[i].Address,
                   "categoryids" : categoryids,
                 }
      }

      else{
        if (result[i].AnnounceID == result[i-1].AnnounceID){//si on a une deuxième même annonce pour une autre categorie
          resultat[j].categoryids.push(result[i].CategoryID)
        }
        else{
          j+=1;
          categoryids=[];
          categoryids[0]=result[i].CategoryID;
          resultat[j]={"AnnounceID" : result[i].AnnounceID,
                     "Titre" : result[i].Title,
                     "Prix" : result[i].Price,
                     "Description" : result[i].Description,
                     "StudentID" : result[i].StudentID,
                     "Date de publication" : result[i].PublicationDate,
                     "Nombre de vues" : result[i].NbViews,
                     "Username" : result[i].Username,
                     "N° de telephone" : result[i].TelephoneNumber,
                     "Image" : result[i].Image,
                     "Adresse" : result[i].Address,
                     "categoryids" : categoryids,
                   }
        }
      }
    }
    res.status(200).json({"annonces" : resultat});
    console.log("resultat :", resultat);
  });
});

// requête http GET pour afficher toutes les annonces
app.get('/posts', (req, res, next) => {
  console.log("requête d'affichage de toutes les annonces reçue :")
  con.query("SELECT * FROM Announce INNER JOIN Student ON Announce.StudentID = Student.StudentID INNER JOIN AnnounceCategories ON Announce.AnnounceID = AnnounceCategories.AnnounceID ORDER BY Announce.AnnounceID", function (err, result, fields) {
    if (err) throw err;

    /*l'idée est de mettre l'info utilisable dans resultat si l'annonce d'avant n'a pas le meme announceID (ORDER BY important)
    si l'announce suivante a le meme numéro(mais elle aura un CatID différent), on ne rajoute pas l'annonce dans resultat mais on push dans le tableau
    de sa categorie le catID de l'annonce suivante. On a ainsi pas d'annonces en double et un tableau de catID correct*/
    var resultat=[];
    var categoryids=[];
    let j=0; //on travail avec deux pointeurs : i et j
    for (let i=0; i<result.length; i++){

      if (i==0){
        categoryids[0]=result[i].CategoryID;
        resultat[j]={"AnnounceID" : result[i].AnnounceID,
                   "Titre" : result[i].Title,
                   "Prix" : result[i].Price,
                   "Description" : result[i].Description,
                   "StudentID" : result[i].StudentID,
                   "Date de publication" : result[i].PublicationDate,
                   "Nombre de vues" : result[i].NbViews,
                   "Username" : result[i].Username,
                   "N° de telephone" : result[i].TelephoneNumber,
                   "Image" : result[i].Image,
                   "Adresse" : result[i].Address,
                   "categoryids" : categoryids,
                 }
      }

      else{
        if (result[i].AnnounceID == result[i-1].AnnounceID){//si on a une deuxième même annonce pour une autre categorie
          resultat[j].categoryids.push(result[i].CategoryID)
        }
        else{
          j+=1;
          categoryids=[];
          categoryids[0]=result[i].CategoryID;
          resultat[j]={"AnnounceID" : result[i].AnnounceID,
                     "Titre" : result[i].Title,
                     "Prix" : result[i].Price,
                     "Description" : result[i].Description,
                     "StudentID" : result[i].StudentID,
                     "Date de publication" : result[i].PublicationDate,
                     "Nombre de vues" : result[i].NbViews,
                     "Username" : result[i].Username,
                     "N° de telephone" : result[i].TelephoneNumber,
                     "Image" : result[i].Image,
                     "Adresse" : result[i].Address,
                     "categoryids" : categoryids,
                   }
        }
      }
    }
    res.status(200).json({"annonces" : resultat});
    console.log("resultat :", resultat);
  });
});

// requête http POST pour faire une recherche par mot-clé
app.post('/search', (req, res, next) => {
  console.log("requête de recherche reçue :")
  console.log("mots-clé :");
  console.log(req.body.arg);
  var arg = req.body.arg.replace('\'', ' ');
  arg = arg.replace(',', ' ');
  arg = arg.replace(', ', ' ');
  arg = arg.replace('.', ' ');
  var separators = [' ', '+', '(', ')', '*', '\\/', ':', '?', '-'];
  var keywords = arg.split(new RegExp('[' + separators.join('') + ']', 'g'));
  keywords.forEach(function(item, index){
    if(item.length<3){
      keywords.splice(index, 1)
    }
  })
  console.log(keywords);

// récupérer le username du vendeur à partir du StudentID

});

// requête http PATCH pour incrémenter le nombre de vues d'une annonce
app.patch('/incrview', (req, res, next) => {
  console.log("requête pour incrémenter le nombre de vues");
  console.log(req.body.id);
  con.query("UPDATE Announce SET NbViews = NbViews+'"+1+"' WHERE StudentID = '"+req.body.id+"'", function (err, result, fields) {
    if (err) throw err;
    res.status(200).json({"message":"ok"});
  });
})


/***************************************************************************************************
* Fin des requêtes concernant les annonces - Début des requêtes concernant un profil d'utilisateur *
* *************************************************************************************************/

// requête pour récupérer toutes les infos d'un utilisateur
app.get('/getUserInfo', (req, res, next) => {
  var encryptedToken = req.get("Authorization");  // get authorization token from http header
  var decodedToken = jwt.decode(encryptedToken); // decode token
  var userID = decodedToken.userID; // get userID from token payload
  console.log("Requête des infos d'utilisateur reçue.");
  con.query("SELECT * FROM Student WHERE StudentID = '"+userID+"'", function (err, result, fields) {
    if (err) throw err;
    var user = {"first_name" : result[0].Surname,
                "last_name" : result[0].Name,
                "username" : result[0].Username,
                "email" : result[0].Email,
                "phone_number" : result[0].TelephoneNumber,
                "contact_info" : result[0].Address
              }
    console.log("Envoi des données au front :");
    console.log(user);
    res.status(200).json(user);
  });
})

// requête pour modifier des infos d'un utilisateur
app.post('/modifyUserInfo', (req, res, next) => {
  console.log("requête de modification des infos d'utilisateur reçue :");
  var encryptedToken = req.get("Authorization");  // get authorization token from http header
  var decodedToken = jwt.decode(encryptedToken); // decode token
  var userID = decodedToken.userID; // get userID from token payload

  //vérification si le username n'est pas déjà utilisé ou l'email
  con.query("SELECT * FROM Student WHERE (Username = '"+req.params.username+"' OR Email = '"+req.params.email+"') AND StudentID != '"+userID+"'", function (err, result, fields) {
    if (err) throw err;
    if(result.length!=0){
      console.log("username or email already exists")
      res.status(401).json({"message" : "username or password already exists"});
    } else {
      //modification avec le nouveau mot de passe crypté
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          throw err
        } else {
          bcrypt.hash(req.body.password, salt, function(err, hash) {
            if (err) {
              throw err
            } else {
              console.log(hash)
              //mise à jour de la base de données
              con.query("UPDATE Student SET Username = '"+req.params.username+"', Email ='"+req.params.email+"', Name='"+req.params.lastname+"', Surname='"+req.params.firstname+"', Password='"+hash+"' WHERE StudentID = '"+userID+"'", function (err, result, fields) {
                if (err) {
                  throw err;
                }
                res.status(200).json({"username" : req.params.username});
              });
            }
          })
        }
      });
    }
  })
})

// requête pour récupérer toutes les annonces postées par un utilisateur
app.get('/getUserPosts', (req, res, next) => {
  console.log("requête pour les annonces d'un utilisateur reçue :");
   var encryptedToken = req.get("Authorization");  // get authorization token from http header
   var decodedToken = jwt.decode(encryptedToken); // decode token
   var userID = decodedToken.userID; // get userID from token payload

   con.query("SELECT * FROM Announce WHERE StudentID='"+userID+"'", function (err, result, fields) {
    if (err) throw err;
    //var data = JSON.stringify(result);
    var data = result;
    var posts = [];
    for(var i in data){
        posts.push({'_id': data[i].AnnounceID, 'title': data[i].Title, 'description': data[i].Description, 'category': attributeCategory(data[i].CategoryID), 'price': data[i].Price, 'urls': null, 'date': data[i].PublicationDate, 'views': data[i].NbViews, 'username': ''});
    }
    console.log(posts);
    res.status(200).json(posts);
  });
})

// requête pour supprimer un compte d'utilisateur
app.post('/deleteUserAccount', (req, res, next) => {
  console.log("requête pour supprimer un compte utilisateur reçue");
  console.log(req.headers);
  var encryptedToken = req.get("Authorization");  // get authorization token from http header
  var decodedToken = jwt.decode(encryptedToken); // decode token
  console.log(decodedToken);
  var userID = decodedToken.userID; // get userID from token payload
  var password = req.body.password;
  console.log(userID);
  console.log(password);
  // vérifier le mot de passe
  // s'il est bon, supprimer le compte
  // sinon, annuler
  con.query("SELECT Password FROM Student where StudentID = '"+userID+"'", function (err, result, fields){
    if (err) {
      throw err;
    } else {
      /*var string = JSON.stringify(result); //convertit le result en JSON
      console.log(string);
      var json = JSON.parse(string); //sépare les éléments du JSON
      console.log(json);
      console.log("selection : ", json[0].Password);*/
      var motdepasse = json[0].Password;
      bcrypt.compare (password, motdepasse, function(err, isMatch){
        if (err) {
          throw err;
        } else if (!isMatch){
          console.log("The password doesn't match!");
          res.status(400).json({"statusCode" : 400, "message" : "incorrect password"});
          // return done("Incorrect Email/Password credentials", false);
        } else {
          console.log("Correct password");
          con.query("DELETE FROM Announce WHERE StudentID = '"+userID+"'", function(err, result, fields){
            if(err) throw err;
            con.query("DELETE FROM Student WHERE StudentID = '"+userID+"'", function (err, result, fields){
              if(err) throw err;
              res.status(200).json({"message": "account was deleted"});
            });
          })
        }
      })
    }
  });

})


app.use((req, res, next) => {
 console.log("coucou");
 res.json({message:'coucou'});
});

module.exports = app;
