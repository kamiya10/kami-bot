let cv;

function savePNG() {
    saveCanvas(cv, 'masterpiece', "png")
}
function saveJPG() {
    saveCanvas(cv, 'masterpiece', "jpeg")
}

function setup() {
	// Start the socket connection
	socket = io.connect('https://www.kamiya.tk/')
    
    socket.on('updateCanvas', async canvas => {
        console.log("updateCanvas")
        cv = createCanvas(1000, 600);
        cv.parent('canvas_container');
        cv.background("#fff");
        loadImage(canvas.data, img => {
            image(img, 0, 0, 1000, 600);
          });
	});

	// Callback function
	socket.on('mouse', data => {
		stroke(data.color)
		strokeWeight(data.strokeWidth)
		line(data.x, data.y, data.px, data.py)
	});

    socket.on('canvasClear', () => {
		cv.background("#fff")
        console.log("cleared")
	});

    
}