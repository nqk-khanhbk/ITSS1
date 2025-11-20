const express = require('express')
const app = express()
const database = require('./config/database.js');
var bodyParser = require('body-parser');
//cấu hình env
require('dotenv').config()

const port = process.env.PORT || 3000

// Middlewares: parse JSON and x-www-form-urlencoded BEFORE mounting routes
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//kết nối database
database.connect();

// Routes
const route = require('./routes/index.routes')
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
