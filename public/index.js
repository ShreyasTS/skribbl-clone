const socket = io();
brushsize = 1;
let canSendCords = true;
let sendTick = 0, recieveTick = 0;
var chatText = "";
let playerCount = 0;

const canvas = document.querySelector('#canvas');
let uNameField, chatField, sendBtn, userNameBtn;

chatField = document.getElementById('chatField');
sendBtn = document.getElementById('sendMsgBtn');
let chatContainer = document.getElementById('chat-container');
let playerTable = document.getElementById('playerList');
let guessField = document.getElementById('guessWordField')


window.addEventListener('load', () => {
    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener("touchstart", startPainting);
    canvas.addEventListener("touchend", stopPainting);
    canvas.addEventListener('mouseup', stopPainting);
    document.addEventListener('mousemove', sketch);
    canvas.addEventListener('wheel', brushSize);


});


let coord = { x: 0, y: 0, brushsize: brushsize };


let paint = false;


function getPosition(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
    if ((coord.x < 0 || coord.y < 0) || (coord.x > 800 || coord.y > 600)) {
        stopPainting();
    }
    else if (canSendCords) {
        sendPosition(coord.x, coord.y);
        return;
    }
}

function startPainting(event) {
    paint = true;
    getPosition(event);
    socket.emit('startPaint', paint);
}
function stopPainting() {
    paint = false;
    socket.emit('startPaint', paint);
    sendTick = 0;

}

function sendPosition(Xpos, Ypos) {
    socket.emit('position', { x: Xpos, y: Ypos, brushsize: brushsize });
    sendTick++;
}

function brushSize(event) {
    if (event.deltaY < 0 && brushsize < 10) {
        brushsize += 1;
    } else if (brushsize > 1) {
        brushsize -= 1;
    }
}

function sketch(event) {
    if (!paint) return;
    ctx.beginPath();
    ctx.lineWidth = brushsize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'green';
    ctx.moveTo(coord.x, coord.y);
    getPosition(event);
    ctx.lineTo(coord.x, coord.y);
    ctx.stroke();
}


userNameBtn.addEventListener("click", () => {
    socket.emit('uname', uNameField.value);
    userNameBtn.disabled = true;
    sendBtn.disabled = false;

});

sendBtn.addEventListener("click", () => {
    if (chatField.value.length > 0) {
        socket.emit('newChatMsg', chatField.value);
        chatContainer.innerHTML += "<div><b>" + chatField.value + "<b></div><br>";
    }
});

socket.on('newmsg', receivedMsg => {
    chatText = "<div><b>" + receivedMsg + "<b></div><br>";
    chatContainer.innerHTML += chatText;
});


socket.on('welcome', message => {
    console.log(message);
});

socket.on('startPaint', Canpaint => {
    paint = Canpaint;
    if (!paint) {
        recieveTick = 0;
    }

});



socket.on('wordCount', guessWord => {
    var dashStr = "(" + String(guessWord) + "): ";
    for (let count = 0; count < guessWord; count++) {
        dashStr += "_ ";
    }
    guessField.innerText += dashStr;
    console.log("Guess the word: ", guessWord);
});


socket.on('correctGuess', correctWord => {
    guessField.innerText = "CORRECT: " + correctWord;
    console.log("WINNER!");
    sendBtn.disabled = true;

});

socket.on('newPlayerJoin', playerObj => {
    //console.log("newPlayer joined...", playerObj)
    let row = playerTable.insertRow(-1);
    //row.inserCell()
    //=-------------------------------------------------------------------
});

socket.on("hey", data => {
    console.log(data);
});

socket.on("disconnect", () => {
    console.log("SERVER DISCONNECTED: ", socket.disconnected)
});


// Listen for messages from the server
socket.on('otherPOS', position => {
    recieveTick++;
    paint = true;
    ctx.beginPath();

    ctx.lineWidth = position.brushsize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'red';
    if (recieveTick == 1) {
        ctx.moveTo(position.x, position.y);
    } else {
        ctx.moveTo(coord.x, coord.y);
    }
    ctx.lineTo(position.x, position.y);
    coord.x = position.x;
    coord.y = position.y;
    ctx.stroke();
    paint = false;
});


//socket.emit('message', sendText);
