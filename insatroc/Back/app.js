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

const app = express();

/*Cette fonction attribue à chaque catégorie son identifiant*/
function attributeID(category){
  var categoryID;

  switch (category){
    case " Chambre":
    categoryID = 1;
    break;

    case " Cuisine":
    categoryID = 2;
    break;

    case " Salle de bain":
    categoryID = 3;
    break;

    case " Bureau":
    categoryID = 4;
    break;

    case " Loisirs/Sport":
    categoryID = 5;
    break;

    case " Autre":
    categoryID = 6;
    break;
    }
  return categoryID;
}
function attributeCategory(categoryID){
  var category = [];

  for(let i in categoryID){
    switch (categoryID[i]){
      case 1:
      category.push(" Chambre");
      break;

      case 2:
      category.push(" Cuisine");
      break;

      case 3:
      category.push(" Salle de bain");
      break;

      case 4:
      category.push(" Bureau");
      break;

      case 5:
      category.push(" Loisirs/Sport");
      break;

      case 6:
      category.push(" Autre");
      break;
      }
  }
  return category;
}

/*Récupération du nom d'utilisateur à partir du StudentID*/
function getUsernameFromID(studentID){
  con.query("SELECT Username FROM Student WHERE StudentID = '"+studentID+"'", function(err, result, fields){
    if(err) throw err;
    return result;
  })
}

/*fonction pour échapper les apostrophes qui créaient des erreurs lors de la saisie côté front*/
function addslashes(ch) {
  ch = ch.replace(/\\/g,"\\\\");
  ch = ch.replace(/\'/g,"\\'");
  ch = ch.replace(/\"/g,"\\\"");
  return ch;
}

/*ajout de header permettant la communication entre les deux serveurs*/
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json({limit:'10mb'}));//formate en JSON les données pour n'importe quelle route



/*********************************
 * Passport
 * ******************************/

/*Définition de la stratégie passport*/
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

    con.query("SELECT * FROM Student WHERE Username = '"+username+"' OR Email = '"+email+"'", function (err, result, fields) {
      if (err) throw err;
      if(result.length!=0){
        console.log("username or email already exists");
        res.status(401).json({"message" : "username or password already exists"});
      }
      else{
        //création de l'utilisateur avec mot de passe crypté
        bcrypt.genSalt(saltRounds, function (err, salt) {
          if (err) {
            throw err
          } else {
            bcrypt.hash(req.body.password, salt, function(err, hashp) {
              if (err) {
                throw err
              } else {
                bcrypt.genSalt(saltRounds, function (err, salt1) {
                  if (err) {
                    throw err
                  } else {
                    bcrypt.hash(req.body.answer1, salt1, function(err, hash1) {
                      if (err) {
                        throw err
                      } else {
                        bcrypt.genSalt(saltRounds, function (err, salt2) {
                          if (err) {
                            throw err
                          } else {
                            bcrypt.hash(req.body.answer2, salt2, function(err, hash2) {
                              if (err) {
                                throw err
                              } else {
                                con.query("INSERT INTO Student (Username,Password,Email,Name,Surname,Question1,Answer1,Question2,Answer2) VALUES ('"+username+"','"+hashp+"','"+email+"','"+last_name+"','"+first_name+"','"+req.body.question1+"','"+hash1+"','"+req.body.question2+"','"+hash2+"')", function (err, result, fields){
                                  if (err) {
                                    throw err;
                                  }
                                  var userID = result.insertId;
                                  const token = jwt.sign({ userID }, jwtKey, {algorithm: "HS256",expiresIn:'1h'});
                                  res.status(200).json({"token" : token, "username" : username});
                                });
                              }
                            });
                          }
                        });
                        
                      }    
                
                    });
                  }
                })
              }
            });
          }
        });
      }

    });
  }
}    

