function setup() {
	// Start the socket connection
	socket = io.connect('https://www.kamiya.tk/')

	// Callback function
	document.body.innerText = (socket.client);
    console.log(socket)

}