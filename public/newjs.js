const socket = io({
    autoConnect: false
});

brushsize = 1;
let canSendCords = true;
let sendTick = 0, recieveTick = 0;
let playerCount = 0;
var chatString = "";
let chatArea = document.getElementById("chat-container");
let chatText = document.getElementById('chatField');
let chatForm = document.getElementById('chat-form');
let wordCounter = document.getElementById('wordcounter');
let chatSendBtn = document.getElementById('sendMsgBtn');
let guessField = document.getElementById('guessWordField')

let coord = { x: 0, y: 0, brushsize: brushsize };
let paint = false;
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
var pName = "";
var isHost = false;
var hasGameStarted = false;
var canDraw = false;
var canChooseWord = true;
var guessWord = "";
var guessedPlayer = false;
var atleastOneGuessed = false;
var audioMute = false;

var penColor = "#000000";


loginDiv = `
<div id="overlay" onclick=""></div>
<div class="loginArea">
    <h1>Skribbl✍️</h1>
    <hr>
    <br>
    
    <form id="loginForm">
        <input id="playerName" type="text" maxlength="20" placeholder="nickname" autocomplete="off"
            autofocus>
        <input  id="loginButton" type="button" onclick="loginToGame()" value="DRAW!">
    </form>
    <button  id="randomName" onclick="randomNameGen()">🎲</button>
</div>
`;

hostDiv = `<div id="overlay" onclick=""></div>
<div class="loginArea" style="width: 350px; height: 230px;">
  <br>
  <h1>You are the host...</h1>
  <h1>Press start to begin</h1>
  <hr>
  <br>
  <button id="startGame" onClick="startGame()" style="padding: 5px; width: 100px; height: 30px;">
    Let's Draw!
  </button>
</div>`;

waitingDiv = `  
<div id="overlay" onclick=""></div>
<div style="height: 215px;" class="loginArea">
  <br>
  <h1>Waiting for the host...</h1>
  <img width="50px"  src="/images/loadingGif.gif">
  
</div>`;

choosingWord = ``;

votingDiv = ` <button onclick="voteUp();document.querySelector('.voting').innerHTML='';"><img id="thumbsUp" src="images/thumbsUp.gif"></button>
<button onclick="voteDown();document.querySelector('.voting').innerHTML='';"><img id="thumbsDown" src="images/thumbsDown.gif"></button>`;


window.addEventListener('load', () => {

    let playerName = document.getElementById('playerName');

    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mouseup', stopPainting);
    document.addEventListener('mousemove', sketch);
    canvas.addEventListener('wheel', brushSize);
    canvas.addEventListener('onmouseout', stopPainting);
});

let loginContainer = document.getElementById('login-container');
loginContainer.innerHTML = String(loginDiv);

function getPosition(event) { //Getting the mouse position
    if (canDraw) {
        coord.x = event.clientX - canvas.offsetLeft;
        coord.y = event.clientY - canvas.offsetTop;
        if ((coord.x < 0 || coord.y < 0) || (coord.x > 800 || coord.y > 600)) {
            stopPainting();
        }
        else if (canSendCords) {
            sendPosition(coord.x, coord.y); // @Networking
            return;
        }
    }
}

class sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            if (!audioMute) {
                console.log("Playing sound!");
                this.sound.play();
            }
        };
    }
}

function audioToggle(){
    audioMute = !audioMute;
    if(audioMute){
        document.getElementById('audioControl').src = "images/audioOff.gif"
    }else{
        document.getElementById('audioControl').src = "images/audioOn.gif"

    }
}

function startPainting(event) { //Setting the canvas to drawable or not
    paint = true;
    getPosition(event);
    socket.emit('startPaint', paint);
}
function stopPainting() { //Setting the canvas to drawable or not
    paint = false;
    socket.emit('startPaint', paint);
    sendTick = 0;
}

