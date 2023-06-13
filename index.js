const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.kcr8r.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function run() {
  try {
    client.connect();

    const productsCollection = client
      .db('manuProducts')
      .collection('everyItems');
    const reviewsCollection = client.db('clientReviw').collection('review');

    //get all restaurant manus product
    app.get('/manu_products', async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });

    //get all restaurant client product reviews
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running at port: http://localhost:${port}`);
});
