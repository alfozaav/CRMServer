const moongose = require('mongoose');

const ClientSchema = moongose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    seller: {
        type: moongose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

module.exports = moongose.model('Client', ClientSchema);