function brushSize(event) {
    if (event.deltaY < 0 && brushsize < 10) {
        brushsize += 1;
    } else if (brushsize > 1) {
        brushsize -= 1;
    }
}

function setColor(hexValue) {
    if (canDraw) {
        socket.emit('penColor', hexValue);
    }
}

socket.on('startPaint', paintStatus => {
    paint = paintStatus;
    if (!paint) {
        recieveTick = 0;
    }
})


function sketch(event) {
    if (!paint) return;
    if (canDraw) {
        ctx.beginPath();
        ctx.lineWidth = brushsize;
        ctx.lineCap = 'round';
        console.log(penColor);
        ctx.strokeStyle = penColor;
        ctx.moveTo(coord.x, coord.y);
        getPosition(event);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
    }
}

window.onbeforeunload = function (event) {
    //return confirm("Confirm refresh");
};



chatForm.addEventListener('submit', event => {
    chatString = "";
    wordcounter.innerHTML = `(${chatString.length})`;
    chatText.value = ""
    chatText.focus();
    event.preventDefault();
});



document.getElementById('loginForm').addEventListener('submit', event => {
    event.preventDefault();
    loginToGame();

});

chatText.addEventListener('input', event => {
    chatString = chatText.value;
    wordcounter.innerHTML = `(${chatString.length})`;

    if (chatString.length == 0)
        wordcounter.innerHTML = "";

});

function enableChat() {
    chatSendBtn.disabled = false;
    chatText.disabled = false;
}

function updateSendChat() {
    chatText.focus();
    if (chatString.length > 0 && canDraw == false || chatString.includes("//admin")) {
        var msg = `<div class="chat-message"><b>${pName}: </b><pre><code><xmp>${chatText.value}</xmp></pre></code> </div>`;
        sendMsg = ([pName, chatText.value]);
        socket.emit('updateText', sendMsg);//JSON.stringify(sendMsg)
        //chatArea.innerHTML = msg + chatArea.innerHTML;

        chatString = "";
        wordcounter.innerHTML = `(${chatString.length})`;
        chatText.value = ""
    }
}

function addContentToChat(chatPlayerName = "Server", chatContent, color = "black", bgColor = "white") {

    if (chatPlayerName == "Server") {
        if (color == "red") {
            var msg = `<div class="chat-message" style=" color:${color};background-color:rgb(252, 153, 153);"><b>${chatPlayerName}: </b><pre><code><xmp>${chatContent}</xmp></pre></code> </div>`;

        } else {
            var msg = `<div class="chat-message" style=" color:${color};background-color:light${bgColor};"><b>${chatPlayerName}: </b><pre><code><xmp>${chatContent}</xmp></pre></code> </div>`;
        }
    } else {
        var msg = `<div class="chat-message"><b>${chatPlayerName}: </b><pre><code><xmp>${chatContent}</xmp></pre></code> </div>`;
    }
    chatArea.innerHTML = msg + chatArea.innerHTML;
}


function voteUp() {
    socket.emit('vote', [pName, "up"]);
}
function voteDown() {
    socket.emit('vote', [pName, "down"]);
}

socket.on('vote', voteStatus => {
    if (voteStatus[1] == "up") {
        addContentToChat(undefined, `${voteStatus[0]} liked the drawing.`, "green", "green");
    }
    if (voteStatus[1] == "down") {
        addContentToChat(undefined, `${voteStatus[0]} disliked the drawing.`, "red");
    }
});

