const fetch = require("node-fetch");

let oldurl;
const timer = setInterval(async () => {
	try {
		// Get the url from response
		const url = (await fetch("https://meme-api.herokuapp.com/gimme")
			.then(
				r => r.json(),
				console.error // fetch error handling
			)
		)?.url;

		// check if the url is different from the last fetch
		if (url != oldurl) {
			// set oldurl to current url
			oldurl = url;
			console.log(url);
		}

		return;
	} catch(e) {
		console.error(e);
	}
}, 5000);