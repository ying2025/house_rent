const server = require('./src/globe.js');

async function startup() {
	console.log("Starting listen service");
	try {
		console.log("Initializing server module");
		await server.initialize();
	} catch (err) {
		console.log(err);
		process.exit();
	}
}

startup()