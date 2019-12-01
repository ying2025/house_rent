let fs = require('fs');
const mysql = require('mysql');
let configuration;
init()
function init() {
	let configurationFile = 'config.json';
	configuration = JSON.parse(
	    fs.readFileSync(configurationFile)
	);
}
// connDb()
function connDb() {
	let pool = mysql.createPool({
		  connectionLimit : configuration.DBConnectNumLimit,
		  host: configuration.DBAddress,
		  user: configuration.DBUser,
		  password: configuration.DBPassword,
		  database: configuration.DBName
	});
	return new Promise((resolve, reject) => {
		pool.getConnection(function(err, conn) {
		    if (err) {
		    	console.log("connect db:", err);
				reject(err);
		    } else {
		    	console.log("connect success")
		    	resolve(conn);
		    }
		});
	});
}

function closeDb(con) {
	console.log("----close--datebase--connect--", con)
	con.release();
}

module.exports = {
	configuration,
	connDb,
	closeDb
}