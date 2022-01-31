const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true,
        minlength: 8    // Validator
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        validator(value) {
            if(value < 0) throw Error('Invalid age')    // Validator
        }
    }
})

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })
    if(!user) throw new Error('Invalid Credentials')

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) throw new Error('Invalid Credentials')

    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'mysecret')
    return token
}

const User = mongoose.model('User', userSchema)

module.exports = User