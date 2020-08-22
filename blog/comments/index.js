const express = require('express')
const bodyParser = require('body-parser')
const {randomBytes} = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

// where we're storing our comments. contains keys (post ids) and values (comments array for post)
const comments = {}

// example comments object
// comments = {'post123': [{'commentId': 'comment123', 'content': 'first comment on post123'}]}

// GET no longer in use given query service
app.get('/posts/:id/comments', (req, res) => {
	res.send( comments[req.params.id] || [] )
})

app.post('/posts/:id/comments', async (req, res) => {
	// our post id
	const postId = req.params.id

	// create new comment
	const {content} = req.body
	const commentId = randomBytes(4).toString('hex')
	const newComment = {postId, id: commentId, content, status: 'pending'}

	// either we grab array of comments for this post or create new array if no comments exist
	const commentsForPost = comments[postId] || []

	// push our new comment into array of comments for this post
	commentsForPost.push(newComment)

	// save our comments array for this post back to our large comments object
	comments[postId] = commentsForPost

	await axios.post('http://event-bus-srv:4005/events', {
		type: 'CommentCreated', 
		data: {
			id: commentId,
			content,
			postId,
			status: 'pending'
		}
	})

	res.status(201).send(comments[postId])
})

app.post('/events', async (req, res) => {
	console.log(req.body.type)
	if (req.body.type === 'CommentModerated') {
		const {id, postId, status} = req.body.data
		const moderatedComment = comments[postId].find(comment => comment.id === id)
		moderatedComment.status = status
		await axios.post('http://event-bus-srv:4005/events', {
			type: 'CommentUpdated',
			data: moderatedComment
		})
	}
	res.send({'status':'OK'})
})

app.listen(4001, () => {
	console.log('Listening on 4001')
})