const express = require('express')
const fs = require("fs")
const cors = require('cors')
const bodyParser = require('body-parser')
const router = express.Router()
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors())
app.use(router)

// Routes LOAD API call and sends back stored number at "./api/savednumber.json" as JSON object.
router.get('/api/load', (req, res) => {
    const savedNumber = fs.readFileSync("./api/savednumber.json", "utf-8")
    console.log(savedNumber)
    res.send(JSON.parse(savedNumber))
})

// Routes SAVE API call and stores number received in body at "./api/savednumber.json" as JSON object.
router.post('/api/save', (req, res) => {
    number = req.body.num
    fs.writeFileSync("./api/savednumber.json", JSON.stringify({"num": number}), "utf-8")
    res.sendStatus(200)
})

app.listen(3001)

