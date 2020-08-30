let localStream, localPeerConnection, remotePeerConnection;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");

// Just allow the user to click on the Call button at start-up
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;

// Utility function for logging information to the JavaScript console
const log = (text) => {
  console.log(
    "At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text
  );
};

// constraints
const constraints = { audio: true, video: true };

// Callback in case of success of the getUserMedia() call
const successCallback = (stream) => {
  log("Received local stream");
  // Associate the local video element with the retrieved stream
  localVideo.srcObject = stream;
  localStream = stream;
  // We can now enable the Call button
  callButton.disabled = false;
};

const errorCallback = (err) => {
  console.log(err);
};

// Handler to be called whenever a new local ICE candidate becomes available
const gotLocalIceCandidate = (event) => {
  const candidate = event.candidate;
  if (candidate) {
    // Add candidate to the remote PeerConnection
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    log("Remote ICE candidate: \n " + candidate.candidate);
  }
};

// Handler to be called whenever a new remote ICE candidate becomes available
const gotRemoteIceCandidate = (event) => {
  const candidate = event.candidate;
  if (candidate) {
    // Add candidate to the local PeerConnection
    localPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    log("Remote ICE candidate: \n " + candidate.candidate);
  }
};

// Handler to be called as soon as the remote stream becomes available
const gotRemoteStream = (event) => {
  // Associate the remote video element with the retrieved stream
  remoteVideo.srcObject = event.streams[0];
  log("Received remote stream");
};

const onSignalingError = (err) => {
  console.log("Failed to create signaling message : " + error.name);
};

// Handler to be called when the remote SDP becomes available
const gotRemoteDescription = (description) => {
  // Set the remote description as the local description of the
  // remote PeerConnection.
  remotePeerConnection.setLocalDescription(description);
  log("Answer from remotePeerConnection: \n" + description.sdp);

  // Conversely, set the remote description as the remote description of the
  // local PeerConnection
  localPeerConnection.setRemoteDescription(description);
};

// Handler to be called when the 'local' SDP becomes available
const gotLocalDescription = (description) => {
  // Add the local description to the local PeerConnection
  localPeerConnection.setLocalDescription(description);
  log("Offer from localPeerConnection: \n" + description.sdp);

  // ...do the same with the 'pseudoremote' PeerConnection
  // Note: this is the part that will have to be changed if you want
  // the communicating peers to become remote
  // (which calls for the setup of a proper signaling channel)
  remotePeerConnection.setRemoteDescription(description);

  // Create the Answer to the received Offer based on the 'local' description
  remotePeerConnection
    .createAnswer()
    .then(gotRemoteDescription)
    .catch(onSignalingError);
};

// Function associated with clicking on the Start button
// This is the event triggering all other actions
const start = () => {
  log("Requesting local stream");

  // First of all, disable the Start button on the page
  startButton.disabled = true;

  // Get ready to deal with different browser vendors...
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(successCallback)
    .catch(errorCallback);
};

// Function associated with clicking on the Call button
// This is enabled upon successful completion of the Start button handler
const call = () => {
  // First of all, disable the Call button on the page...
  callButton.disabled = true;
  // ...and enable the Hangup button
  hangupButton.disabled = false;
  log("Starting call");

  // Log info about video and audio device in use
  if (localStream.getVideoTracks().length > 0) {
    console.log(localStream.getVideoTracks());
    log("Using video device: " + localStream.getVideoTracks()[0].label);
  }

  if (localStream.getAudioTracks().length > 0) {
    console.log(localStream.getAudioTracks());
    log("Using audio device: " + localStream.getAudioTracks()[0].label);
  }

  // This is an optional configuration string, associated with
  // NAT traversal setup
  const servers = null;

  // Create the local PeerConnection object
  localPeerConnection = new RTCPeerConnection(servers);
  log("Created local peer connection object localPeerConnection");

  // Add a handler associated with ICE protocol events
  localPeerConnection.onicecandidate = gotLocalIceCandidate;

  // Create the remote PeerConnection object
  remotePeerConnection = new RTCPeerConnection(servers);
  log("Created remote peer connection object remotePeerConnection");

  // Add a handler associated with ICE protocol events...
  remotePeerConnection.onicecandidate = gotRemoteIceCandidate;

  // ...and a second handler to be activated as soon as the remote
  // stream becomes available.
  remotePeerConnection.ontrack = gotRemoteStream;

  // Add the local stream (as returned by getUserMedia())
  // to the local PeerConnection.
  for (const track of localStream.getTracks()) {
    localPeerConnection.addTrack(track, localStream);
  }
  log("Added localStream to localPeerConnection");

  // We're all set! Create an Offer to be 'sent' to the callee as soon
  // as the local SDP is ready.
  localPeerConnection
    .createOffer()
    .then(gotLocalDescription)
    .catch(onSignalingError);
};

const hangup = () => {
  log("Ending call");

  // Close PeerConnection(s)
  localPeerConnection.close();
  remotePeerConnection.close();

  // Reset local variables
  localPeerConnection = null;
  remotePeerConnection = null;

  // Disable Hangup button
  hangupButton.disabled = true;

  // Enable Call button to allow for new calls to be established
  callButton.disabled = false;
};

// Associate JavaScript handlers with click events on the buttons
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;
