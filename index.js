const express = require('express')
const app = express()
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ada80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        console.log("My data is connected");
        const servicesCollection = client.db('doctors_portal').collection('services');
        const bookingCollection = client.db('doctors_portal').collection('booking');

        app.get('/service', async(req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/available', async(req,res)=>{
          const date = req.query.date;
          //get all services
          const services = await servicesCollection.find().toArray();
          //get the booking of that day
          res.send(services);
          const query = {date: date};
          const bookings = await bookingCollection.find(query).toArray();
          //foreach service, find that bookings for that service
          services.forEach(service=>{
            const serviceBookings = bookings.filter(b=>b.treatment === service.name);
            const booked = serviceBookings.map(s=>s.slot);
            const available = service.slots.filter(s=>!booked.includes(s));
            service.available = available; 
          })
          res.send(services);
        })
        app.post('/booking', async(req, res)=>{
          const booking = req.body;
          const query = {treatment:booking.treatment,date:booking.date,patientEmail:booking.patientEmail};
          const exists = await bookingCollection.findOne(query);
          if(exists){
            return res.send({success:false, booking:exists});
          }
          const result = await bookingCollection.insertOne(booking);
          return res.send({success:true, result});
        });

        
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from doctors portal!')
});
app.get('/collection',(req,res)=>{
  res.send('I am ready to continue my service');
});

app.listen(port, () => {
  console.log(`My port is listening as ${port}`)
});
