// get appropriate platform API
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// set constraints
const constraints = { audio: false, video: true };

// get video
const video = document.querySelector("#video");

// getUserMedia success callback
const successFn = (stream) => {
  video.srcObject = stream;
  video.play();
};

// getUserMedia failure callback
const failureFn = (error) => {
  console.log(error);
};

navigator.getUserMedia(constraints, successFn, failureFn);