score = 0;
class PlayerContainer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.players = [];
    }

    addPlayer(playerId, playerScore) {
        score = playerScore;
        const player = document.createElement('div');
        player.classList.add('player');
        player.setAttribute('data-id', playerId);
        player.setAttribute('data-score', playerScore);
        player.innerHTML = `<div class="player-div"><div class="player-name"></b><pre><code><xmp>${player.getAttribute('data-id')}</xmp></pre></code></div>  <div class="player-score">${player.getAttribute('data-score')}</div> </div>`;
        this.players.push(player);
        this.container.appendChild(player);
        this.sortPlayersByScore();
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(player => player.getAttribute('data-id') === playerId);
        if (index >= 0) {
            this.players.splice(index, 1);
            const player = this.container.querySelector(`[data-id="${playerId}"]`);
            this.container.removeChild(player);
        }
    }

    rearrangePlayers() {
        this.players.forEach((player, index) => {
            player.style.order = index;
        });
    }

    highlightPlayer(playerName) {
        const playerDiv = this.container.querySelector(`.player[data-id="${playerName}"]`);

        if (playerDiv) {
            playerDiv.querySelector(".player-div").classList.add('drawingPlayer');
        }
    }

    unhighlightPlayer(playerName) {
        const playerDiv = this.container.querySelector(`.player[data-id="${playerName}"]`);

        if (playerDiv) {
            playerDiv.querySelector(".player-div").classList.remove('drawingPlayer');
        }
    }

    sortPlayersByScore() {
        this.players.sort((a, b) => b.getAttribute('data-score') - a.getAttribute('data-score'));
        this.rearrangePlayers();
        this.addCrownToFirst();
    }

    addCrownToFirst() {
        if (this.players[0].getAttribute('data-score') > 0) {
            this.players[0].innerHTML = `<div class="player-div"> <img width="30px" height="30px"  src="images/crown.png"> <div class="player-name">${this.players[0].getAttribute('data-id')}</div>  <div class="player-score">${this.players[0].getAttribute('data-score')}</div> </div>`;
        }
        for (let index = 1; index < this.players.length; index++) {
            const element = this.players[index];
            if (element.getAttribute('data-score') > 0) {
                element.innerHTML = `<div class="player-div"><div class="player-name"></b><pre><code><xmp>${element.getAttribute('data-id')}</xmp></pre></code></div>  <div class="player-score">${element.getAttribute('data-score')}</div> </div>`;
            }
        }
    }

    markWinnerCelebrate() {
        this.players[0].classList.add('winner');

    }

    markCorrectGuess(playerName) {
        const playerDiv = this.container.querySelector(`.player[data-id="${playerName}"]`);

        if (playerDiv) {
            playerDiv.querySelector(".player-div").classList.add('correctGuessPlayer');
        }
    }

    resetCorrectGuess() {
        var p = this.getPlayers();
        p.forEach(element => {
            const playerDiv = this.container.querySelector(`.player[data-id="${element}"]`);

            if (playerDiv) {
                playerDiv.querySelector(".player-div").classList.remove('correctGuessPlayer');
            }
        });
    }

    getPlayers() {
        return this.players.map(playerDiv => playerDiv.getAttribute('data-id'));
    }

    updatePlayerScore(player_id, newScore) {
        this.players.forEach(p => {
            if (p.getAttribute('data-id') == player_id) {
                p.setAttribute('data-score', newScore);
            }
        });
        this.sortPlayersByScore();
    }
}
const playerContainer = new PlayerContainer('player-container');

function startGame() {
    socket.emit('startGame');
    loginContainer.innerHTML = "";
}



// ######## NETWORKING ########
//------------------------------------------------------------------------------------

function sendPosition(Xpos, Ypos) {
    if (canDraw) {
        socket.emit('position', { x: Xpos, y: Ypos, brushsize: brushsize });
        sendTick++;
    }

}

socket.on('welcom', msg => {
    console.log(msg);
});

var pName = "";

function loginToGame() {
    pName = playerName.value;
    document.title = `Skribbl->${pName}`;
    if (pName.length > 0 && pName !== "" && pName != " ") {
        enableChat();
        pName = pName.trim();
        socket.connect();
        playerContainer.addPlayer(pName, 0);
        socket.emit('playerName', pName)
        loginContainer.style.height = "200px";
        loginContainer.innerHTML = waitingDiv;
        chatText.focus();
    } else {
        console.log("INVALID LOGIN!");
    }
}

