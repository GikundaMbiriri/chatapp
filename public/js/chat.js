const socket=io ()
const $messageForm=document.querySelector("#message-form")
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $locationButton=document.querySelector("#send-location")
const $messages=document.querySelector("#messages")

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
// socket.on('countUpdated',(count)=>{
//     console.log('the count is updated ',count)
// })
// document.querySelector("#increament").addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increament')
// })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const messo=e.target.elements.message.value
    socket.emit('comm',messo,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
       if(error){
          return console.log(error)

        }
        console.log('message sent')
    })
})
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
    }
    }
// const autoscroll=()=>{
//     const $newMessage=$messages.lastChild
//     const newMessageStyles=getComputedStyle($newMessage)
//     const newMessageMargin=parseInt(newMessageStyles.marginBottom)
//     const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
//     const visibleHeight=$messages.offsetHeight
//     const containerHeight=$messages.scrollHeight
//     const scrollOffset=$messages.scrollTop+visibleHeight
//     if(containerHeight-newMessageHeight<=scrollOffset){
//         $messages.scrollTop=$messages.scrollHeight
//     }


// }
socket.on('message',(message)=>{
    
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
   autoscroll()
})
socket.on('locationMessage',(data)=>{
    
    console.log(data)
    const html=Mustache.render(locationTemplate,{
        username:data.username,
       url:data.url,
       createdAt:moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

  autoscroll()
})
socket.on('RoomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
       room,users
    })
    document.querySelector('#sidebar').innerHTML=html
})
$locationButton.addEventListener('click',()=>{
   if(!navigator.geolocation){
       return alert('your browser does not support geolocation.')
   }
   $locationButton.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position)=>{
      
       socket.emit('sendLocation',{
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
       },()=>{
           console.log('location shared')
           $locationButton.removeAttribute('disabled')
       })
   })
})
socket.emit('join',{username,room},(error)=>{

    if(error){
        alert(error)
        location.href='/'
    }
})