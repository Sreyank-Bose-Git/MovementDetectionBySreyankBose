// Canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

canvas.style.width = "600px";
canvas.style.height = "400px";

ctx.strokeStyle = "yellow";

// Video
let video = document.createElement("video");
video.autoplay = true;

video.style.filter = "contrast(1.2) brightness(1.1)";
canvas.style.filter = "contrast(1.2) brightness(1.1);";
canvas.willReadFrequently = true;

let boundingBoxes = [];

let lastFrame;
let currentFrame;
let totalDifference = 0;
const motionThreshold = 1000;
const diffThreshold = 150;

// Access the user's camera
navigator.mediaDevices.getUserMedia({video: {facingMode: "user"}}).then(stream => {
    video.srcObject = stream;
});

// Event Listener when video starts
video.addEventListener("play", () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    lastFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(UpdateCanvasContent);
});

function UpdateCanvasContent() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    boundingBoxes.length = 0; // More efficient reset
    totalDifference = 0; // Reset total difference for each frame

    for (let y = 0; y < canvas.height; y += 4) { // Increased step size to 4 for optimization
        for (let x = 0; x < canvas.width; x += 4) {
            let index = (y * canvas.width + x) * 4; // Pixel index in ImageData array

            let rDiff = Math.abs(currentFrame.data[index] - lastFrame.data[index]);
            let gDiff = Math.abs(currentFrame.data[index + 1] - lastFrame.data[index + 1]);
            let bDiff = Math.abs(currentFrame.data[index + 2] - lastFrame.data[index + 2]);

            if (rDiff > diffThreshold || gDiff > diffThreshold || bDiff > diffThreshold) {
                totalDifference += rDiff + gDiff + bDiff;

                // Update bounding boxes
                boundingBoxes.push({x: x, y: y, width: 4, height: 4});
            }
        }
    }

    if(totalDifference >= motionThreshold) {
        console.log("Movement Seen");
        playAudio();
        boundingBoxes.forEach(box => {
            ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
    } else {
        console.log("Movement Not Seen");
    }

    lastFrame = currentFrame;
    requestAnimationFrame(UpdateCanvasContent);
}

function playAudio() {
    let audio = document.getElementById('audio');
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 500);
}
