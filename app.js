const express = require('express')
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Contact = require("./models/contact");

//App Settings

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const PORT = process.env.PORT || 3000;

//Database Connection
mongoose.set("useUnifiedTopology", true);
mongoose.connect('mongodb+srv://skylivingweb:Felix2020@@cluster0-jgx9s.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to DB!');
}).catch(err => {
    console.log('ERROR:', err.message);
});

//App Listen
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