// requête http POST pour se créer un compte
app.post('/register/', register(), (req, res) => {
  console.log("requête de création de compte reçue");
  console.log(req.body);
  res.status(200).json({"statusCode" : 200, "message" : "requête reçue"});
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
  //console.log(req.body);  //affiche les éléments de la requête

  var catID=[];
  for (let i=0; i< req.body.category.length; i++){
    var objet = req.body.category[i];
    catID[i] = attributeID(objet.toString()); //conversion de l'objet en string
  }

  var today = new Date(); //formater la date
  var seconds = String(today.getSeconds()).padStart(2, '0');
  var minutes = String(today.getMinutes()).padStart(2, '0');
  var hour = String(today.getHours()).padStart(2, '0');
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = String(today.getFullYear());


  today = yyyy + '-' + mm + '-' + dd + '/' + hour + ':' + minutes + ':' + seconds;

  var titreEchape = addslashes(req.body.title); //échappe les caractères spéciaux, évite les erreurs dans la BD
  var descriptionEchape = addslashes(req.body.description);

  con.query("SELECT * FROM Student WHERE Username = '"+req.body.username+"'", function(err, result, fields){
    if(err) throw err;
    var studentPhoneNb = result[0].TelephoneNumber;
    var studentContact = result[0].Address;
    con.query("INSERT INTO Announce (Title, Price, Description, StudentID, PublicationDate, NbViews) VALUES ('"+titreEchape+"','"+req.body.price+"','"+descriptionEchape+"','"+result[0].StudentID+"','"+today+"', '"+0+"')",
    function (err, result, fields){
      if (err) throw err;
      var postID = result.insertId;
      res.status(201).json({message: 'objet créé', postID: postID, phoneNb: studentPhoneNb, contact: studentContact});
      for (let i=0; i<req.body.category.length; i++){
        con.query("INSERT INTO AnnounceCategories (CategoryID, AnnounceID) VALUES ('"+catID[i]+"','"+result.insertId+"')",
          function (err, result, fields){
            if (err) throw err;
            console.log(result);
        });
      }

      for(let k= 0 ; k<req.body.urls.length ; k++){
        con.query("INSERT INTO Image (ImageString, AnnounceID) VALUES ('"+req.body.urls[k]+"','"+result.insertId+"')"),
          function(err,result, blabla){
            if(err){
              throw err;
            }else{
              console.log(result);
            }
          }
      }
    });
  });
})