function randomNameGen() {
    var nameList = ["Buddy", "King", "Champ", "Bro", "Amigo", "Tiny", "Chief", "Pal", "Bee", "Boo", "Bug", "Scout", "Boomer", "Punk", "Ace"];
    var randomName = nameList[Math.floor(Math.random() * nameList.length)];
    playerName.value = randomName;
}


socket.on('newPlayerJoined', newPlayerName => {
    var joinSound = new sound("/sfx/joinGame.mp3");
    joinSound.play();
    console.log(newPlayerName, " joined 👋🏻");
    addContentToChat(undefined, newPlayerName + " joined 👋🏻", "green");
    playerContainer.addPlayer(newPlayerName, 0);
});

socket.on('playersList', playersList => {
    pList = JSON.parse(playersList);
    for (const player in pList) {
        if (player != pName) {
            playerContainer.addPlayer(player, pList[player]);
        }
    }
});

socket.on('hostPlayer', boolVal => {
    isHost = boolVal;
    if (isHost) {
        loginContainer.style.height = "230px";
        loginContainer.style.width = "550px";
        loginContainer.innerHTML = hostDiv;
    }
});

socket.on('wordCount', guessWordCount => {
    if (!canDraw) {
        var dashStr = "";
        guessField.innerText = "Word: ";
        dashStr = "(" + String(guessWordCount) + "): ";
        for (let count = 0; count < guessWordCount; count++) {
            dashStr += "_ ";
        }
        guessField.innerText += dashStr;
    }
});

socket.on('allGuessed', () => {
    var allGuessed = new sound("/sfx/allGuess.mp3");
    allGuessed.play();
});

socket.on('chatContent', content => {
    //content = [who, what]

    if (content[0] == "kick") {
        addContentToChat(undefined, `${content[1]} is kicked 🦵🏻`, "red");
    } else {
        if (content[1] == "almost" && !guessedPlayer) {
            addContentToChat(undefined, ` ${content[0]}'s guess is close `, "orange");
        } else {
            if (guessedPlayer && content[1].includes(guessWord)) {
                var censorWord = "";
                for (i = 0; i < content[1].length; i++) {
                    censorWord += "*";
                }
                addContentToChat(content[0], censorWord);
            } else {
                addContentToChat(content[0], content[1]);
            }
        }
    }


});

