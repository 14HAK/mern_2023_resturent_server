const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const cartCollection = client.db('clientCard').collection('cart');
    const userCollection = client.db('userHub').collection('user');

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

    //post user information
    app.post('/users', async (req, res) => {
      const userData = await req.body;

      const result = await userCollection.insertOne(userData);
      res.send(result);

      //
    });

    //post a cart item
    app.post('/client/cart', async (req, res) => {
      const cartData = await req.body;
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });

    //get cart items
    app.get('/client/cart', async (req, res) => {
      const queryString = req.query.user;
      const findQuery = { user: queryString };
      const result = await cartCollection.find(findQuery).toArray();
      res.send(result);
    });

    //delete cart items
    app.delete('/client/cart/:id', async (req, res) => {
      const ids = req.params.id;
      const query = { _id: new ObjectId(ids) };

      const result = await cartCollection.deleteOne(query);

      res.send(result);
    });

    //
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running at port: http://localhost:${port}`);
});
