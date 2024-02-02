// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let Peer = window.Peer;

let messagesEl = document.querySelector('.messages');
let peerIdEl = document.querySelector('#connect-to-peer');
let videoEl = document.querySelector('.remote-video');
let message_input = document.querySelector('#message_input');
let conneted = false;
let mconn =null;

let sendmsg = () => {
  if (mconn!=null){
    logMessage(`send: ${message_input.value}`);
    mconn.send(message_input.value);
    message_input.value="";
  }
};
window.sendmsg = sendmsg;

let logMessage = (message) => {
  let newMessage = document.createElement('div');
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

let renderVideo = (stream) => {
  videoEl.srcObject = stream;
};

let url = window.location.href;
let myid1 = url.match(/id=([\w-_]+)/);
let myid ="";

if(myid1!=null){
    myid = myid1[1];
}else{
    myid = ((new Date().getTime())%1000000)+""
}

console.log("myid",myid);
// Register with the peer server
let peer = new Peer(myid,{ 
  debug:3,
  host: 'v.stylee.top',
  secure:true,
  port: "8090",
  path: '/peerjs/myapp',
  config: { 'iceServers': [
	  { url: 'stun:stun4.l.google.com' },  
	]} /* , 'sdpSemantics': 'unified-plan' Sample servers, please use appropriate ones */
});

peer.on('open', (id) => {
  logMessage('My peer ID is: ' + id);
});

peer.on('error', (error) => {
  console.error(error);
});


// Handle incoming data connection
peer.on('connection', (conn) => {
  logMessage('incoming peer connection!');
  conn.on('data', (data) => {
    logMessage(`received: ${data}`);
  });
  conn.on('open', () => {
    conneted = true;
    mconn = conn;
    conn.send('hello!');
  });
  conn.on('close', () => {
    logMessage(`closed`);
  });
});

// Handle incoming voice/video connection
peer.on('call', (call) => {
  navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      call.answer(stream); // Answer the call with an A/V stream.
      call.on('stream', renderVideo);
    })
    .catch((err) => {
      console.error('Failed to get local stream', err);
    });
});


// Initiate outgoing connection
let connectToPeer = () => {
  let peerId = peerIdEl.value;
  logMessage(`Connecting to ${peerId}...`);
  
  let conn = peer.connect(peerId);
  mconn = conn;
  conn.on('data', (data) => {
    logMessage(`received: ${data}`);
  });

  conn.on('open', () => {
    conn.send('hi!');
  });
  
  navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      let call = peer.call(peerId, stream);
      call.on('stream', renderVideo);
    })
    .catch((err) => {
      logMessage('Failed to get local stream', err);
    });
};

window.connectToPeer = connectToPeer;