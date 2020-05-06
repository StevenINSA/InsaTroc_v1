const express = require('express');
const bodyParser = require('body-parser'); //permet de formater les données en JSON
var id=0;

const mariadb = require('mariadb');
const conn = mariadb.createConnection({database:'maBD', host: 'localhost', user:'toto2', password: 'toto2pwd'});
  

const category = {
	"Chambre":1,
	"Cuisine":2,
	"Salle de bain":3,
	"Bureau":4,
	"Loisirs/Sport":5,
	"Autre":6
}

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

const app = express();

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
	//enlever AnnounceID -> défini dans la DB
	//dans la BD : clé primaire entière qui s'auto incrémente
	var sql = "INSERT INTO Announce (AnnounceID, Title, Price, Description, CategoryID) VALUES (id, req.body.title, req.body.price, req.body.description, catID)";
	con.query(sql, function (err, result) {
    if (err) throw err;
		console.log("1 record inserted");
	});
	id++;
	
	res.status(201).json({  //statut "ressource créée"
		message: 'objet créé'
	});
	
});

app.use((req, res) => { //header permettant de communiquer entre les deux serveurs
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
