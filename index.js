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
    value: 'How long does it take for light to travel from Sun to Earth?',
    possibleAnswers: ['1 min', '2 min', '8 min', '1 hour'],
    correctAnswer: 2
  }, 
  {
    value: 'What is the furthest known plant from the sun?',
    possibleAnswers: ['Pluto', 'Neptune', 'Jupiter', 'Mars'],
    correctAnswer: 1
  },
  {
    width: '40%',
    img: "https://cdn.vox-cdn.com/uploads/chorus_asset/file/11759533/2018_07_26_11_40_29.gif",
    value: 'What is the name of the super massive black hole at the center of the Milky Way?',
    possibleAnswers: ['Andromeda', 'Sagittarius A', 'Vega', 'Cirus'],
    correctAnswer: 1
  },
  {
    width: '50%',
    img: "https://media.newyorker.com/photos/590966ee1c7a8e33fb38d6cc/master/w_2560%2Cc_limit/Nissan-Universe-Shouts.jpg",
    value: 'What is the most abundant element in the universe?',
    possibleAnswers: ['Iron', 'Helium', 'Oxygen', 'Hydrogen'],
    correctAnswer: 3
  },
  {
    width: '75%',
    img: 'https://solarsystem.nasa.gov/system/resources/detail_files/696_dscovrepicmoontransitfull.gif',
    value: 'What is the most abundant element on Earth?',
    possibleAnswers: ['Iron', 'Silicon', 'Oxygen', 'Hydrogen'],
    correctAnswer: 2
  },
  {
    width: '50%',
    img: "https://images.newscientist.com/wp-content/uploads/2022/01/25092122/PRI_220088795.jpg",
    value: 'What is the name of this telescope?',
    possibleAnswers: ['Subaru', 'Hubble', 'James Webb', 'Gemini'],
    correctAnswer: 2
  },
  {
    width: '50%',
    img: "https://cdn.theatlantic.com/thumbor/gjwD-uCiv0sHowRxQrQgL9b3Shk=/900x638/media/img/photo/2019/07/apollo-11-moon-landing-photos-50-ye/a01_40-5903/original.jpg",
    value: 'What year did man first land on the moon?',
    possibleAnswers: ['1969', '1975', '1965', '1980'],
    correctAnswer: 0
  },
  {
    width: '50%',
    img: "https://wp.usatodaysports.com/wp-content/uploads/sites/88/2013/03/olympus-mons-comparison.png",
    value: 'On what planet is the tallest mountain, Olympus Mons?',
    possibleAnswers: ['Earth', 'Venus', 'Moon', 'Mars'],
    correctAnswer: 3
  },
  {
    width: '50%',
    img: "https://res.cloudinary.com/tgraf/image/upload/v1665272729/space/New_Supercomputer_Simulation_Sheds_Light_on_Moons_Origin_dyccjw.webp",
    value: 'What is the name of the mars-sized planet that hit Earth to form the moon?',
    possibleAnswers: ['Theia', 'Haumea', 'Ceres', 'Eres'],
    correctAnswer: 0
  }
]
const state = {
  questionIndex: 0,
  connections: -1,
  questions,
  answers: [],
  users: []
}

const latency = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  state.connections += 1

  io.emit('state', state)

  socket.on('disconnect', () => {
    state.connections -= 1
    io.emit('state', state)

    console.log('user disconnected');
  });

  socket.on('nextQuestion', () => {
    if(state.questionIndex < state.questions.length-1){
      state.questionIndex += 1
      io.emit('state', state)
    }
  })
  socket.on('prevQuestion', () => {
    if(state.questionIndex > 0){
      state.questionIndex -= 1
      io.emit('state', state)
    }
  })

  socket.on('setAnswer', ({ user, index }) => {
    state.answers[state.questionIndex] = state.answers[state.questionIndex] || {}
    state.answers[state.questionIndex][user.id] = index
    io.emit('state', state)
  })
  
  socket.on('setUser', (user) => {
    const index = state.users.findIndex(u=>u.id === user.id)
    if(index > -1){
      state.users[index] = user
    } else {
      state.users.push(user)
    }
    
    io.emit('state', state)
  })
  
  socket.on('pong', ({userId, timestamp, index})=>{
    latency[userId] = latency[userId] || []
    latency[userId].push(Date.now()-timestamp)
    if(index < 10){
      socket.emit('ping', {index: index+1, timestamp: Date.now()})
    } else {
      const sum = latency[userId].reduce((a, b) => a + b, 0);
      const avg = (sum / latency[userId].length) || 0;
      socket.emit('latency', avg)
    }
  })

  socket.on('checkLatency', () => {
    socket.emit('ping', {index: 0, timestamp: Date.now()})
  })

  socket.on('playSound', (data) => {
    io.emit('playSound', data)    
  })
});

server.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
