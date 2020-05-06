const express = require('express');
const bodyParser = require('body-parser'); //permet de formater les données en JSON
var mariadb = require('mariadb');

var con = mariadb.createConnection({
  host: "localhost",
  user: "toto2",
  password: "pwdtoto",
  database: "insatroc"
});

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
	res.status(201).json({  //statut "ressource créée"
		message: 'objet créé'
	});
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

    },
  ];
  res.status(200).json(stuff);
});*/




module.exports = app;
