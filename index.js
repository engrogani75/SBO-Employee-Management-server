const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

// app.use(cors())

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://resilient-cranachan-6846d9.netlify.app',
  
  ],
  credentials: true
}));


app.use(express.json());









// const uri = "mongodb+srv://sboEmployeeManagement:p06WfirLBNRwp63S@cluster0.d33r4qq.mongodb.net/?retryWrites=true&w=majority";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d33r4qq.mongodb.net/?retryWrites=true&w=majority`;


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
    // await client.connect();

    const userCollection = client.db("sboEmployeeManagement").collection("users");
    const paymentCollection = client.db("sboEmployeeManagement").collection("payment");
    const workCollection = client.db("sboEmployeeManagement").collection("newWorkEntries");
    const messageCollection = client.db("sboEmployeeManagement").collection("userMessage");


    // all user collect for HR sent to clinet employeee list

    app.get('/users', async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });


      app.get('/users/:email', async (req, res) => {
        const query = { email: req?.params?.email }
        const result = await userCollection.find(query).toArray();
        res.send(result);
      })


        // payment collect colect from database

        app.get('/payments', async (req, res) => {
          const result = await paymentCollection.find().sort({ Month: 1 }).toArray();
          res.send(result);
        });


      app.get('/payments/:email', async (req, res) => {
        const query = { email: req.params.email }
        const result = await paymentCollection.find(query).toArray();
        res.send(result);
      })






//    ------------userCollection-----------------

    app.post('/users', async (req, res) => {
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });


      // update statust is verified


      app.patch('/users/:id', async(req,res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const verified = req.body;
        // console.log(verified);
        const updateDoc = {
          $set: {
            isVerfied: verified.isVerfied
          }
        }
      
        const result = await userCollection.updateOne(filter, updateDoc)
        res.send(result)
       })


       app.patch('/users/admin/:id', async(req,res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updateDoc = {
          $set: {
            status: 'Fired'
          }
        }
      
        const result = await userCollection.updateOne(filter, updateDoc)
        res.send(result)
       })


       app.put('/users/mkhr/:id', async(req,res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updateDoc = {
          $set: {
            role: 'HR'
          }
        }
      
        const result = await userCollection.updateOne(filter, updateDoc)
        res.send(result)
       })



      //  payment related method


      app.post('/create-payment-intent', async (req, res) => {
        const { salary } = req.body;
        const amount = parseInt(salary * 100);
        // console.log(amount, 'amount inside the intent')
  
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'BDT',
          payment_method_types: ['card']
        });
  
        res.send({
          clientSecret: paymentIntent.client_secret
        })
      });


      // payment save to data baseURL:
      

      app.post('/payments', async (req, res) => {
        const payment = req.body;
        const paymentResult = await paymentCollection.insertOne(payment);
        res.send(paymentResult)
      })


      // get worksheet from database


      app.get('/work-sheet', async (req, res) => {
        const result = await workCollection.find().toArray();
        res.send(result);
      });


       // work-sheet save

       app.post('/work-sheet', async (req, res) => {
        const newWorks = req.body;
        const newWorksResult = await workCollection.insertOne(newWorks );
        res.send(newWorksResult)
      })


      //Contact us for save

      app.post('/user-message', async (req, res) => {
        const userMessage = req.body;
        const result = await messageCollection.insertOne(userMessage);
        res.send(result);
      });
  
       


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) =>{
    res.send('Employee mangement is setup')
})

app.listen(port, () => {
    console.log(`Empolyee mangaement is running ${port}`);
})
