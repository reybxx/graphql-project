const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
        x:
            {
                type: 'Number',
                min: 0,
                max: 1.0
            },
        y:
            {
                type: 'Number',
                min: 0,
                max: 1.0
            }
});

const BoardSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    editors:
        [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [PostSchema]
});

module.exports =  mongoose.model('Board', BoardSchema);