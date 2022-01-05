const http = require('http');
const fs = require('fs');

const hostname = 'localhost';
const port = 3000;

function  init() {
	fs.readFile('index.html', (err, html) => {
		if (err) {
			throw err;
		}

		startServer(html);
	})
}

function startServer(html) {
	const server = http.createServer((req, res) => {
		res.statusCode = 200;
		res.setHeader('Content-type', 'text/html');
		res.write(html);
		res.end();
	});

	server.listen(port, hostname, () => {
		console.log('Server started on port: ' + port);
	});
}

init();