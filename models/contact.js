var mongoose = require("mongoose");
var contactSchema = new mongoose.Schema({
    contactName: String,
    contactPhone: Number,
    contactEmail: String,
    contactDOB: String
});


module.exports = mongoose.model("Contact", contactSchema);