// requête http GET pour afficher une annonce spécifique
app.get('/getPost/:id', (req, res, next) => {
  //on reçoit un id d'annonce et on l'envoi au front
  console.log("id de l'annonce demandée : ", req.params.id);
  console.log("req.params :",req.params);
  //on join toutes les tables utiles, ce qui créer un result assez conséquent. On tri pour envoyer les infos utiles au front
  con.query("SELECT * FROM Announce INNER JOIN Student ON Announce.StudentID = Student.StudentID INNER JOIN AnnounceCategories ON Announce.AnnounceID = AnnounceCategories.AnnounceID WHERE Announce.AnnounceID = '"+req.params.id+"'", function (err, result, fields) {
    if (err) throw err;
    //explication des boucles sur getAllPosts
    var resultat=[];
    var categoryids=[];
    let j=0;
    for (let i=0; i<result.length; i++){

      if (i==0){
        categoryids[0]=result[i].CategoryID;
        resultat[j]={"AnnounceID" : result[i].AnnounceID,
                   "Titre" : result[i].Title,
                   "Prix" : result[i].Price,
                   "Description" : result[i].Description,
                   "StudentID" : result[i].StudentID,
                   "DateDePublication" : result[i].PublicationDate,
                   "NombreDeVues" : result[i].NbViews,
                   "Username" : result[i].Username,
                   "NumTelephone" : result[i].TelephoneNumber,
                   "Image" : result[i].Image,
                   "Adresse" : result[i].Address,
                   "categoryids" : categoryids,
                 }
      }

      else{
        if (result[i].AnnounceID == result[i-1].AnnounceID){
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
                     "DateDePublication" : result[i].PublicationDate,
                     "NombreDeVues" : result[i].NbViews,
                     "Username" : result[i].Username,
                     "NumTelephone" : result[i].TelephoneNumber,
                     "Image" : result[i].Image,
                     "Adresse" : result[i].Address,
                     "categoryids" : categoryids,
                   }
        }
      }
    }
    for(let i=0; i<resultat.length; i++){ //permet d'envoyer au front les noms des catégories, ça leur évite de convertir dans le front
      resultat[i].categoryids = attributeCategory(resultat[i].categoryids);
    }
    res.status(200).json(resultat);
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
    de sa categorie le catID de l'annonce suivante. On a ainsi pas d'annonces en "double" et un tableau de catID correct*/
    var resultat=[];
    var categoryids=[];
    let j=0; //on travail avec deux pointeurs : i et j
    for (let i=0; i<result.length; i++){


      var urls = [];
      //console.log(result[i].ImageString) //undefined parce que la requête est faite en deux fois : les annonces puis les images. Lors de la demande
      //des annonces ce champ est donc undefined

      if (i==0){
        categoryids[0]=result[i].CategoryID;
        resultat[j]={"AnnounceID" : result[i].AnnounceID,
                   "Titre" : result[i].Title,
                   "Prix" : result[i].Price,
                   "Description" : result[i].Description,
                   "StudentID" : result[i].StudentID,
                   "DateDePublication" : result[i].PublicationDate,
                   "NombreDeVues" : result[i].NbViews,
                   "urls":result[i].ImageString,
                   "Username" : result[i].Username,
                   "NumTelephone" : result[i].TelephoneNumber,
                   "Image" : result[i].Image,
                   "Adresse" : result[i].Address,
                   "categoryids" : categoryids,
                 }
      }

      else{
        if (result[i].AnnounceID == result[i-1].AnnounceID){//si on a une deuxième même annonce pour une autre categorie, on push sa catégorie dans l'annonce précedente
          resultat[j].categoryids.push(result[i].CategoryID)
        }
        else{//si les numéros d'annonces ne sont pas les mêmes, c'est une autre annonce. On passe donc à l'annonce suivante que l'on rajoute dans resultat
          j+=1;
          categoryids=[];
          categoryids[0]=result[i].CategoryID;
          resultat[j]={"AnnounceID" : result[i].AnnounceID,
                     "Titre" : result[i].Title,
                     "Prix" : result[i].Price,
                     "Description" : result[i].Description,
                     "StudentID" : result[i].StudentID,
                     "DateDePublication" : result[i].PublicationDate,
                     "NombreDeVues" : result[i].NbViews,
                     "Username" : result[i].Username,
                     "NumTelephone" : result[i].TelephoneNumber,
                     "Image" : result[i].Image,
                     "Adresse" : result[i].Address,
                     "categoryids" : categoryids,
                   }
        }
      }
    }
    for(let i=0; i<resultat.length; i++){
      resultat[i].categoryids = attributeCategory(resultat[i].categoryids);
    }
    res.status(200).json(resultat);
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
  var split_regex = new RegExp('[ \ªº!@·#$~%&¬=¿¡_<>{}+()*/:?"-]', 'g');   //on applique un premier filtrage pour enlever ces caractères spéciaux
  var req_filt_str = arg.split(split_regex)
                      .filter(kw => kw.length > 2) //filtre pour enlever les mots de moins de 3 lettres
                      .map(kw => 'INSTR(Announce.Title,"' + kw + '") > 0 OR INSTR(Announce.Description,"' + kw + '") > 0')  
                      .join(" OR ");
  if(req_filt_str == []){  //si on a rien comme résultat on ne renvoit rien
    res.status(200).json([]);
  } else {
    con.query("SELECT * FROM Announce INNER JOIN Student ON Announce.StudentID = Student.StudentID INNER JOIN AnnounceCategories ON Announce.AnnounceID = AnnounceCategories.AnnounceID WHERE "+req_filt_str, function(err,result){
      if(err) throw err;

      var resultat=[];
      var categoryids=[];
      let j=0;
      for (let i=0; i<result.length; i++){
        if (i==0){
            categoryids[0]=result[i].CategoryID;
            resultat[j]={"AnnounceID" : result[i].AnnounceID,
                    "Titre" : result[i].Title,
                    "Prix" : result[i].Price,
                    "Description" : result[i].Description,
                    "StudentID" : result[i].StudentID,
                    "DateDePublication" : result[i].PublicationDate,
                    "NombreDeVues" : result[i].NbViews,
                    "Username" : result[i].Username,
                    "NumTelephone" : result[i].TelephoneNumber,
                    "Image" : result[i].Image,
                    "Adresse" : result[i].Address,
                    "categoryids" : categoryids,
            }
          }
        else {
          if (result[i].AnnounceID == result[i-1].AnnounceID){
              resultat[j].categoryids.push(result[i].CategoryID)
          }
          else {
              j+=1;
              categoryids=[];
              categoryids[0]=result[i].CategoryID;
              resultat[j]={"AnnounceID" : result[i].AnnounceID,
                          "Titre" : result[i].Title,
                          "Prix" : result[i].Price,
                          "Description" : result[i].Description,
                          "StudentID" : result[i].StudentID,
                          "DateDePublication" : result[i].PublicationDate,
                          "NombreDeVues" : result[i].NbViews,
                          "Username" : result[i].Username,
                          "NumTelephone" : result[i].TelephoneNumber,
                          "Image" : result[i].Image,
                          "Adresse" : result[i].Address,
                          "categoryids" : categoryids,
                          }
          }
        }
      }
      for(let i=0; i<resultat.length; i++){
        resultat[i].categoryids = attributeCategory(resultat[i].categoryids);
      }
      res.status(200).json(resultat);
      console.log("resultat :", resultat);
    });
  }
});

app.post('/deletePost/', (req, res, next) => {
  //supprime une annonce
  console.log("requête pour supprimer une annonce reçue");
  var encryptedToken = req.get("Authorization");  // get authorization token from http header
  var decodedToken = jwt.decode(encryptedToken); // decode token
  var userID = decodedToken.userID; // get userID from token payload
  con.query("SELECT StudentID FROM Announce WHERE AnnounceID = '"+req.body.postID+"'", function(err, result, fields) {
    if(err) throw err;
    if(userID == result[0].StudentID){ // vérifier que le username de l'en-tête http et de l'annonce sont identiques
      con.query("DELETE FROM Image WHERE AnnounceID = '"+req.body.postID+"'", function(err, result, fields) {//par soucis de clef primaire, il faut d'abord supprimer l'image, puis les catégories et enfin l'annonce
        if(err) throw err;
        con.query("DELETE FROM AnnounceCategories WHERE AnnounceID = '"+req.body.postID+"'", function(err, result, fields) {
          if(err) throw err;
            con.query("DELETE FROM Announce WHERE AnnounceID = '"+req.body.postID+"'", function(err, result, fields) {
              if(err) throw err;
              res.status(200).json({"message" : "annonce supprimée"});
            })
        })
      })
    }
  });
})

// requête http PATCH pour incrémenter le nombre de vues d'une annonce
app.patch('/incrview', (req, res, next) => {
  console.log("requête pour incrémenter le nombre de vues");
  console.log(req.get("Authorization"));
  if(req.get("Authorization")!=undefined){
    var encryptedToken = req.get("Authorization");  // get authorization token from http header
    var decodedToken = jwt.decode(encryptedToken); // decode token
    var userID = decodedToken.userID; // get userID from token payload
    con.query("UPDATE Announce SET NbViews = NbViews+1 WHERE AnnounceID = '"+req.body.id+"' AND StudentID !='"+userID+"'", function (err, result, fields) {
      if (err) throw err;
      console.log("annonce incrémentée");
      res.status(200).json({"message":"ok"});
    });
  }
  else{
    con.query("UPDATE Announce SET NbViews = NbViews+1 WHERE AnnounceID = '"+req.body.id+"'", function (err, result, fields) {
      if (err) throw err;
      console.log("annonce incrémentée");
      res.status(200).json({"message":"ok"});
    });
  }


});

// requête pour obtenir les images des annonces, elle est appelée en parallèle lors des getPost, getAllPosts, etc... pour aller chercher les images des annonces.
//ces images sont envoyées une par une en identifiant l'announceID qui est envoyé du front et envoie toutes les images de l'annonce correspondante
app.get('/images',(req,ress,nex)=>{
  var id = req.query.bid
  con.query("SELECT ImageString FROM Image WHERE AnnounceID = '"+id+"'",function(err,res,field){
    var urls = [];
    for(let k =0;k<res.length;k++){
      urls.push(res[k].ImageString)
    }
    console.log(urls.length);
    ress.status(200).json({[id]:urls});
  })
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
    var tel = result[0].TelephoneNumber;
    if(tel==null){tel = ''}
    var contact = result[0].Address;
    if(contact==null){contact=''}
    var user = {"first_name" : result[0].Surname,
                "last_name" : result[0].Name,
                "username" : result[0].Username,
                "email" : result[0].Email,
                "phone_number" : tel,
                "contact_info" : contact
              }
    console.log("L'utilisateur suivant a été créé :");
    console.log(user);
    res.status(200).json(user);
  });
});

