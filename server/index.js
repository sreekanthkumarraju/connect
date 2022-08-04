const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const authRoutes=require('./routes/userAuth')
const messageRoute=require('./routes/messagesRoutes')
const socket=require('socket.io')


const app=express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})


const db=mongoose.connection

db.on("error",console.error.bind(console,"connection error"))

db.once("open",function(){
    console.log("connected successfully")
})


app.use('/user/auth',authRoutes)
app.use('/user/messages',messageRoute)



const server=app.listen(process.env.PORT,function(){
    console.log('server is running on port',process.env.PORT)

})

//SocketIO needs HTTP server to work-- initialize Socket.IO and connect to our server.
//This enables CORs and ensures that our frontend, running on a different server can connect to our backend
const io=socket(server,{
    cors:{
        origin:"http://localhost:3000",            //in case server and client run on different urls
        credentials:true,
    },

})

global.onlineUsers =new Map()
//storing all of online users in the Map

// set up a connection event listener between the server and the client  --> we're setting up a socket namespace called connection which is where clients will connect to.
//io.on(‘connection’, callback) is invoked when a client is connected, i.e., when someone opens the app
   io.on("connection",(socket)=>{
       //storing chatsocket inside globalchatsocket
      global.chatSocket= socket;
      // whenever user is logged in  --establishing a socket connection 

       //Here we listen on a new namespace called "add-user"
      socket.on("add-user",(userId)=>{   // receiving a message from client
         onlineUsers.set(userId,socket.id)
         // storing userId and current socket ID inside Map
     });

     // Here we listen on a new namespace called "send-msg"  --> whenever there is send -msg socket emitted 
    socket.on("send-msg",(data) =>{
         const sendUserSocket=onlineUsers.get(data.to);
         // will check receiver is in online  or not
         // if not in online --store data in database 
         if(sendUserSocket)
           socket.to(sendUserSocket).emit("msg-receive",data.message)  // sending a message to client using emit  socket.emit("msg-receive",data.message); is where we emit the data through the socket. We emit the data on the msg-receive  namespace 
    }) 
})

