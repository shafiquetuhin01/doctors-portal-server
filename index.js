const express = require('express')
const app = express()
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from doctors portal!')
})

app.listen(port, () => {
  console.log(`My port is listening as ${port}`)
})