const express = require('express');
const path = require('path');
const bodyparser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs')
const csv = require('csv-parser')



const router = require('./router');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');

// load static assets
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.use(session({
    secret: uuidv4(), //  '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    resave: false,
    saveUninitialized: true
}));

app.use('/route', router);


app.get('/', async(req, res) =>{

       
    var results = [];
    await fs.createReadStream('./students.csv')
    .pipe(csv({}))
    .on('data', (data)=> results.push(data))
    .on('end', async() => {
    
        res.render('base', { title: "Student Record", results });
    })
});


app.listen(port, ()=>{ console.log("Listening to the server on http://localhost:3000")});