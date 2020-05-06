const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('An alligator approaches!');
});
app.post('/addPost',(req,res) => {
    console.log(req.body);
    //To do : Extract the ''data'' from the req !
    console.log('Got something !')
    res.json({response:'InsaTroc is Alive !'})
});

app.route('/post-viewer/:id').get((req, res) => {
  console.log("requete id");
  const postID = req.params['id'];
  res.send({id: postID});
})

app.listen(3000, () => console.log('Gator app listening on port 3000!'));
