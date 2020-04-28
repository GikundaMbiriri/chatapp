const path=require('path')
const http=require('http')
const {generateMessage,generateLocation}=require('../src/utils/message')
const {addUser,removeUser,getUser,getUsersInRoom}=require('../src/utils/users')
const express=require ('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const app=express()
const port=3000
const server=http.createServer(app)
const io=socketio(server)
const publicDirectoryPath=path.join(__dirname,'../public')
app.use (express.static(publicDirectoryPath))
// let count=0
//let message='welcome'
io.on('connection',(socket)=>{
    console.log('new web connection')
    // socket.emit('countUpdated',count)
    // socket.on('increament',()=>{
    //     count++
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
        
    // })
    socket.on('join',(options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options})
        if(error){
          return  callback(error)
        }
        socket.join(user.room)
        socket.broadcast.to(user.room).emit('admin',text=generateMessage(user.username,`${user.username} has joined`))
    socket.emit('message',text=generateMessage('admin','welcome!'))
    
    io.to(user.room).emit('RoomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    callback()
    })
    socket.on('comm',(messo,callback)=>{
        const user=getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(messo)){
            return callback('profinity is not allowed')
        }
       io.to(user.room).emit('message',text=generateMessage(user.username,messo))
       callback()
    })
    
    socket.on('sendLocation',(cods,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocation('user.username',`https://google.com/maps?q=${cods.latitude},${cods.longitude}`))
        callback()
    })
    
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
        io.to(user.room).emit('message',text=generateMessage('admin',`${user.username} has left!`))
        }
        io.to(user.room).emit('RoomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    })
})
server.listen(port,()=>{
    console.log(`app is up on port ${port}`)
})