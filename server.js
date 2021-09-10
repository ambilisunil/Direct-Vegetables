const path = require("path");
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const app = express();
var router = express.Router();
const multer = require("multer");
var bodyParser = require("body-parser");
app.use(express.json());
var ObjectId = require("mongodb").ObjectID;
const { query } = require("express");
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("view"));

app.set("view engine", "ejs");
var a = [];
const url = "mongodb://localhost:27017/";
global.dtls = {};
global.veg = {};
global.ad="n"


const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "view/uplod/vegimages");
  },

  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const veguplod = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

MongoClient.connect(url, { useUnifiedTopology: true }, async function (err, db) {
  if (err) throw err;
  const dbo = db.db("DirectVeg");

  //Find the first document in the customers collection:
 await  dbo
    .collection("Vegitables")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      veg = result;

      console.log(veg);
      db.close();
    });
});

app.get("/", async (req, res) => {
 await res.render(path.join(__dirname, "view", "index"), { book: veg ,sts:""});
});

app.get("/logout", async (req, res) => {
 dtls = {};

 await res.render(path.join(__dirname, "view", "index"), { book: veg ,sts:""});
});

app.post("/goback", async (req, res) => {
  await res.render(path.join(__dirname, "view", "index"), { book: veg ,sts:""});
 });
 
app.post("/admin/goback", async (req, res) => {
  await res.render(path.join(__dirname, "view", "index"), { book: veg ,sts:""});
 });


app.get("/farmer-product-delete", async(req, res) => {
  let proid = req.query.id;
  var myquery = { _id: ObjectId(proid) };
 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("Vegitables").deleteOne(myquery, function (err, obj) {
      if (err) throw err;

      console.log("1 document deleted");
      res.render(path.join(__dirname, "view/farmerdashboard", "dashbordf"), {
        token: dtls,
      });
      db.close();
    });
  });
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    const dbo = db.db("DirectVeg");
  
    //Find the first document in the customers collection:
    dbo
      .collection("Vegitables")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        veg = result;
  
        console.log(veg);
        db.close();
      });
  });
  console.log(proid);
});

app.get("/farmer-product-edit", async(req, res) => {
  let proid = req.query.id;
  var myquery = { _id: ObjectId(proid) };
 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo
      .collection("Vegitables")
      .find(myquery)
      .toArray(function (err, result) {
        if (err) throw err;

        res.render(path.join(__dirname, "view/farmerdashboard", "update"), {
          token: result,
        });
        db.close();
      });
  });
  
  
});

app.get("/farmer-order-conform", async(req, res) => {
 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    let proid = req.query.id;
    console.log(proid);

    var myquery = { _id: ObjectId(proid) };

    var docm = {
      approved: "yes",
    };
    var newvalues = { $set: docm };
    dbo.collection("Order").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log(res);
      console.log("1 document updated");
    });
    var myquery = { fphone: dtls[0].phone };
    dbo
      .collection("Order")
      .find(myquery)
      .toArray(function (err, result) {
        console.log(result);
        if (err) throw err;
        res.render(
          path.join(__dirname, "view/farmerdashboard", "ordermanage"),
          { content: result }
        );

        db.close();
      });
  });
});



app.get("/customer_order_delivery?", async(req, res) => {
  await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
     if (err) throw err;
     var dbo = db.db("DirectVeg");
     let proid = req.query.id;
     console.log(proid);
 
     var myquery = { _id: ObjectId(proid) };
 
     var docm = {
       delivered: "yes",
     };
     var newvalues = { $set: docm };
     dbo.collection("Order").updateOne(myquery, newvalues, function (err, res) {
       if (err) throw err;
       console.log(res);
       console.log("1 document updated");
     });
     var myquery = { cphone: dtls[0].phone };
     dbo
       .collection("Order")
       .find(myquery)
       .toArray(function (err, result) {
         console.log(result);
         if (err) throw err;
         res.render(
           path.join(__dirname, "view/customer", "orderhistory"),
           { content: result }
         );
 
         db.close();
       });
   });
 });





