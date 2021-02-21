
const mysql = require('mysql')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
app.set('view engine', 'ejs');

var MyAcc = 101;

/* middleware */
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/* defining database */
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Vidya@2001",
    database: "sparksdb",
    insecureAuth : true
  });

  
  /* To start from the landing page */
  app.use(express.static('views'));
  con.connect(function (error) {
    if (error) {
        console.log("Error in Connecting Database");
        throw error;
    }
    else {
        console.log("Connected to Database");
    }
});


app.get('/user-list', function(req, res, next) {
    var sql='SELECT * FROM data';
    con.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('user-list', { title: 'User List', userData: data});
  });
});

app.get('/customer', function(req, res, next) {
    var sql='SELECT * FROM transactions';
    con.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('customer', { title: 'User List', userData: data});
  });
});



app.get('/',(req,res)=>{
    res.render('index');
  });

app.post('/user-list',urlencodedParser,(req,res)=>{
    var bal;
    var acc_no= req.body.Accno;
    var amt = req.body.Amt;
    con.query("SELECT balance from data where iddata = ? ",[MyAcc],function(err,rows){
        if(err){
            console.log(err)
            res.redirect('/');
        }
        else{
            bal = rows[0].balance
            if(bal<amt){
                console.log("balance not sufficient")
                res.redirect('/')
            }
            else{
                bal = bal - amt
                con.query("UPDATE data set balance=? where iddata=?",[bal,MyAcc],function(err,rows){
                    if(err){
                        console.log(err)
                        res.redirect('/');
                    }
                    else{
                    con.query("UPDATE data set balance=balance+? where iddata=?",[amt,acc_no],function(err,rows){
                        if(err){
                            console.log(err)
                            res.redirect('/');
                        }
                        else{
                            con.query("INSERT INTO transactions (debit,credit,amount) values (?,?,?)",[MyAcc,acc_no,amt],function(err,rows){
                                if(err){
                                    console.log(err)
                                    res.redirect('/');
                                }
                                else{
                                    res.redirect('/user-list')
                                    }
                            })
                        }
                    
                    }
                    )
                }
            }  
                )
        }
    }
    
    })
})


app.listen(port, () => {
    console.log(`App started at http://localhost:${port}`)
})
