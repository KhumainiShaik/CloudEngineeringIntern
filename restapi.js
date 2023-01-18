const express = require('express');
const app = express();
const mysql = require('mysql');
const basicAuth = require('basic-auth');

async function dbcon(req,res){
    try{
        var connection = mysql.createConnection({
            host: 'mydbinstance-us-east-1.cc7otgq3h7hn.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'admin1234',
            database: 'mydb',
            port:3306
        });
        connection.connect((err) => {
            if (err) {
                console.error('Database connection failed: ' + err.stack);
                return;
            }
            console.log('connected!!');
            var que = `insert into userdata values(${req.body.id},'${req.body.name}','${req.body.surname}','${req.body.dob}','${req.body.gender}')`;
            connection.query(que,(err,res)=>{
                if(err){
                    console.error(err);
                }
                console.log('1 record inserted');
            })
        });
    }
    catch(error){
        console.error(error);
    }
}

var auth = function (req, res, next) {
  var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Unauthorized');
    res.sendStatus(401);
    return;
  }
  if (user.name === 'Khumaini' && user.pass === 'ks1119') {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm=Unauthorized');
    res.sendStatus(401);
    return;
  }
}

app.use(express.json());

app.post('/', auth, (req, res) => {
    res.write('{authenticated:true}\n');
    dbcon(req,res);
    res.end('1 record inserted');
});
app.listen(8081, () => console.log("Server started at 127.0.0.1://8081"));