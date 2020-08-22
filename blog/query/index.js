const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

// here, we want to create an aggreate data structure
// with posts and comments for each post
const posts = {}

const handleEvent = (type, data) => {
	switch(type) {
		case 'PostCreated': {
			const {id, title} = data
			posts[id] = {id, title, comments: []}
			break
		}
		case 'CommentCreated': {
			const {id, content, postId, status} = data
			posts[postId].comments.push({id, content, status})
			break
		}
		case 'CommentUpdated': {
			const {id, content, postId, status} = data
			const commentIndex = posts[postId].comments.findIndex(comment => comment.id === id)
			posts[postId].comments[commentIndex] = {id, content, status}
			break
		}
	}
}

app.get('/posts', (req, res) => {
	res.send(posts)
})

app.post('/events', (req, res) => {
	const {type, data} = req.body
	console.log(type)
	handleEvent(type, data)
	res.send({'status':'OK'})
})


app.listen(4002, async () => {
	console.log('Listening on 4002')
	// get all events that have occurred so far
	const res = await axios.get('http://event-bus-srv:4005/events')
	for (let event of res.data) {
		console.log('Processing event:', event.type)
		handleEvent(event.type, event.data)
	}
})