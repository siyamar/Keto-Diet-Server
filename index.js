const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbgngea.mongodb.net/?retryWrites=true&w=majority`;

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

    const blogCollection = client.db("KetoDB").collection("postBlogs");
    const commentCollection = client.db("KetoDB").collection("comments");
    const wishlistCollection = client.db("KetoDB").collection("wishlists");

    // blog related api
    app.get("/postBlogs", async (req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/postBlogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    app.post("/postBlogs", async (req, res) => {
      const newpostBlog = req.body;
      const result = await blogCollection.insertOne(newpostBlog);
      res.send(result);
    });

    app.put('/postBlogs/:id', async(req, res)=>{
      const id =req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedBlog = req.body;
      const blog ={
        $set:{
          title: updatedBlog.title, 
          category: updatedBlog.category, 
          shortDescription: updatedBlog.shortDescription, 
          longDescription: updatedBlog.longDescription, 
          imageUrl: updatedBlog.imageUrl
        }
      }
      const result = await blogCollection.updateOne(filter, blog, options);
      res.send(result);
    })

    // comment related api
    app.get("/comments/:id", async (req, res) => {
      const id= req.params.id;
      const query = {_id: id};
      const cursor = commentCollection.find(query);
      const result = await cursor.toArray();
      // const cursor = commentCollection.find();
      // const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/comments", async (req, res) => {
      const newComments = req.body;
      const result = await commentCollection.insertOne(newComments);
      res.send(result);
    });

    // wishlist related api
    app.get("/wishlists", async (req, res) => {
      const cursor = wishlistCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/wishlists", async (req, res) => {
      const wishlistBlog = req.body;
      const result = await wishlistCollection.insertOne(wishlistBlog);
      res.send(result);
    });

    app.delete('/wishlists/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await wishlistCollection.deleteOne(query);
      res.send(result)
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


app.get("/", (req, res) => {
    res.send("Keto Journey Server is running");
  });
  
  app.listen(port, () => {
    console.log(`Keto Journey Server is running on port ${port}`);
  });
  