const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

var cors = require("cors");
// middle ware

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.i54ldrx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db("carDealer");
    const cars = database.collection("carCollection");

    app.get("/cars", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(page, size);
      const query = {};
      const cursor = cars.find(query);
      let result;
      if (size || page) {
        result = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        result = await cursor.limit(5).toArray();
      }

      res.send(result);
    });
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cars.findOne(query);

      res.send(result);
    });

    app.put("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body.stock;
      const filter = { _id: ObjectId(id) };
      // this option instructs the method to create a document if no documents match the filter
      const options = { upsert: true };
      const updateDoc = {
        $set: { stock: data },
      };
      const result = await cars.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.del("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await cars.deleteOne(filter);
      res.send(result);
    });
    app.post("/addProduct", async (req, res) => {
      const data = req.body;
      const result = await cars.insertOne(data);
      res.send(result);
    });

    app.post("/login", async (req, res) => {
      const email = req.body;
      console.log(email);
    });

    app.get("/productCount", async (req, res) => {
      const query = {};
      const cursor = cars.find(query);
      const count = await cursor.count();
      res.send({ count });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Export the Express API
module.exports = app;
