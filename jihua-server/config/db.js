const mongoose = require('mongoose')
const mongooseURL = 'mongodb://localhost:27017/check'

module.exports = app => {
    mongoose.connect(mongooseURL, {
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
    }, () => {
        console.log('mongoose connect')
    })
}