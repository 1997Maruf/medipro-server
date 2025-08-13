const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

//middleware
// const corsConfig = {
//   origin: ["http://localhost:5173","https://chipper-tapioca-ce3ca9.netlify.app"],
//   credentials: true,
// };
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a87xhva.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // const bookingCollection = client.db(" medipro").collection("booking");
    const userCollection = client.db("medipro").collection("users");
    const productCollection = client.db("medipro").collection("products");
    const cartCollection = client.db("medipro").collection("carts");
    const orderCollection = client.db("medipro").collection("order");
    const massageCollection = client.db("medipro").collection("massage");
    const compCollection = client.db("medipro").collection("completedOrders");
    const doctorsCollection = client.db("medipro").collection("doctores");
    const appointmentCompletedCollection = client
      .db("medipro")
      .collection("appointmentCompleted");
    const appointmentCollection = client
      .db("medipro")
      .collection("appointments");
    //jwt related api

    // Single User Profile
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //add to cart
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      console.log("Incoming cartItem:", cartItem);

      const { email, title } = cartItem;

      // 🔍 Check if the item already exists for this user and product
      const existingItem = await cartCollection.findOne({ email, title });

      if (existingItem) {
        return res.send({
          acknowledged: false,
          message: "You have already added this product.",
        });
      }

      // ✅ Insert the new cart item
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });
    //Order collection
    app.post("/orders", async (req, res) => {
      const order = req.body;

      // Step 1: Save order
      const result = await orderCollection.insertOne(order);

      if (result.insertedId) {
        // Step 2: Delete all cart items for this user
        const deleteResult = await cartCollection.deleteMany({
          email: order.email,
        });

        res.send({
          insertedId: result.insertedId,
          deletedCount: deleteResult.deletedCount,
        });
      } else {
        res.status(500).send({ message: "Failed to place order" });
      }
    });
    // All Massages
    app.post("/massage", async (req, res) => {
      const massage = req.body;
      console.log(massage);
      const result = await massageCollection.insertOne(massage);
      res.send(result);
    });
    // All Appointment Now
    app.post("/appointment", async (req, res) => {
      const appointment = req.body;
      console.log(appointment);
      const result = await appointmentCollection.insertOne(appointment);
      res.send(result);
    });
    // All Product
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Get All Users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //All Orders
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //all Doctors
    app.get("/doctors", async (req, res) => {
      const cursor = doctorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //All completed Orders
    app.get("/CompletedOrder", async (req, res) => {
      const cursor = compCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //All appointments
    app.get("/appointment", async (req, res) => {
      const cursor = appointmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //All Completed appointments
    app.get("/completedAppointments", async (req, res) => {
      const cursor = appointmentCompletedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // single user Appointments
    app.get("/completedAppointmentss/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const result = await appointmentCompletedCollection
        .find({ email: email })
        .toArray();
      res.send(result);
    });
    // single Doctor Appointments
    app.get("/appointmentss/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const result = await appointmentCollection
        .find({ email: email })
        .toArray();
      res.send(result);
    });
    // single crunt date Doctor  appointment
    app.get("/appointments/doctor", async (req, res) => {
      const { email, date } = req.query;

      if (!email || !date) {
        return res.status(400).send({ error: "Email and date are required" });
      }

      const result = await appointmentCollection
        .find({ doctorEmail: email, date: date })
        .toArray();

      res.send(result);
    });
    //view details
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    //Doctor details
    app.get("/doctor/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Received ID:", id);

      try {
        const query = { _id: new ObjectId(id) };
        const result = await doctorsCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ error: "Doctor not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        res.status(500).send({ error: "Invalid ID or server error" });
      }
    });
    // single user cart
    app.get("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const result = await cartCollection.find({ email }).toArray();
      res.send(result);
    });

    // delete booking
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    //delete Order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    //Delete Appointments
    app.delete("/appointment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appointmentCollection.deleteOne(query);
      res.send(result);
    });
    // Delete Collection
    app.delete("/compCollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await compCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/update-status/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      try {
        // 1️⃣ Find the order
        const order = await orderCollection.findOne({ _id: new ObjectId(id) });

        if (!order) {
          return res.status(404).send({ message: "Order not found" });
        }

        // 2️⃣ Update status
        const updatedOrder = { ...order, status };

        // 3️⃣ Insert into completedOrdersCollection
        const insertResult = await compCollection.insertOne(updatedOrder);

        // 4️⃣ Delete from original collection
        const deleteResult = await orderCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send({ message: "Success", insertResult, deleteResult });
      } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.put("/appointment-completed/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      try {
        // 1️⃣ Find the order
        const order = await appointmentCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!order) {
          return res.status(404).send({ message: "Order not found" });
        }

        // 2️⃣ Update status
        const updatedOrder = { ...order, status };

        // 3️⃣ Insert into completedOrdersCollection
        const insertResult = await appointmentCompletedCollection.insertOne(
          updatedOrder
        );

        // 4️⃣ Delete from original collection
        const deleteResult = await appointmentCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send({ message: "Success", insertResult, deleteResult });
      } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });
    // app.get('/users/:email', async (req, res) =>{
    //   const email =req.params.email
    //   const result = await userCollection.findOne({email});
    //   res.send(result);
    // })
    // app.get('/users/:email', async (req, res) =>{
    //   const email =req.params.email
    //   const result = await userCollection.findOne({email});
    //   res.send(result);
    // })

    //delete booking
    //  app.delete("/booking/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await bookingCollection.deleteOne(query);
    //   res.send(result);
    // });
    // update booking
    //   app.put('/booking/:id', async(req, res) => {
    //     const id = req.params.id;
    //     const filter = {_id: new ObjectId(id)}
    //     const options = { upsert: true };
    //     const updateCraft = req.body;
    //     const craft = {
    //         $set: {
    //           type: updateCraft.type,
    //             deliveryDate: updateCraft.deliveryDate,
    //             bookingDate: updateCraft.bookingDate,

    //         }
    //     }
    // const result = await bookingCollection.updateOne(filter, craft, options);
    // res.send(result);

    // })

    // app.get('/booking/:id', async(req, res) =>{
    //   const id =req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await bookingCollection.findOne(query);
    //   res.send(result);
    // })
    // // my delibery list
    // app.get('/bookingById/:id', async(req, res) =>{
    //   const id =req.params.id;
    //   const query = {deliveryMenId: (id)}
    //   const result = await bookingCollection.find(query).toArray();
    //   res.send(result);
    // })

    // app.post("/booking", async (req, res) => {
    //   const booking = req.body;
    //   console.log(booking);
    //   const result = await bookingCollection.insertOne(booking);
    //   res.send(result);
    // });

    // // Contact Post API

    // app.post("/massages", async (req, res) => {
    //   const massages = req.body;
    //   console.log(massages);
    //   const result = await massageCollection.insertOne(massages);
    //   res.send(result);
    // });

    // // feetdbacks post api
    // app.post("/feetdbacks", async (req, res) => {
    //   const feetdback = req.body;
    //   console.log(feetdback);
    //   const result = await feetdbackCollection.insertOne(feetdback);
    //   res.send(result);
    // });
    // // feedback get api
    // app.get("/feetdbacks/:id", async (req, res) => {
    //   const id =req.params.id;
    //   const query = {deliveryMenId:(id)}
    //   const result = await feetdbackCollection.find(query).toArray();
    //   res.send(result);
    // });

    //

    //     // alluser
    //     app.get("/users", async (req, res) => {
    //       const cursor = userCollection.find();
    //       const result = await cursor.toArray();
    //       res.send(result);
    //     });

    //     // adin
    //     app.get('/users/admin/:email', async(req, res) =>{
    //      const email = req.params.email;
    //      if(email !== req.decoded.email){
    //       return res.status(403).send({message: 'unauthorized access'});
    //      }
    //      const query = {email: email};
    //      const user = await userCollection.findOne(query);
    //      let admin = false;
    //      if(user){
    //       admin = user?.role === 'admin';
    //      }
    //      res.send({admin});
    //     })

    //     // update admin
    //     app.patch("/users/admin/:id", async (req, res) => {
    //       const id = req.params.id;
    //       const filter = { _id: new ObjectId(id) };
    //       const updatedDoc = {
    //         $set: {
    //           role: "admin",
    //         },
    //       };
    //       const result = await userCollection.updateOne(filter, updatedDoc);
    //       res.send(result);
    //     });
    //     // update Delivery
    //     app.patch("/users/delivery/:id", async (req, res) => {
    //       const id = req.params.id;
    //       const filter = { _id: new ObjectId(id) };
    //       const updatedDoc = {
    //         $set: {
    //           role: "delivery",
    //         },
    //       };
    //       const result = await userCollection.updateOne(filter, updatedDoc);
    //       res.send(result);
    //     });

    //     app.get("/booking", async (req, res) => {
    //       console.log(req.query.email);
    //       console.log(req.query);
    //       let query = {};
    //       if (req.query?.email) {
    //         query = { email: req.query.email };
    //       }
    //       console.log(query);
    //       const result = await bookingCollection.find(query).toArray();
    //       res.send(result);
    //     });
    //     //Manage Button api
    //     app.put('/booking/:id', async(req, res) => {
    //       console.log("ami")

    //       const id = req.params.id;
    //       console.log(req.params._id)
    //       const filter = {_id: new ObjectId(id)}
    //       const options = { upsert: true };
    //       const updateBook = req.body;
    //       console.log("updateBook",updateBook);
    //       const craft = {
    //           $set: {
    //               status:'On The Way',
    //               deliveryMenId: updateBook.deliveryMenId,
    //               approximateDate: updateBook.approximateDate,

    //           }
    //       }
    //   const result = await bookingCollection.updateOne(filter, craft, options);
    //   res.send(result);

    //   })
    //     app.put('/booking/:id', async(req, res) => {
    //       console.log("ami")

    //       const id = req.params.id;
    //       console.log("id",req.params._id)
    //       const filter = {_id: new ObjectId(id)}
    //       const options = { upsert: true };
    //       const updateStatus = req.body;
    //       const craft = {
    //           $set: {
    //             status:  "cancelled",
    //               status:updateStatus.status,

    //           }
    //       }
    //   const result = await bookingCollection.updateOne(filter, craft, options);
    //   res.send(result);

    //   })
    // GET user role by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });
      if (user) {
        res.send({ role: user.role });
      } else {
        res.send({ role: "user" }); // fallback role
      }
    });
    // // delivary
    // app.put('/booking-delivary/:id', async(req, res) => {
    //       console.log("ami")

    //       const id = req.params.id;
    //       console.log(req.params._id)
    //       const filter = {_id: new ObjectId(id)}
    //       const options = { upsert: true };
    //       const updateBook = req.body;
    //       console.log("updateBook",updateBook);
    //       const craft = {
    //           $set: {
    //               status:'delivary',

    //           }
    //       }
    // const result = await bookingCollection.updateOne(filter, craft, options);
    // res.send(result);

    // })

    //   //update profile
    //   app.put('/users', async(req, res) => {
    //     // console.log("ami")

    //     const email = req.query.email;
    //     // console.log("id",req.query._id)
    //     const filter = {email:email}
    //     const options = { upsert: true };
    //     const userInfo = req.body;
    //     const craft = {
    //         $set: {

    //             image: userInfo.image

    //         }
    //     }
    // const result = userCollection.updateOne(filter, craft, options);
    // res.send(result);

    // })

    //   //payment intent
    //   app.post('/create-payment-intent', async (req, res) => {
    //     const {price} = req.body;
    //     const amount = parseInt(price * 100);
    //   //  console.log({price})
    //     const paymentIntent = await stripe.paymentIntents.create({
    //       amount : amount,
    //       currency: 'usd',
    //       payment_method_types: ['card']
    //     });
    //     res.send({
    //       clientSecret: paymentIntent.client_secret
    //     })
    //   })

    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("medipro is running");
});

app.listen(port, () => {
  console.log(`medipro server is running on port ${port}`);
});
