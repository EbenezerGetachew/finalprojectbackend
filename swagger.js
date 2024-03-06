const swaggerAutogen = require('swagger-autogen')();

const doc = {
	info: {
		title: 'Kebele Id Issuing And Renewal System',
		description: 'this system is intended to enable residents to get issued and access to id renewal.'
	},
	host: 'localhost:5000'
};

const outputFile = './swagger-output.json';
const routes = ['./server.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
