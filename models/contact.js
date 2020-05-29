var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var contactSchema = new mongoose.Schema({
    contactName: { type: String, required: true, unique: true },
    contactPhone: { type: Array, required: true, unique: true },
    contactEmail: Array,
    contactDOB: String
});
contactSchema.plugin(uniqueValidator);


module.exports = mongoose.model("Contact", contactSchema);