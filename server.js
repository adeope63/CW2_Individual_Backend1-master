const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

const app = express();
const dotenv = require("dotenv").config();


// use static image file middleware
var imagePath = path.resolve(__dirname, "images");
app.use("/image", express.static(imagePath));

app.use((req, res, next) => {
  const error = new Error("File not found");
  error.status = 404;
  next();
});

// use Logger middleware
app.use(function (req, res, next) {
  console.log("Request URL: " + req.url);
  console.log("Request date: " + new Date());
  return next();
});

// CORS allows you to configure the web API's security.
app.use(cors());

  MongoClient.connect(
    "mongodb+srv://adefila:adefila@cluster0.sfmrkbw.mongodb.net/cw?retryWrites=true&w=majority",
  )
    .then((client) => {
      console.log("Connected to Database");
      const db = client.db("webstore");
      const lessonCollection = db.collection("cw");
      const orderCollection = db.collection("cw_order");
      app.use(bodyParser.json());

    //display a message for root path to show that API is workig
    app.get("/",(req,res,next)=>{
      res.send('Please select a collection e.g /collection/messages')
  })

    app.get("/collection/lessons", (req, res) => {
      db.collection("cw")
        .find()
        .toArray()
        .then((lesson) => {
          res.status(200).json({lessons: lesson});
        })
        .catch((error) => console.error(error));
    });
    app.get("/orders", (req, res) => {
      db.collection("cw_order")
        .find()
        .toArray()
        .then((order) => {
          res.status(200).json({ order: order });
        })
        .catch((e) => {
          console.error(e);
        });
    });
    app.post("/order", (req, res) => {
      orderCollection
        .insertOne(req.body)
        .then((result) => {
          res.status(200).json({ order: result });
        })
        .catch((e) => {
          console.error(e);
        });
    });
    app.post("/lesson", (req, res) => {
      const lesson = lessonCollection
        .insertOne(req.body)
        .then((result) => {
          res.status(200).json({ result });
        })
        .catch((error) => console.error(error));
    });

    // Search Function
    app.get("/search", (req, res) => {
      let search_keyword = req.query.search;
      req.lessonCollection.find({}).toArray((err, results) => {
        if (err) return next(err);
        let filteredList = results.filter((subject) => {
          return (
            subject.subjectname
              .toLowerCase()
              .match(search_keyword.toLowerCase()) ||
            subject.location.toLowerCase().match(search_keyword.toLowerCase())
          );
        });
        res.send(filteredList);
      });
    });

    app.put("/lesson/:id", (req, res) => {
      lessonCollection
        .findOneAndUpdate(
          { id: req.params._id },
          {
            $set: {
              subject: req.body.subject,
              price: req.body.price,
              location: req.body.location,
              space: req.body.space,
              imgURL: req.body.imgURL,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => res.json("Success"))
        .catch((error) => console.error(error));
    });

    app.delete("/lesson/:id", (req, res) => {
      lessonCollection
        .deleteOne(req.params._id)
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json("No quote to delete");
          }
          res.json("Deleted Darth Vadar's quote");
        })
        .catch((error) => console.error(error));
    });
  })
  .catch(console.error);
    

    const port = process.env.PORT || 4000;
    app.listen(port, function () {
      console.log(`listening on ${port}`);
    });
  

