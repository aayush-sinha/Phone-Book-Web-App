const express = require('express')
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const flash = require("connect-flash")
const Contact = require("./models/contact");

//App Settings

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"))
app.set("view engine", "ejs");
app.use(flash());
const PORT = process.env.PORT || 3000;

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//Database Connection
mongoose.set("useUnifiedTopology", true);
mongoose.connect('mongodb+srv://skylivingweb:Felix2020@@cluster0-jgx9s.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to DB!');
}).catch(err => {
    console.log('ERROR:', err.message);
})

//routes

app.get('/', paginatedResults(Contact), (req, res) => {
    let contact = res.paginatedResults.results
    Contact.countDocuments({}, function (err, count) {
        if (err) {
            console.log(err);
        } else {


            res.render("home", { contact: contact })
        }
    });

})

app.get("/addContact", function (req, res) {
    res.render("add");
})

app.post("/addContact", function (req, res) {
    Contact.create({
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
        contactDOB: req.body.contactDOB
    }, function (err, newlycreated) {
        req.flash("error", err)

    })
    req.flash("success", "New contact successfully added!")
    res.redirect("/")
})
app.get("/delete/:id", function (req, res) {
    const id = req.params.id;
    Contact.findOneAndRemove({ _id: id }, function (err) {
        if (err) {
            console.log(err);
        }
        req.flash("success", "Contact Deleted!")
        res.redirect("/");
    })
})

app.get("/contact/:id/edit", function (req, res) {
    Contact.findById(req.params.id, function (err, contact) {
        if (err) {
            res.render("/");
        }
        else {
            res.render("update", { contact: contact });
        }
    });
});

app.put("/contact/:id", function (req, res) {
    Contact.findByIdAndUpdate(req.params.id, req.body.contact, function (err, updatedContact) {
        if (err) {
            res.redirect("/");
        } else {
            req.flash("success", "Contact has successflly updated")
            res.redirect("/");
        }
    })
})

app.put("/addContact", function (req, res) {
    Contact.create({
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        contactEmail: req.body.contactEmail,
        contactDOB: req.body.contactDOB
    })
    res.redirect("/")
})

app.post('/search/', function (req, res, next) {
    var searchTerm = req.body.filterbar;
    var searchType = req.body.filter;

    if (searchType == 'a') {
        var filterParameter = {
            contactName: { $regex: `^${searchTerm}`, $options: "i" }
        }
    } else if (searchType == 'b') {
        var filterParameter = {
            contactPhone: searchTerm
        }
    } else if (searchType == 'c') {
        var filterParameter = {
            contactEmail: searchTerm
        }
    }

    var contactQuery = Contact.find(filterParameter);

    contactQuery.exec(function (err, data) {
        if (err) throw err;
        data.sort(dynamicSort("contactName"));

        res.render('home', { contact: data });
    });
})

function dynamicSort(property) {
    var sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    }
}

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = 4

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        if (endIndex < await model.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }
        try {
            results.results = await model.find({}, null, { sort: { contactName: 1 } }).limit(limit).skip(startIndex).exec()
            res.paginatedResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}


//App Listen
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
