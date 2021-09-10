const path = require("path");
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const app = express();
var router = express.Router();
const multer=require('multer');
var bodyParser = require("body-parser");
app.use(express.json());
var ObjectId = require('mongodb').ObjectID;
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("view"));

app.set("view engine", "ejs");



var a = [];
const url = "mongodb://localhost:27017/";
global.dtls={}

var posts = [
  { title: "Post 1", name: "Danny" },
  { title: "Post 2", name: "Alex" },
  { title: "Post 3", name: "Matt" },
  { title: "Post 4", name: "Manny" },
];



MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
  if (err) throw err;
  const dbo = db.db("mydb");

  //Find the first document in the customers collection:
  dbo.collection("login").findOne({}, function (err, result) {
    if (err) throw err;
    email = result.usr;
    pass = result.psw;
    a = result;
    console.log(result)
  });});




const storage=multer.diskStorage({
  destination:function(request,file,callback){
    callback(null,'view/uplod/vegimages');
  },

  filename:function(request,file,callback){
    callback(null,Date.now()+file.originalname)
  },
});

const veguplod=multer({
  storage:storage,
  limits:{
    fieldSize:1024 * 1024 * 3
  },
});




app.get("/", (req, res) => {

 
  
    res.render(path.join(__dirname, "view", "index"), { book: posts });
});

app.get("/logout", (req, res) => {
  dtls={}
  
  res.render(path.join(__dirname, "view", "index"), { book: posts });
});




app.get("/addproduct", (req, res) => {

  res.render(
    path.join(__dirname, "view/farmerdashboard", "addproduct"),
    { acnt:dtls}
  );
 
});





app.post("/productpost",veguplod.single('image'), async (req, res) => {
  var docm={
    catagory:req.body.catagory,
    type:req.body.type,
    price:req.body.price,
    avilability:req.body.avilability,
    fphone:req.body.fphone,
    fname:req.body.fname,
    img:req.file.filename

  };
  console.log(docm)
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("Vegitables").insertOne(docm, function (err, res) {
      if (err) throw err;

      db.close();
    });
    res.render(
      path.join(__dirname, "view/farmerdashboard", "dashbordf"),
      { token:dtls }
    );
  }
  
  
  );
});


app.post("/deletepost", (req, res) => {
  console.log(req.body.pid)
  var myquery = { "_id" : ObjectId(req.body.pid)};
  MongoClient.connect(url, { useUnifiedTopology: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    console.log(req.body.pid)
    console.log(dtls[0]._id)
    
    dbo.collection("Vegitables").deleteOne(myquery, function(err, obj) {
      if (err) throw err;

      console.log("1 document deleted");
      res.render(
        path.join(__dirname, "view/farmerdashboard", "dashbordf"),
        { token: dtls }
      );
      db.close();
    });
  });
 
});

app.get("/deleteproduct", (req, res) => {

  res.render(
    path.join(__dirname, "view/farmerdashboard", "deleteproduct"));
 
});

app.get("/fprofile", (req, res) => {

  res.render((path.join(__dirname, "view/farmerdashboard", "profile")),{acn:dtls});
 
});


app.post("/updateproduct", (req, res) => {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var myquery = { "_id" : ObjectId(dtls[0]._id)};
    var newvalues = { $set: req.body };
    dbo.collection("RegFarmer").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
 res.send("Profile Updated")
});




app.get("/viewproduct", (req, res) => {

MongoClient.connect(url,{ useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { fhone: dtls[0].fhone };
    
    dbo
      .collection("Vegitables")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        res.render(
          path.join(__dirname, "view/farmerdashboard", "viewproduct"),
          { content:result}
        );
        
        db.close();
      });
  });
  
 
});





app.get("/regcus", (req, res) => {
  res.render(path.join(__dirname, "view", "regcus"));
});

app.get("/regfarmer", (req, res) => {
  res.render(path.join(__dirname, "view", "regfarmer"));
});


app.post("/addcus", (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("RegCustomer").insertOne(req.body, function (err, res) {
      if (err) throw err;

      db.close();
    });
  });
  res.render(path.join(__dirname, "view", "index"), { book: posts });
});

app.post("/addfarmer", (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("RegFarmer").insertOne(req.body, function (err, res) {
      if (err) throw err;

      db.close();
    });
  });
  res.render(path.join(__dirname, "view", "index"), { book: posts });
});

app.post("/flogin", (req, res) => {
  const { phn, pass } = req.body;

  MongoClient.connect(url,{ useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { phone: phn };
    
    dbo
      .collection("RegFarmer")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;

        if (result[0]) {
          if (result[0].password === pass) {
            dtls=result
            
            console.log(result);
            res.render(
              path.join(__dirname, "view/farmerdashboard", "dashbordf"),
              { token: result }
            );
          }
        } else {
          res.send("Incorect Deatils!! Login again");
          
        }
        db.close();
      });
  });
});

app.post("/clogin", (req, res) => {
  const { phn, pass } = req.body;

  MongoClient.connect(url, { useUnifiedTopology: true },function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { phone: phn };
    
    dbo
      .collection("RegCustomer")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;

        if (result[0]) {
          if (result[0].password === pass) {
            console.log(result);
            dtls=result
            res.render(
              path.join(__dirname, "view/customer", "dashbordcus"),
              { token: result }
            );
          }
        } else {
          res.send("Incorect Deatils!! Login again");
          
        }
        db.close();
      });
  });
});

const PORT = 3001;
app.listen(PORT);