// requête pour vérifier si les infos de contact d'un utilisateur sont bien remplies
app.get('/checkUserContactInfo', (req, res, next) => {
  console.log("vérification des infos de contact");
  var encryptedToken = req.get("Authorization");  // get authorization token from http header
  var decodedToken = jwt.decode(encryptedToken); // decode token
  var userID = decodedToken.userID; // get userID from token payload
  con.query("SELECT * FROM Student WHERE StudentID='"+userID+"'", function(err, result, fields){
    if(err) throw err;
    console.log(result);
    if((result[0].Address=='' || result[0].Address==null)
     && (result[0].TelephoneNumber=='' || result[0].TelephoneNumber==null)){
       console.log("false");
      res.status(400).json(false);
    }
    else{
      console.log("true");
      res.status(200).json(true);
    }
  })
})

// requête pour modifier des infos d'un utilisateur
app.post('/modifyUserInfo', (req, res, next) => {
  console.log("requête de modification des infos d'utilisateur reçue :");
  var encryptedToken = req.get("Authorization");
  var decodedToken = jwt.decode(encryptedToken);
  var userID = decodedToken.userID;
  console.log("params:",req.body);

  //vérification que le username n'existe pas déjà
  con.query("SELECT * FROM Student WHERE Username='"+req.body.username+"'",function(err,result,fields){
    if(err) throw err;
    if (result.length !=0 && result[0].StudentID!=userID){ //si déjà présent, erreur
      console.log("username already exists")
      res.status(401).json({"message" : "username already exists"});
    } else { //sinon, mise à jour de la base de
      //cryptage des réponses aux questions secrètes
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          throw err
        } else {
          bcrypt.hash(req.body.answer1, salt, function(err, hash1) {
            if (err) throw err;
            bcrypt.hash(req.body.answer2, salt, function(err,hash2) {
              if (err) throw err;
              //Mise à jour BD
              //console.log("id question 1 :",req.body.question1);
              //console.log("id question 2 :",req.body.question2);
              con.query("UPDATE Student SET Username='"+req.body.username+"', Name='"+req.body.firstname+"', TelephoneNumber='"+req.body.phone+"', Address='"+req.body.other+"', Surname='"+req.body.lastname+"', Question1='"+req.body.question1+"', Question2='"+req.body.question2+"', Answer1='"+hash1+"', Answer2='"+hash2+"'  WHERE StudentID='"+userID+"'",function (err, result, fields) {
                if (err) throw err;
                console.log("done");
                res.status(200).json({"Firstname":req.body.firstname,"Lastname":req.body.lastname,"Username":req.body.username,"Phone":req.body.phone,"Other":req.body.other});
              });
            })
          });
        }
      });
    }
  });
});