app.post("/productupdate", veguplod.single("image"), async (req, res) => {
   await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    console.log(req.body);
    var myquery = { _id: ObjectId(req.body.id) };
    var docm = {
      catagory: req.body.catagory,
      type: req.body.type,
      price: req.body.price,
      avilability: req.body.avilability,

      img: req.file.filename,
    };
    var newvalues = { $set: docm };
    dbo
      .collection("Vegitables")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log(res);
        console.log("1 document updated");
      });
    var myquery = { fphone: dtls[0].phone };
    dbo
      .collection("Vegitables")
      .find(myquery)
      .toArray(function (err, result) {
        console.log(result);
        if (err) throw err;
        res.render(
          path.join(__dirname, "view/farmerdashboard", "viewproduct"),
          { content: result }
        );

        db.close();
      });
  });
  
});

app.post("/search_product", async(req, res) => {
  catagory = req.body.catagory;
  if (catagory === "All") {
   await res.render(path.join(__dirname, "view/customer", "c_viewproduct"), {
      product: veg,sts:""
    });
  } else {
   await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("DirectVeg");
      var query = { catagory: req.body.catagory };

      dbo
        .collection("Vegitables")
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err;

          res.render(path.join(__dirname, "view/customer", "c_viewproduct"), {
            product: result,sts:""
          });

          db.close();
        });
    });
  }
});


app.post("/search_place", async(req, res) => {
  place = req.body.place;
  if (place === "All") {
   await res.render(path.join(__dirname, "view/customer", "c_viewproduct"), {
      product: veg,sts:""
    });
  } else {
   await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("DirectVeg");
      var query = { district: req.body.place };

      dbo
        .collection("Vegitables")
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err;

          res.render(path.join(__dirname, "view/customer", "c_viewproduct"), {
            product: result,sts:""
          });

          db.close();
        });
    });
  }
});

app.post("/backcd", async (req, res) => {
 await res.render(path.join(__dirname, "view/customer", "dashbordcus"), {
    token: dtls,
    sts: "",
  });
});
app.post("/backfd", async(req, res) => {
 await  res.render(path.join(__dirname, "view/farmerdashboard", "dashbordf"), {
    token: dtls,
    sts: "",
  });
});

app.get("/addproduct", async(req, res) => {
 await res.render(path.join(__dirname, "view/farmerdashboard", "addproduct"), {
    acnt: dtls,
  });
});

app.post("/productpost", veguplod.single("image"), async (req, res) => {
  var docm = {
    catagory: req.body.catagory,
    type: req.body.type,
    price: req.body.price,
    avilability: req.body.avilability,
    fphone: req.body.fphone,
    fname: req.body.fname,
    place:dtls[0].place,
    district:dtls[0].district,
    img: req.file.filename,
  };
  console.log(docm);
 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("Vegitables").insertOne(docm, function (err, res) {
      if (err) throw err;
    });
    dbo
      .collection("Vegitables")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        veg = result;

        console.log(veg);
        db.close();
      });
      MongoClient.connect(url, { useUnifiedTopology: true }, async function (err, db) {
        if (err) throw err;
        const dbo = db.db("DirectVeg");
      
        //Find the first document in the customers collection:
       await  dbo
          .collection("Vegitables")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            veg = result;
      
            console.log(veg);
            db.close();
          });
      });
    res.render(path.join(__dirname, "view/farmerdashboard", "dashbordf"), {
      token: dtls,
    });
  });
});

app.post("/deletepost", async(req, res) => {
  console.log(req.body.pid);
  var myquery = { _id: ObjectId(req.body.pid) };
 await  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    console.log(req.body.pid);
    console.log(dtls[0]._id);

    dbo.collection("Vegitables").deleteOne(myquery, function (err, obj) {
      if (err) throw err;

      console.log("1 document deleted");
      res.render(path.join(__dirname, "view/farmerdashboard", "dashbordf"), {
        token: dtls,
      });
      db.close();
    });
  });
});

app.get("/cviewproduct", async(req, res) => {
  if (!(dtls[0])){
    await res.render(path.join(__dirname, "view", "index"), { book: veg ,sts:"No Authorized access!! Please do Login"});
  }
  else{
 await res.render(path.join(__dirname, "view/customer", "c_viewproduct"), {
    product: veg,sts:""
  });}
});

app.get("/fprofile", async(req, res) => {
 await  res.render(path.join(__dirname, "view/farmerdashboard", "profile"), {
    acn: dtls,
  });
});

app.get("/changepassword", async(req, res) => {
  await  res.render(path.join(__dirname, "view/customer", "changepassword"),{sts:""});
 });