socket.on('otherPOS', position => {
    recieveTick++;
    paint = true;
    ctx.beginPath();

    ctx.lineWidth = position.brushsize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = penColor;
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

function clearCanvas() {
    if (canDraw) {
        socket.emit('clearCanvas');
    }
}

socket.on('penColor', hexValue => {
    penColor = hexValue;
    console.log('PC: ', penColor);

});

socket.on('clearCanvas', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('gameStarted', () => {
    console.log("GAME STARTED!!");
    loginContainer.innerHTML = "";
    hasGameStarted = true;

});

socket.on('wordList', wordList => {

    if (canDraw) {
        var wordChooseDiv = `  
        <div id="overlay" onclick=""></div>
        <div class="loginArea" style="width: fit-content; height: fit-content;">
        <h1>Choose a word</h1>
        <button class="optBtn" id="opt1" onclick="selectedOpt('${wordList[0]}')">${wordList[0]}</button>
        <button class="optBtn" id="opt2" onclick="selectedOpt('${wordList[1]}')">${wordList[1]}</button>
        <button class="optBtn" id="opt3" onclick="selectedOpt('${wordList[2]}')">${wordList[2]}</button>
        </div>`;
        loginContainer.innerHTML = wordChooseDiv;
        console.log("YOU DRAW")
    }
});

socket.on('chosenWord', wordAndPlayer => {
    if (pName == wordAndPlayer[1]) {
        selectedOpt(wordAndPlayer[0], true);
    }
})


function selectedOpt(chosenWord, autoSelected = false) {
    if (!autoSelected) {
        socket.emit('chosenWord', chosenWord);
    }
    loginContainer.innerHTML = "";
    guessField.innerText = "Word: " + chosenWord;
}

var timerChooseReset;
socket.on('chooseStart', chooseTime => {
    timerChooseReset = timer(chooseTime);
    canChooseWord = true;
})

socket.on('chooseEnd', () => {
    canChooseWord = false;
    loginContainer.innerHTML = "";
    clearInterval(timerChooseReset);
})

var drawTimerReset;
socket.on('drawStart', drawtime => {
    var startDrawing = new sound("/sfx/startDrawing.mp3");
    startDrawing.play();
    playerContainer.resetCorrectGuess();
    clearCanvas();
    drawTimerReset = timer(drawtime);
})

function timer(timerVal) {
    var timerText = document.getElementById('timer');
    timerText.innerText = `[${timerVal}]`;
    counter = parseInt(timerVal);

    var timerFunc = setInterval(() => {
        timerText.innerText = `[${counter}]`;
        counter--;
        if (counter < 10) {
            var clockTick = new sound("/sfx/clockTick.mp3");
            clockTick.play();
        }

        if (counter < 0) {
            clearInterval(timerFunc);
            timerFunc = undefined;
        }
    }, 1000);
    return timerFunc;
}

socket.on('correctGuess', correctGuessPlayer => {
    atleastOneGuessed = true;
    var correctGuessSFX = new sound("/sfx/correctGuess.mp3");
    correctGuessSFX.play();
    playerContainer.markCorrectGuess(correctGuessPlayer[0]);
    addContentToChat(undefined, correctGuessPlayer[0] + " guessed the word.", "green", "green");
    if (pName == correctGuessPlayer[0]) {
        guessField.innerText = "Word: " + correctGuessPlayer[1];
        guessWord = correctGuessPlayer[1];
        guessedPlayer = true;
    }
});

socket.on('playerLeft', leftPlayer => {
    var leftSound = new sound("/sfx/leaveGame.mp3");
    leftSound.play();
    playerContainer.removePlayer(leftPlayer);
    addContentToChat(undefined, leftPlayer + " left :(", "red")
});

socket.on('testing', dat => {
    //console.log("TESTING: ",dat)
});

socket.on('chosenPlayer', drawingPlayer => {
    document.querySelector('.voting').innerHTML = votingDiv;
    guessedPlayer = false;
    playerContainer.getPlayers().forEach(element => {
        playerContainer.unhighlightPlayer(element); // Unhighlight all players before highlighting
    });

    playerContainer.highlightPlayer(drawingPlayer);
    console.log('Chosen Player to draw: ', drawingPlayer); // Highlight the player who will be drawing
    addContentToChat(undefined, `${drawingPlayer} is drawing`, "blue");
    if (drawingPlayer == pName) {
        document.querySelector('.voting').innerHTML = '';
        canDraw = true;
    }
    else {
        canDraw = false;
        loginContainer.innerHTML = `  <div style="width: fit-content; height: fit-content; padding-left: 30px; padding-right: 30px; background-color: white;" class="loginArea">
        <br>
        <h1>${drawingPlayer} is choosing a word</h1>
    
      </div>`;

    }
});


socket.on('drawEnd', () => {
    clearInterval(drawTimerReset);
    canDraw = false;
    clearCanvas();
    if (!atleastOneGuessed) {
        var noGuess = new sound("/sfx/noGuess.mp3");
        noGuess.play();
    }
})

socket.on('scoreBoard', scoreBoard => {
    scoreBoard.forEach(ele => {
        playerContainer.updatePlayerScore(ele[0], ele[1]);
    });
});

socket.on('gameOver', () => {
    console.log("GO!");
    playerContainer.markWinnerCelebrate();
});

socket.on("disconnect", () => {
    socket.disconnect();
    loginContainer.innerHTML = loginDiv;
    location.reload();
});

