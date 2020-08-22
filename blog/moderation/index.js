const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

app.post('/events', async (req, res) => {
	console.log(req.body.type)
	if (req.body.type === 'CommentCreated') {
		const {id, content, postId} = req.body.data
		const status = content.includes("orange") ? 'rejected' : 'approved'
		await axios.post('http://event-bus-srv:4005/events', {
				type: 'CommentModerated',
				data: {
					id,
					postId,
					status
				}
			})
	}
	res.send({'status': 'OK'})
})


app.listen(4003, () => {
	console.log('Listening on 4003')
})


/*
app.post('/events', async (req, res) => {
	if (req.body.type === 'CommentCreated') {
		setTimeout(()=> {
			const {id, content, postId} = req.body.data
			const approved = content.includes("orange") ? false : true
			 axios.post('http://localhost:4005/events', {
					type: 'CommentModerated',
					data: {
						id,
						postId,
						approved
					}
				})
		}, 5000)
	}
	res.send({'status': 'OK'})
})
*/