app.post("/changep", async (req, res) => {
  if(req.body.pswd===dtls[0].password){
  await MongoClient.connect(url, function (err, db) {
     if (err) throw err;
     var dbo = db.db("DirectVeg");
     var myquery = { _id: ObjectId(dtls[0]._id) };
     var obj={password: req.body.newp};
     var newvalues = { $set: obj };
     dbo
       .collection("RegCustomer")
       .updateOne(myquery, newvalues, function (err, res) {
         if (err) throw err;
         console.log("Password Updated");
         db.close();
       });
   });  res.render(path.join(__dirname, "view/customer", "dashbordcus"), {
    token: dtls,
    sts: "Password Updated",
  });}
   else{
    res.render(path.join(__dirname, "view/customer", "changepassword"), {
      
      sts: "Invalid Current Password",
    });
   }
  });



  app.get("/changepasswordf", async(req, res) => {
    await  res.render(path.join(__dirname, "view/farmerdashboard", "changepassword"),{sts:""});
   }); 
  
  app.post("/changepf", async (req, res) => {
    if(req.body.pswd===dtls[0].password){
    await MongoClient.connect(url, function (err, db) {
       if (err) throw err;
       var dbo = db.db("DirectVeg");
       var myquery = { _id: ObjectId(dtls[0]._id) };
       var obj={password: req.body.newp}; 
       var newvalues = { $set: obj };
       dbo
         .collection("RegFarmer")
         .updateOne(myquery, newvalues, function (err, res) {
           if (err) throw err;
           console.log("Password Updated");
           db.close();   
         });
     });  res.render(path.join(__dirname, "view/farmerdashboard", "dashboardf"), {
      token: dtls,
      sts: "Password Updated",
    });}
     else{
      res.render(path.join(__dirname, "view/farmerdashboard", "changepassword"), {
        
        sts: "Invalid Current Password",
      });
     }
    });
   
app.get("/editcus", async (req, res) => {
 await res.render(path.join(__dirname, "view/customer", "edit_c_profile"), {
    acn: dtls,
  });
});

app.post("/cus-order-product", async(req, res) => {
  let count = req.body.count;
  let proid = req.query.id;

  console.log(count);
  if (Number(count)>0 && Number(count)<10000000){
 await  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    const dbo = db.db("DirectVeg");
    var query = { _id: ObjectId(proid) };

    //Find the first document in the customers collection:
    dbo
      .collection("Vegitables")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;

        let total = Number(count) * Number(result[0].price);
        res.render(path.join(__dirname, "view/customer", "ordr"), {
          acn: dtls,
          product: result,
          count: count,
          total,
        });
        db.close();
      });
  });}
  else{
    res.render(path.join(__dirname, "view/customer", "c_viewproduct"), {
     sts:"invalid qunadity",product:veg
    });
  }
});

app.get("/orderhistory", async(req, res) => {
  await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { cphone: dtls[0].phone };

    dbo
      .collection("Order")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        res.render(path.join(__dirname, "view/Customer", "orderhistory"), {
          content: result,
        });

        db.close();
      });
  });
});

app.post("/orderpro", async(req, res) => {
 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("Order").insertOne(req.body, function (err, res) {
      if (err) throw err;
      console.log("Order Placed");
      db.close();
    });
  });

  await res.render(path.join(__dirname, "view/customer", "dashbordcus"), {
    token: dtls,
    sts: "Order Request Sent",
  });
});

app.post("/update_c_profile", async (req, res) => {
 await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var myquery = { _id: ObjectId(dtls[0]._id) };
    var newvalues = { $set: req.body };
    dbo
      .collection("RegCustomer")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
  });

 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { phone: dtls[0].phone};

    dbo
      .collection("RegCustomer")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        dtls=result;
        db.close();
      });
  });
  
  res.render(path.join(__dirname, "view/customer", "dashbordcus"), {
    token: dtls,
    sts: "Profile Updated",
  });
});

app.post("/updateproduct", async(req, res) => {
 await MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var myquery = { _id: ObjectId(dtls[0]._id) };
    var newvalues = { $set: req.body };
    dbo
      .collection("RegFarmer")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
  });
  await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { phone: dtls[0].phone};

    dbo
      .collection("RegFarmer")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        dtls=result;
        db.close();
      });
  });
  
 await res.render(path.join(__dirname, "view/farmerdashboard", "dashbordf"), {
    token: dtls,
    sts: "Profile Updated",
  });
});

app.get("/viewproduct", async(req, res) => {
  await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { fphone: dtls[0].phone };
    console.log(dtls[0].phone)

    dbo
      .collection("Vegitables")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        res.render(
          path.join(__dirname, "view/farmerdashboard", "viewproduct"),
          { content: result }
        );

        db.close();
      });
  });
});

