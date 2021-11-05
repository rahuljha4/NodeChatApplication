var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

mongoose.Promise = Promise;

var db = 'mongodb://localhost:27017/learning-node';

var Message = mongoose.model('Message', {name: String, message: String});

var messages = [];

app.get('/message', ((req, res) => {
	Message.find({}, ((error, messages) => {
		res.send(messages);
	}))
	
}));

/**
 * Simple post message function
 */
/*app.post('/message', ((req, res) => {
	var message = new Message(req.body)
	
	message.save((error => {
		if (error) {
			res.sendStatus(500)
		} else {
			// messages.push(req.body)
			io.emit('message', req.body)
			res.sendStatus(200);
		}
	}))
}));*/

/**
 * Method to save message using simple promise
 */
/*app.post('/message', ((req, res) => {
	var message = new Message(req.body)
	
	message.save().then(() => {
		io.emit('message', req.body)
		res.sendStatus(200);
	}).catch((err) => {
		res.sendStatus(500);
		console.error(err)
	})
}));*/

/**
 * Function to save message and check for bad word and multiple promise
 */
/*app.post('/message', ((req, res) => {
	var message = new Message(req.body)
	
	message.save()
	       .then(() => {
		       console.log('Saved');
		       return Message.findOne({message: 'badword'});
	       })
	       .then(censoredWord => {
		       if (censoredWord) {
			       console.log('Censored word found: ', censoredWord)
			       Message.remove({_id: censoredWord.id}, (error) => {
				       console.log('Removed censored word message')
			       })
			       return true;
		       }
		       io.emit('message', req.body)
		       res.sendStatus(200);
	       })
	       .catch((err) => {
		       res.sendStatus(500);
		       console.error(err)
	       })
}));*/


/**
 * Async & Await concept
 */
app.post('/message', (async (req, res) => {
	try {
		var message = new Message(req.body)
		
		var saveMessage = await message.save()
		console.log('Saved');
		var censoredWord = await Message.findOne({message: 'badword'});
		if (censoredWord) {
			console.log('Censored word found: ', censoredWord)
			await Message.remove({_id: censoredWord.id})
		} else {
			io.emit('message', req.body)
		}
		res.sendStatus(200);
	} catch (err) {
		res.sendStatus(500);
		console.error(err)
	} finally {
		console.log('Post Message Called')
	}
}));

io.on('connection', (socket) => {
	console.log('User connected')
})

mongoose.connect(db, (error) => {
	console.log('Mongo DB Connection', error)
})

var server = http.listen(3001, () => {
	console.log('Server is listening on port', server.address().port)
})