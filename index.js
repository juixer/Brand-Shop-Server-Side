require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT ||5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(express.json())
app.use(cors())

// MongoDB configuration

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.en41ppq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // database connection
    const techBuddyDB = client.db('TechBuddyDB');
    const productDB = techBuddyDB.collection('Product');
    const brandDB = techBuddyDB.collection('Brand');
    const subscriberDB = techBuddyDB.collection('Subscriber');
    const userDB = techBuddyDB.collection('User');

    // get product from database
    app.get('/products', async(req, res) => {
        const cursor = productDB.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // get user from database
    app.get('/users', async(req, res) => {
      const cursor = userDB.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // get brand from database
    app.get('/brands', async(req, res) => {
        const cursor = brandDB.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    // brand wise product from database
    app.get('/products/:id', async (req, res) => {
        const brand = req.params.id;
        const query = {brand: brand}
        const cursor = productDB.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    // top rating product from database
    app.get('/topRating', async (req, res) => {
        const query= {rating: '5'}
        const cursor = productDB.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    // Category wise  product from database
    app.get('/category/:id', async (req, res) => {
      const category = req.params.id;
      const query = {type : category}
      const cursor = productDB.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })


    // brand wise data from database
    app.get('/brands/:id', async (req, res) => {
        const name = req.params.id;
        const query = {name: name}
        const cursor = brandDB.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    // product details from database
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const result = await productDB.findOne(query);
      res.send(result);
    })

    // get subscriber from database
    app.get('/subscribers', async (req, res) => {
      const cursor = subscriberDB.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    // insert product into the database
    app.post('/products', async (req, res) => {
        const product = req.body;
        const result = await productDB.insertOne(product);
        res.send(result);
    })

    // get specific user
    app.get('/user/:id', async (req, res) => {
        const email = req.params.id;
        const query ={email : email}
        const result = await userDB.findOne(query);
        res.send(result);
    })

    

    // insert user into database if user already exists
    app.patch('/users', async (req, res) => {
      const user = req.body;
      const filter = {email : user.email}
      const option = {upsert : true}
      const updateDoc = {
        $set:{
          name: user.name,
          email: user.email,
          photo: user.photo,
        }
      }
      const result = await userDB.updateOne(filter, updateDoc, option);
      res.send(result);
    })


    // insert subscriber into the database
    app.post('/subscribers', async (req, res) => {
      const subscriber = req.body;
      const result = await subscriberDB.insertOne(subscriber)
      res.send(result);
    })

    // insert brand  into the database
    app.post('/brands', async (req, res) => {
        const brand = req.body;
        const result = await brandDB.insertOne(brand);
        res.send(result);
    })

    // delete cart each data
    app.delete('/user/:id/cart/:itemId', async (req, res) => {
      const email =req.params.id;
      const itemId = req.params.itemId;
      const filter = {email: email}
      const updateCart = {
        $pull:{
          cart: {_id : itemId}
        }
      }
      const result = await userDB.updateOne(filter,updateCart)
      res.send(result);
    })

    // add cart to user 
    app.patch('/user/:id', async (req, res) => {
      const email = req.params.id;
      const cartItem = req.body;
      const filter = {email : email}
      const option = {upsert : true}
      const updateCart = {
        $push:{
          cart : cartItem,
        }
      }
      const result = await userDB.updateOne(filter,updateCart,option)
      res.send(result);
    })

    // Update product from the database

    app.put('/product/:id', async (req, res) => {
      const product = req.body;
      const id = req.params.id;
      console.log(id);
      const filter = {_id : new ObjectId(id)};
      const options = {upsert : true};
      const updateProduct = {
        $set:{
          name: product.name,
          photo: product.photo,
          brand: product.brand,
          type: product.type,
          price: product.price,
          details: product.details,
          rating: product.rating
        }
      }
      const result = await productDB.updateOne(filter,updateProduct,options)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Tech Buddy Database')
})

app.listen(port, () => {
    console.log(`listening on ${port}`);
})