app.get("/ordermanage", async(req, res) => {
  await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");
    var query = { fphone: dtls[0].phone };

    dbo
      .collection("Order")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        res.render(
          path.join(__dirname, "view/farmerdashboard", "ordermanage"),
          { content: result }
        );

        db.close();
      });
  });
});


app.get("/admin", async (req, res) => {
  await res.render(path.join(__dirname, "view/admin", "login"), { book: veg ,sts:""});
 });
 app.get("/admin/home", async (req, res) => {
   if(ad==="y"){
  await res.render(path.join(__dirname, "view/admin", "home"), { book: veg ,sts:""});}
  else{
    res.send("Permision not allowed")
  }
 });

app.post("/admin/adminLogin", async (req, res) => {
  uname=req.body.username;
  psw=req.body.pwd;
  if( uname==="admin" && psw==="admin"){
    ad="y"
  await res.render(path.join(__dirname, "view/admin", "home"), { book: veg ,sts:""});
  }
  else{
    await res.render(path.join(__dirname, "view/admin", "login"), { book: veg ,sts:"Invalid Login Credinalities"});
  }
 });
 app.get("/admin/customerlist", async (req, res) => {
   
  MongoClient.connect(url, { useUnifiedTopology: true },  function (err, db) {
    if (err) throw err;
    const dbo = db.db("DirectVeg");
  
    //Find the first document in the customers collection:
    dbo
      .collection("RegCustomer")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
      
  
        console.log(veg);
        db.close();
        res.render(path.join(__dirname, "view/admin", "customerlist"), {content:result});
      });
  });

 });

 app.get("/admin/farmerslist", async (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true },  function (err, db) {
    if (err) throw err;
    const dbo = db.db("DirectVeg");
  
    //Find the first document in the customers collection:
    dbo
      .collection("RegFarmer")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
      
  
        console.log(veg);
        db.close();
        res.render(path.join(__dirname, "view/admin", "farmerlist"), {content:result});
      });
  });

 });
 app.get("/admin/orderlist", async (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true },  function (err, db) {
    if (err) throw err;
    const dbo = db.db("DirectVeg");
  
    //Find the first document in the customers collection:
    dbo
      .collection("Order")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
      
  
       
        db.close();
        res.render(path.join(__dirname, "view/admin", "orderdis"), {content:result});
      });
  });

 });


 app.get("/admin/alogout", async (req, res) => {
   ad="n"
  await res.render(path.join(__dirname, "view/admin", "login"), { book: veg ,sts:""});
 });
 
 


app.get("/regcus", async(req, res) => {
 await res.render(path.join(__dirname, "view", "regcus"));
});

app.get("/regfarmer", async(req, res) => {
 await  res.render(path.join(__dirname, "view", "regfarmer"));
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
  res.render(path.join(__dirname, "view", "index"), { book: veg,sts:"" }); 
});

app.post("/addfarmer", async (req, res) => {
 await MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("DirectVeg");

    dbo.collection("RegFarmer").insertOne(req.body, function (err, res) {
      if (err) throw err;

      db.close();
    });
  });
  res.render(path.join(__dirname, "view", "index"), { book: veg,sts:""});
});




app.post("/flogin", async (req, res) => {
  const { phn, pass } = req.body;

 await  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
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
            dtls = result;

            console.log(result);
            res.render(
              path.join(__dirname, "view/farmerdashboard", "dashbordf"),
              { token: result }
            );
          }else {
            res.render(path.join(__dirname, "view", "index"), {
              book: veg,
              sts: "Incorrect Password",
            });}
          
        } else {
          res.render(path.join(__dirname, "view", "index"), {
            book: veg,
            sts: "Incorrect User name",
          });
        }
        db.close();
      });
  });
});

app.post("/clogin", async(req, res) => {
  const { phn, pass } = req.body;

 await  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
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
            dtls = result;
            res.render(path.join(__dirname, "view/customer", "dashbordcus"), {
              token: result,
              sts: "",
            });
          }else {
            res.render(path.join(__dirname, "view", "index"), {
              book: veg,
              sts: "Incorrect Password",
            });
          }
          
        } else {
          res.render(path.join(__dirname, "view", "index"), {
            book: veg,
            sts: "Incorrect User name",
          });
        }
        db.close();
      });
  });
});

const PORT = 3000;
app.listen(PORT);
