const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.kcr8r.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
client.connect();

// jwt verifying
const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log(authorization);

  if (!authorization) {
    return res.status(401).send({ massege: 'unauthorized access' });
  }
  //bearer token
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.SECRET_TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ massege: 'unauthorized access' });
    }
    console.log('decoded:', decoded);

    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const productsCollection = client
      .db('manuProducts')
      .collection('everyItems');
    const reviewsCollection = client.db('clientReviw').collection('review');
    const cartCollection = client.db('clientCard').collection('cart');
    const userCollection = client.db('userHub').collection('user');

    //jwt sign token
    app.post('/jwt', (req, res) => {
      const user = req?.body;
      console.log(user);

      const token = jwt.sign(user, process.env.SECRET_TOKEN_KEY, {
        expiresIn: '5h',
      });

      console.log(token);
      res.send({ token });
    });

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

    //post a cart item
    app.post('/client/cart', async (req, res) => {
      const cartData = await req.body;
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });

    //get cart items
    app.get('/client/cart', verifyToken, async (req, res) => {
      const queryEmail = req.query.user;
      console.log(queryEmail);

      const decodedEmail = await req.decoded.user;
      if (!queryEmail) {
        res.send([]);
      }
      if (queryEmail !== decodedEmail) {
        res.status(403).send({ error: true, message: 'forbidden access' });
      }

      const findQuery = { user: queryEmail };
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

    //get all user data
    app.get('/users', async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });

    //post user information
    app.post('/users', async (req, res) => {
      const userData = await req.body;
      const query = { email: userData?.email };

      const existUser = await userCollection.findOne(query);
      if (existUser) {
        res.send({ message: 'user already exist!' });
      } else {
        const result = await userCollection.insertOne(userData);
        res.send(result);
      }
      //
    });

    //patch user role for update user role admin or normal user
    app.patch('/user_role/:options', async (req, res) => {
      const userData = req?.params?.options;
      const data = await JSON.parse(userData);

      const filter = { _id: new ObjectId(data?.id) };

      if (data?.role === 'user') {
        const updateDoc = {
          $set: {
            role: `admin`,
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        const updateDoc = {
          $set: {
            role: `user`,
          },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }

      // const query = { _id: new ObjectId(ids) };
      // console.log(query);
    });

    //
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running at port: http://localhost:${port}`);
});
