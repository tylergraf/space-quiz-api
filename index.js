require('dotenv').config()
const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const questions = [
  {
    value: 'What is the most abundant element in the atmosphere?',
    possibleAnswers: ['Water', 'Carbon', 'Nitrogen', 'Oxygen'],
    correctAnswer: 2
  }, 
  {
    value: 'What color is the sun?',
    possibleAnswers: ['Yello', 'White', 'Red', 'Blue'],
    correctAnswer: 1
  }
]
const state = {
  questionIndex: 0,
  connections: -1,
  questions,
  answers: [],
}

io.on('connection', (socket) => {
  console.log('a user connected');
  state.connections += 1

  io.emit('state', state)

  socket.on('disconnect', () => {
    state.connections -= 1
    io.emit('state', state)

    console.log('user disconnected');
  });

});

server.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
