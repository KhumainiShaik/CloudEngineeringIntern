const aws = require('aws-sdk');
const s3 = new aws.S3({
    apiVersion: '2006-03-01',
    region: 'us-east-1',
    accessKeyId: 'AKIAYK7TLQWPKI34ZEAZ',
    secretAccessKey: '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'
});

const mysql = require('mysql');
const readline = require('readline');
let data = [];

const connection = mysql.createConnection({
    host: 'mydbinstance-us-east-1.cc7otgq3h7hn.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'admin1234',
    database: 'mydb',
    port:3306
});

exports.handler = async (event,context,callback) => {
    // TODO implement
    var bucketName = event["Records"][0]["s3"]["bucket"]["name"];
    var bucketObject = event["Records"][0]["s3"]["object"]["key"];
    const bucketParams = {
        Bucket: `${bucketName}`,
        Key:`${bucketObject}`
    };
    console.log(bucketParams);
    try {
        var tbname = bucketObject.split('.')[0];
        var crque = `create table ${tbname} (id int, name varchar(50),surname varchar(50), dob varchar(50), gender varchar(10))`;
        console.log(crque);
        connection.query(crque, (err, res) => {
            if (err) {
                console.error(err);
            }
            console.log('table created');
        });
        
        const s3ReadStream = s3.getObject(bucketParams).createReadStream();

        const rl = readline.createInterface({
            input: s3ReadStream,
            terminal: false
        });
        
        var myReadPromise = new Promise((resolve, reject) => {
            var c = 0;
            
            rl.on('line', (line) => {
                c++;
                line = line.split(',');
                data.push(line);
                if (c % 100 == 0) {
                    var i = (c-100);
                    while (i < data.length) {
                        var que = `insert into ${tbname} values(${data[i][0]},'${data[i][1]}','${data[i][2]}','${data[i][3]}','${data[i][4]}')`;
                        console.log(que);
                        connection.query(que, (err, res) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                        i+=1;
                    }
                    console.log((i - 1) + ' records inserted');
                }

            });
            rl.on('error', () => {
                console.log('error');
            });
            rl.on('close',()=>{
                var i=1;
               if(c<100){
                   while (i < data.length) {
                        var que = `insert into ${tbname} values(${data[i][0]},'${data[i][1]}','${data[i][2]}','${data[i][3]}','${data[i][4]}')`;
                        console.log(que);
                        connection.query(que, (err, res) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                        i+=1;
                    }
                    console.log((i - 1) + ' records inserted');
               } 
            });

        });
        await myReadPromise;

    } catch (err) {
        console.log(err);
    }

};