const express = require('express')
require('./db/mongoose')
const User = require('./models/user')

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
        res.status(500).send(e)
    }
})

app.post('/register', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).send(user)
    } catch(e) {
        res.status(500).send(e)
    }
})

app.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        console.log(e)
        res.status(500).send({Error: "Invalid Credentials"})
    }
})

app.patch('/update/:id', async (req, res) => {
    const id = req.params.id
    const updates = Object.keys(req.body)
    try {
        const user = await User.findById(id)
        updates.forEach((update) => {
            user[update] = req.body[update]
        })        
        await user.save()
        if(!user) return res.status(404).send({Error: "No user found!"})
        res.send(user)
    } catch(e) {
        res.status(500).send(e)
    }
})

app.listen(port, () => {
    console.log('Server is up at port ' + port)
})