const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const auth = require('./middleware/auth')

const app = express()
const port = 3000

app.use(express.json())

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        const compiledUsers = users.map((user) => {
            return {username: user.username, name: user.name, age: user.age}
        })
        res.send(compiledUsers)
    } catch(e) {
        res.status(500).send()
    }
})

app.post('/register', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send(user)
    } catch(e) {
        res.status(500).send()
    }
})

app.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(500).send({Error: "Invalid Credentials"})
    }
})

app.patch('/update/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })        
        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})

app.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send({error: 'Please Authenticate'})
    }
})

app.listen(port, () => {
    console.log('Server is up at port ' + port)
})