// requête pour récupérer toutes les annonces postées par un utilisateur
app.get('/getUserPosts', (req, res, next) => {
  console.log("requête pour les annonces d'un utilisateur reçue :");
   var encryptedToken = req.get("Authorization");
   var decodedToken = jwt.decode(encryptedToken);
   var userID = decodedToken.userID;

   con.query("SELECT * FROM Announce INNER JOIN Student ON Announce.StudentID = Student.StudentID INNER JOIN AnnounceCategories ON Announce.AnnounceID = AnnounceCategories.AnnounceID WHERE Announce.StudentID='"+userID+"' ORDER BY Announce.AnnounceID", function (err, result, fields) {
    if (err) throw err;

    var resultat=[];
    var categoryids=[];
    let j=0;
    for (let i=0; i<result.length; i++){

      if (i==0){
        categoryids[0]=result[i].CategoryID;
        resultat[j]={"AnnounceID" : result[i].AnnounceID,
                   "Titre" : result[i].Title,
                   "Prix" : result[i].Price,
                   "Description" : result[i].Description,
                   "StudentID" : result[i].StudentID,
                   "DateDePublication" : result[i].PublicationDate,
                   "NombreDeVues" : result[i].NbViews,
                   "Username" : result[i].Username,
                   "NumTelephone" : result[i].TelephoneNumber,
                   "Image" : result[i].Image,
                   "Adresse" : result[i].Address,
                   "categoryids" : categoryids,
                 }
      }

      else{
        if (result[i].AnnounceID == result[i-1].AnnounceID){
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
                     "DateDePublication" : result[i].PublicationDate,
                     "NombreDeVues" : result[i].NbViews,
                     "Username" : result[i].Username,
                     "NumTelephone" : result[i].TelephoneNumber,
                     "Image" : result[i].Image,
                     "Adresse" : result[i].Address,
                     "categoryids" : categoryids,
                   }
        }
      }
    }
    for(let i=0; i<resultat.length; i++){
      resultat[i].categoryids = attributeCategory(resultat[i].categoryids);
    }
    res.status(200).json(resultat);
    console.log("resultat :", resultat);
    });
});

