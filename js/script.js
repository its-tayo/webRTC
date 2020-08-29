// get appropriate user agent API
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// get video
const video = document.querySelector("#video");

// get btns
const vgaButton = document.querySelector("#vga");
const qvgaButton = document.querySelector("#qvga");
const hdButton = document.querySelector("#hd");

// getUserMedia success callback
const successFn = (stream) => {
  video.srcObject = stream;
  video.play();
};

// getUserMedia failure callback
const failureFn = (error) => {
  console.log(error);
};

// Constraints object for low resolution video
const qvgaConstraints = {
  video: {
    mandatory: {
      maxWidth: 320,
      maxHeight: 240,
    },
  },
};

// Constraints object for standard resolution video
const vgaConstraints = {
  video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 480,
    },
  },
};

// Constraints object for high resolution video
const hdConstraints = {
  video: {
    mandatory: {
      minWidth: 1280,
      minHeight: 960,
    },
  },
};

// Associate actions with buttons:
qvgaButton.onclick = () => {
  getMedia(qvgaConstraints);
};
vgaButton.onclick = () => {
  getMedia(vgaConstraints);
};
hdButton.onclick = () => {
  getMedia(hdConstraints);
};

const getMedia = (constraints) => {
  navigator.getUserMedia(constraints, successFn, failureFn);
};
