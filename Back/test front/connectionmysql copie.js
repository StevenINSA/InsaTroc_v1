var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "insatroc"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
