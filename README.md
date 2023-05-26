# Skribbl.io clone 🎨

###  What is skribbl.io?
Skribbl Game Clone: A multiplayer online drawing and guessing game inspired by [Skribbl.io](http://skribbl.io "Skribbl.io"), implemented using Node.js and Socket.io.
This project allows players to take turns and draw a given word while other players try to guess it. With real-time communication through Socket.io, players can chat, exchange drawings, and compete in a lively and interactive gaming environment. Join the fun and unleash your artistic skills in this exciting Skribbl game clone. 🎨
This is my first attempt to make a clone of an actual game.

------------

###  How to Play?
- First player to join the game is the host and all the other players must wait untill the host begins the game.
- Once the game starts, you will be assigned a word to draw.
- Use the drawing tools provided to create a picture related to your word.
- Other players will try to guess the word based on your drawing.
- Simultaneously, you can also guess what others are drawing by typing your answer into the chatbox.
- Players also get to vote if the drawing is good or not. (👍🏻 or 👎🏻)
- The faster you guess correctly, the more points you earn.
- The game proceeds with each player taking turns drawing and guessing.
- Enjoy the lively chat and interactions with other players throughout the game.

------------
###  How to Run the server?
##### Required Packages:
######  [Express JS](http://www.npmjs.com/package/express "Express JS")
`$ npm install express`

######  [socket.io](http://www.npmjs.com/package/socket.io "socket.io")
`$ npm install socket.io`

##### To run the game server:
`$ node server.js`

The game will then be accessible at [localhost:3000](http://localhost:3000 "localhost:3000"). The default port is 3000, however this can be changed in the server code, or enter the server IP address and port after [port forwarding](https://en.wikipedia.org/wiki/Port_forwarding "port forwarding").

------------
###  For Game Admin:
###### Commands are available to tweek the server settings from the chat.
Use `//admin {admin-password} {command} {player-name}*(optional) {value}*(optional)` to make changes.
###### Some of the available options are:
- **`kickall`** Example: `//admin {admin-password} kickall` Kicks all the connected players and restarts the game.
- **`kick`** Example: `//admin {admin-password} kick {player-name}` Kicks specific player from the game.
- **`givePoints`** Example: `//admin {admin-password} givePoints {player-name}` Adds specified points to the player.
- **`setdrawtime`** Example: `//admin {admin-password} setdrawtime {value *in seconds}` Sets the time given to draw the word.
- **`setchoosetime`** Example: `//admin {admin-password} setchoosetime {value *in seconds}` Sets the time given to choose a word.
- **`restart`** Example: `//admin {admin-password} restart ` Restarts the game for all players.

------------
###  Contributions:
If you are interested in this project, make sure to add it to your favorites or give a ⭐ to get the latest updates.
I am open to improvements especially in the server code.
Please feel free to clone this repository and modify or improve anything as you wish.
Check out my other games 👉🏻 [here](https://shreyas-rao.itch.io/ "here")
 
