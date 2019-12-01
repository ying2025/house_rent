let getContract = require("./common/contract_com.js").GetContract;
let  filePath = "./ethererscan/remark_abi.json";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let nonceMap = new Map();
let comCos = require("./common/globe.js");
let contractAddress = comCos.remarkConAddr;
async function initRemark() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}

// initRemark().then(con => {
// 	let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
// 	let priKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
// 	let username = "zs";
// 	let pwd = "123";
// 	let houseId = "0x9525e127a03b47e2878e19cadc753e66a3b224d7a0cd18d628ae3dfe7b92a69c";
// 	let landlord = "";
// 	let refeAddr = "";
// 	let ratingIndex = 1;
// 	let remark = "";
// 	commentHouse(con, addr, priKey, houseId, landlord, refeAddr, ratingIndex, remark).then((res, rej) => {
// 		console.log(4343, res);
// 	});
// 	// isLogin(con, addr3).then(res => {
// 	// 	console.log("isLogin", 444, res)
// 	// 	getFalg(con).then(res => {

// 	// 	})
// 	// });
// });
// First, judge whether user register
// If user already register, login directly
// Or, the user must login firstly.
function commentHouse(contract, addr, priKey, houseId, landlord, refeAddr, ratingIndex, remark) {
	return new Promise((resolve, reject) => {
			const loginFun = contract.methods.commentHouse(houseId, landlord, refeAddr, ratingIndex, remark);
	        const logABI = loginFun.encodeABI();
	        packSendMsg(addr, privateKey, contractAddress, logABI).then(receipt => {        			        	
	        	if (receipt) {
	        		console.log("Comment house start");
	        		const eventJsonInterface = contract._jsonInterface.find(
						o => (o.name === 'LoginEvent') && o.type === 'event');
					if (JSON.stringify(receipt.logs) != '[]') {
						const log = receipt.logs.find(
							l => l.topics.includes(eventJsonInterface.signature)
						)
						let decodeLog = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
		   				console.log("Comment house success");
		   				resolve(decodeLog);
					} else {
						resolve(false);
					}
	        	}  else {
					resolve(false);
				}
				
			}).catch(err => {
				console.log("Fail to comment house");
				reject(err);
			});
    });
}

function getRemarkHouse(contract, houseId) {
	return new Promise((resolve, reject) => {
		contract.methods.getRemarkHouse(houseId).call().then(res => {
			resolve(res);
		})
	})
}

function getRemarkTenant(contract, houseId) {
	return new Promise((resolve, reject) => {
		contract.methods.getRemarkTenant(houseId).call().then(res => {
			resolve(res);
		})
	})
}

function packSendMsg(formAddr, privateKey, toAddr, createABI) {
		let gas, nonce;
		return new Promise((resolve, reject) => {
			gas = 20000000000;
			web3.eth.getTransactionCount(formAddr, 'pending').then(_nonce => {
				if (nonceMap.has(_nonce)) {
					_nonce += 1
				}
				nonceMap.set(_nonce, true);
				nonce = _nonce.toString(16);
				const txParams = {
				  gasPrice: gas,
			      gasLimit: 2000000,
			      to: toAddr,
			      data: createABI,
			      from: formAddr,
			      chainId: 3,
			      nonce: '0x' + nonce
				}
				web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
			 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
			 			if (receipt.status) {
			 				console.log(receipt.transactionHash)
			 				resolve(receipt);
			 			} else {
			 				console.log("this user already regiester");
			 				reject("this user already regiester");
			 			}
			 		}).catch(err => {
			 			reject(err);
			 		});
				});
			});
		});	 	
}

module.exports = {
	initRemark,
	commentHouse,
	getRemarkTenant,
	getRemarkHouse
}