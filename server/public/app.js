const socket = io('ws://localhost:3500')


const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')

// Get the user data from localStorage



socket.on('data', (data) => {
    console.log('Retrived Room:', data);
    data.room.forEach((room, i) => {
        var newElement = document.createElement('option');

        // Set text content of the element
        newElement.textContent = room.roomName;
        newElement.value = room.roomName;

        chatRoom.appendChild(newElement);

        var jsonData = localStorage.getItem('userData');
        var data = JSON.parse(jsonData);


        if (data?.name && data?.room) {

            console.log("name=" + data.name, "room=" + data.room)
            nameInput.value = data.name;
            chatRoom.value = data.room;

        } else {
            chatRoom.selectedIndex = 0;
        }

    });
});




function getRandomHexColor() {
    // Generate random values for red, green, and blue components
    var red = Math.floor(Math.random() * 256);
    var green = Math.floor(Math.random() * 256);
    var blue = Math.floor(Math.random() * 256);

    // Convert decimal to hexadecimal and ensure two digits
    var redHex = ('0' + red.toString(16)).slice(-2);
    var greenHex = ('0' + green.toString(16)).slice(-2);
    var blueHex = ('0' + blue.toString(16)).slice(-2);

    // Concatenate the components to form the hex color code
    var hexColor = '#' + redHex + greenHex + blueHex;

    return hexColor;
}

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});


function sendMessage(e) {
    e.preventDefault()
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        })
        msgInput.value = ""
    } else {
        Toast.fire({
            icon: "error",
            title: "กรอกชื่อและห้องแชทก่อนค่าาา"
        });
    }
    msgInput.focus()
}

function enterRoom(e) {
    e.preventDefault()

    data = {
        name: nameInput.value,
        room: chatRoom.value
    }
    var jsonData = JSON.stringify(data);
    localStorage.setItem('userData', jsonData);
    console.log('Data saved to localStorage.');

    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = ""
    const { name, text, time } = data

    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput.value) li.className = 'post post--right'
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--left'
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header 
        ${name === nameInput.value
                ? 'post__header--user'
                : 'post__header--reply'
            }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`
    } else {
        li.innerHTML = `<div class="post__text ">${text}</div>`
    }
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})

let activityTimer
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    // Clear after 3 seconds 
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})

socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        usersList.innerHTML = `<em>ผู้ใช้ในห้องแชท ${chatRoom.value} :</em>`
        users.forEach((user, i) => {

            var newElement = document.createElement('p');

            // Set text content of the element
            newElement.textContent = user.name;
            newElement.classList.add('badge');
            newElement.style.backgroundColor = getRandomHexColor();
            newElement.style.marginRight = "5px";

            // Append the newly created element to the container
            usersList.appendChild(newElement);

            /*   document.createElement('p').textContent = ` ${user.name}`
              if (users.length > 1 && i !== users.length - 1) {
                  usersList.textContent += ","
              } */
        })
    }
}

function showRooms(rooms) {

    roomList.textContent = ''
    if (rooms) {
        roomList.innerHTML = '<em>ห้องปัจจุบัน :</em>'
        rooms.forEach((room, i) => {
            var newElement = document.createElement('p');
            console.log(room)
            // Set text content of the element
            newElement.textContent = room;
            newElement.classList.add('badge');
            newElement.style.backgroundColor = getRandomHexColor();
            newElement.style.marginRight = "5px";

            // Append the newly created element to the container
            roomList.appendChild(newElement);
            //roomList.classList.add('badge');
            /*    if (rooms.length > 1 && i !== rooms.length - 1) {
                   roomList.textContent += ","
               } */
        })
    }
}

console.log('Retrieved data from localStorage:', data);