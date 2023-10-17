require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT ||5000
const { MongoClient, ServerApiVersion } = require('mongodb');


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

    // get product from database
    app.get('/products', async(req, res) => {
        const cursor = productDB.find();
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

    // brand wise data from database
    app.get('/brands/:id', async (req, res) => {
        const name = req.params.id;
        const query = {name: name}
        const cursor = brandDB.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })

    // insert product into the database
    app.post('/products', async (req, res) => {
        const product = req.body;
        const result = await productDB.insertOne(product);
        res.send(result);
    })

    // insert brand  into the database
    app.post('/brands', async (req, res) => {
        const brand = req.body;
        const result = await brandDB.insertOne(brand);
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