// requête pour supprimer un compte d'utilisateur
app.post('/deleteUserAccount', (req, res, next) => {
  console.log("requête pour supprimer un compte utilisateur reçue");
  console.log(req.headers);
  var encryptedToken = req.get("Authorization");
  var decodedToken = jwt.decode(encryptedToken);
  console.log(decodedToken);
  var userID = decodedToken.userID;
  var password = req.body.password;
  console.log(userID);
  console.log(password);
  con.query("SELECT Password FROM Student where StudentID = '"+userID+"'", function (err, result, fields){
    if (err) {
      throw err;
    } else {
      var motdepasse = result[0].Password;
      bcrypt.compare (password, motdepasse, function(err, isMatch){
        if (err) {
          throw err;
        } else if (!isMatch){
          console.log("The password doesn't match!");
          res.status(400).json({"statusCode" : 400, "message" : "incorrect password"});
        } else {
          console.log("Correct password");

          con.query("SELECT AnnounceID FROM Announce WHERE StudentID = '"+userID+"'", function(err,result,fields){
            if(err) throw err;
            console.log("annonces : ", result);
            for (let i=0; i<result.length; i++){ //idem, on doit d'abord supprimer les catégories, puis les image et enfin les annonces avant de supprimer le compte
              con.query("DELETE FROM AnnounceCategories WHERE AnnounceID = '"+result[i].AnnounceID+"'", function(err,result,fields){
                if(err) throw err;
              });
              con.query("DELETE FROM Image WHERE AnnounceID = '"+result[i].AnnounceID+"'", function(err,result,fields){
                if(err) throw err;
              });
            }
            con.query("DELETE FROM Announce WHERE StudentID = '"+userID+"'", function(err, result, fields){
              if(err) throw err;
              con.query("DELETE FROM Student WHERE StudentID = '"+userID+"'", function (err, result, fields){
                if(err) throw err;
                res.status(200).json({"message": "account was deleted"});
                console.log("account was deleted");
              });
            });
          });
        }
      })
    }
  });

});


//requête pour modifier le mot de passe
app.post('/modifyPassword', (req, res,next) =>{
  console.log("requête pour changer le password d'un utilisateur reçue :");
  var encryptedToken = req.get("Authorization");
  var decodedToken = jwt.decode(encryptedToken);
  var userID = decodedToken.userID;

  con.query("SELECT Password FROM Student where StudentID = '"+userID+ "'",function (err, result, fields) {
      if (err) {
          throw err;
      } else {
          var password = result[0].Password;
          bcrypt.compare (req.body.oldPassword, password, function(err, isMatch){
              if (err) {
                  throw err;
              } else if (!isMatch){
                  console.log("The password doesn't match!");
                  res.status(401).json({"message" : "Incorrect Password"});
              } else {
                  console.log("Correct password");
                  bcrypt.genSalt(saltRounds, function (err, salt) {
                      if (err) {
                          throw err
                      } else {
                          bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
                              if (err) {
                                  throw err
                              } else {
                                  console.log(hash)
                                  con.query("UPDATE Student SET Password='"+hash+"' WHERE StudentID = '"+userID+"'", function (err, result, fields) {
                                      if(err){
                                          throw err;
                                      }
                                      res.status(200).json({"message": "Password successfully changed"});
                                  });
                              }
                          })
                      }
                  });
              }
          });
      }
  });
});

