const express = require('express')
const bodyParser = require('body-parser')
const {randomBytes} = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

// where we're storing our posts -- an object containing subobjects (posts)
const posts = {}

// example posts object
// posts = {'post123': {'id': 'post123', 'title': 'first title'}}

// GET no longer in use given query service
app.get('/posts', (req, res) => {
	res.send(posts)
})

// randomly generate an id, store with the user's req.body
app.post('/posts/create', async (req, res) => {
	const id = randomBytes(4).toString('hex')
	// need body parser for this
	const {title} = req.body

	posts[id] = {
		id, title
	}

	await axios.post('http://event-bus-srv:4005/events', {
		type: 'PostCreated', 
		data: {
			id,
			title
		}
	})
	// indicates we created a resource (201), then send
	res.status(201).send(posts[id])
})

app.post('/events', (req, res) => {
	console.log('Received Event: ', req.body.type)
	res.send({})
})

app.listen(4000, () => {
	console.log('Version 55')
	console.log('Listening on 4000')
})