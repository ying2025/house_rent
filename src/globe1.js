let http = require('http');
const express = require('express');
let initParam = require("./init.js");
let RegisterFun = require("./get_register");
let TokenFun = require("./get_token");
let comCos = require("./common/globe.js")

let configuration = initParam.configuration;
initialize()
function initialize() {
  return new Promise((resolve, reject) => {
	const app = express();
	server = http.createServer(app);
	console.log("----Init-----")
	// 注册
	app.get('/register/:address/:username/:pwd/:prikey', (req, res) => {
		console.log("-----get adddress params----", req.params)
		setResHeadr(res);
		TokenFun.initToken().then(tocon => {
			TokenFun.transferEth(tocon, comCos.regpri, comCos.regAddr, req.params.address, 20000000000*210000).then(trans => {
				console.log(trans)
				RegisterFun.initReg().then(con => {
					RegisterFun.createUser(con, req.params.prikey, req.params.address,req.params.username, req.params.pwd).then(ctx => {
						console.log(ctx)
						if (ctx) { // Already sign
							res.send({
								"status": ctx.status,
								"txHash": ctx.transactionHash
							});
						}
					}).catch(err => {
						console.log(222, err)
						res.send({
							"status": false,
							"err": err
						});
					});
				}).catch(err => {
					res.send({
						"status": false,
						"err": err
					});
				});
			}).catch(err => {
				res.send({
					"status": false,
					"err": err
				});
			});;
		}).catch(err => {
			res.send({
				"status": false,
				"err": err
			});
		});
	});
	// 登录
	app.get('/login/:address/:username/:pwd/:prikey', (req, res) => {
		console.log("-----get adddress params----", req.params)
		RegisterFun.initReg().then(con => {
			RegisterFun.login(con, req.params.prikey, req.params.address,req.params.username, req.username.pwd).then(ctx => {
				if (ctx) { // Already sign
					res.send({
						"status": ctx.status,
						"txHash": ctx.transactionHash
					});
				}
			});
		}).catch(err => {
			res.send({
				"status": false,
				"err": err
			});
		});
	});
	app.get('/login/:address/:username/:pwd/:prikey', (req, res) => {
		console.log("-----get adddress params----", req.params)
		RegisterFun.initReg().then(con => {
			RegisterFun.logout(con, req.params.prikey, req.params.address,req.params.username, req.username.pwd).then(ctx => {
				if (ctx) { // Already sign
					res.send({
						"status": ctx.status,
						"txHash": ctx.transactionHash
					});
				}
			});
		}).catch(err => {
			res.send({
				"status": false,
				"err": err
			});
		});
	});
	//Token transfer
	app.get('/transfer/:address/:to/:amount/:prikey', (req, res) => {
		console.log("-----get transfer params----", req.params)
		RegisterFun.initReg().then(con => {
			RegisterFun.logout(con, req.params.prikey, req.params.address,req.params.username, req.username.pwd).then(ctx => {
				if (ctx) { // Already sign
					res.send({
						"status": ctx.status,
						"txHash": ctx.transactionHash
					});
				}
			});
		}).catch(err => {
			res.send({
				"status": false,
				"err": err
			});
		});
	});
	console.log("Start listen the port");
	server.listen(configuration.ServerPort,configuration.ServerAddress);
  });
}

function setResHeadr(res) {
	res.header("Access-Control-Allow-Origin", "*");
}


module.exports = {
	initialize
}