//requête pour mdp oublié
//cette requête est en 3 étapes séparées en 3 fonctions : l'user rentrer son email -> on vérifie l'email et on redirige vers ses questions
//l'user rentre ses réponse -> on les vérifie et l'incite à saisir un nouveau mdp si elles sont bonnes
//l'user rentrer son nouveau mdp -> on l'enregistre dans la BD

app.post('/getUserSecretQuestions', (req, res, next)=> {
  console.log("requête de demande de mdp oublié reçue");
  //on reçoit l'email utilisateur, renvoi les IDs des questions posées lors de la création du compte
  con.query("SELECT * FROM Student WHERE Email = '"+req.body.email+"'", function (err, result, fields){
    if (err) throw err;
    if (result.length == 0){
      console.log("email introuvable");
      res.status(400).json({"message" : "Email introuvable"});
    }else{
      var questions=[];
      questions.push(result[0].Question1, result[0].Question2);
      console.log("id des questions : ", questions);
      res.status(200).json({"ID1" : questions[0],
                            "ID2" : questions[1],})
    }
  });
});

app.post('/forgotPassword', (req, res, next)=> {
  //on vérifie les réponses
  console.log("Requête d'oubli de mot de passe envoyée");
  con.query("SELECT Answer1,Answer2 FROM Student WHERE Email='"+req.body.email+"'", function(err,result, fields){
    if (err) throw err;
    else {
      bcrypt.compare (req.body.answer1, result[0].Answer1, function(err, isMatch){
        if (err) {
          throw err;
        } else if (!isMatch){
          console.log("The answer 1 doesn't match!");
          res.status(400).json({"message":"bad answer 1"});
        } else {
          console.log("Correct answer 1");
          bcrypt.compare (req.body.answer2, result[0].Answer2, function(err, isMatch){
            if (err) {
              throw err;
            } else if (!isMatch){
              console.log("The answer 2 doesn't match!");
              res.status(400).json({"message":"bad answer 2"});
            } else {
              console.log("Correct answer 2");
              res.status(200).json({"message":"good answers"});
            }
          })
        }
      })

    }/*
      console.log("Answer 1 :",result[0].Answer1);
      console.log("Answer 2 :",result[0].Answer2);
      console.log("Answer 1 user :",req.body.answer1);
      console.log("Answer 2 user :",req.body.answer2);
    if(result[0].Answer1==req.body.answer1 && result[0].Answer2==req.body.answer2) {
      res.status(200).json({"message":"good answers"});
    } else {
      res.status(400).json({"message":"bad answers"});
    }*/
  });
});

//met à jour le mdp suite à un oubli
app.post('/resetPassword', (req, res, next)=> {
  console.log("demande de réinisialisation de mdp");
  //on reçoit l'Email du compte à modifier, on renvoi un status ok et on stocke le nouveau mdp
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) throw err;
    else {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        if (err) throw err;
        else {
          con.query("UPDATE Student SET Password='"+hash+"' WHERE Email = '"+req.body.email+"'", function (err, result, fields){
            if (err) throw err;
            con.query("SELECT * FROM Student WHERE Email = '"+req.body.email+"'", function (err, result, fields) {
              if (err) throw err;
              console.log(result);
              username = result[0].Username;
              userID = result[0].StudentID;
              const token = jwt.sign({ userID }, jwtKey, {algorithm: "HS256",expiresIn:'1h'});
              res.status(200).json({"token" : token, "username" : username});
              console.log("token :", token);
              console.log("username :", username);
              console.log("mot de passe changé");
            });
          });
        }
      })
    }
  });
});



app.use((req, res, next) => {
 res.json({message:'insatroc'});
});

module.exports = app;
