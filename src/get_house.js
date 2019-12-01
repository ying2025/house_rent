let getContract = require("./common/contract_com.js").GetContract;
let filePath = "./ethererscan/house_abi.json";
// let contractAddress = "0x027014b4a8fa8e49f0ba420a8e0f588c98b4f0da";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let comVar = require("./common/globe.js");
let nonceMap = new Map();
let RegisterFun = require("./get_register");
let TokenFun = require("./get_token");
let contractAddress = comVar.houseConAddr;
async function initHouseFun() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}
// initHouseFun().then(con => {
// 	let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";	
// 	let priKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
// 	let username = "zs";
// 	let houseAddr = "It lies in SanFan, the beautiful city!";
// 	let des = "It's very beautiful, and it has a lot of fun";
// 	let info = "Greate info";
// 	let hopeCtx = "Hope you are easygoing";
// 	// releaseHouse(con, addr, priKey, houseAddr, 5, des, info, 12, 320000000000, hopeCtx).then(res => {
// 	// 	if (res) {
// 	// 		console.log(res);
// 	// 	}
// 	// });
// 	// house id : 0x2a43eecd35d6b76aef7c08c9ab761ae366bd19018492fe8de12799ec342ac69f
// 	let addr2 = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
// 	let priKey2 = "0x502D29356356AE02B7E23ECC851CCA0F21FE9CDADEF1FBAB158EB82611F27229";

// 	let houseId = "0x94efed96b0fa279522423d1a558ea49dfdc4c17186dadfe59657aa9d73f3f6ff";
// 	let realRent = 320000000000;
// 	// requestSign(con, addr2, priKey2, houseId, realRent).then(res => {
// 	// 	if (res) {
// 	// 		console.log(res);
// 	// 	}
// 	// });
// 	let signHowLong = 12;
// 	let rental = 320000000000;
// 	let yearRent = signHowLong*rental;
// 	let username2 = "ym";
// 	// signAgreement(con, addr, priKey, houseId, username, signHowLong, rental, yearRent).then(res => {
// 	// 	console.log(res)
// 	// })
// 	let addrChecker = "0x8E0f4A1f3C0DBEA0C73684B49aE4AD02789B3EC4";
// 	let priKeyChecker = "0xFFE962244D80F95197089FE5FF87BE0163D485E7986A7070A498136012FD7B61";
// 	let punishAmount = 5000000000;
// 	let punishAddr = addr;
// 	let reason = "Donnt observe the rule2";
// 	// checkBreak(con, addrChecker, priKeyChecker, houseId, punishAmount, punishAddr).then(res => {
// 	// 	console.log(res)
// 	// });
// 	// breakContract(con, addr2, priKey2, houseId, reason).then(res => {

// 	// });
// 	let amount = 2000000000;
// 	// withdraw(con, addr2, priKey2, houseId, amount).then(res => {

// 	// });
// 	let ratingIndex = 3;
// 	let remark = "It is very good.";
// 	// const disRrkAddr = "0x16c0b9cb893BA4392131df01e70F831A07d02687";
// 	commentHouse(con, addr2, priKey2, houseId, ratingIndex, remark).then(res => {

// 	});
// 	// getHouseRelaseInfo(con, houseId).then(res => {
// 	// 	console.log(res)
// 	// })
// });

function checkLogin(addr) {
	// Must login in first
	let flag = false;
	return new Promise((resolve) => {
		RegisterFun.initHouseFunReg().then(con => {
			RegisterFun.isLogin(con, addr).then(res => {
				flag = res;
				if (flag) { // Already sign
					flag = true;
				}
				resolve(flag);
			});
		});
	});
}

function releaseHouse(contract, addr, privateKey, houseAddr, huxing, des, info, tenancy, rent, hopeCtx) {
	return new Promise((resolve, reject) => {
		checkLogin(addr).then(flag => {
			if (!flag) {
				console.log("Please login in first");
				resolve({status: false, err: "该用户未登录，请先登录!"});
			} else {
				const releaseFun = contract.methods.releaseHouse(houseAddr, huxing, des, info, tenancy, rent, hopeCtx);
	    		const relABI = releaseFun.encodeABI();
			    packSendMsg(addr, privateKey, contractAddress, relABI).then(receipt => {
		        	if (receipt) {
		        		console.log("Release house success!");
		        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'RelBasic' || o.name == 'RelInfo') && o.type === 'event');
						if (JSON.stringify(receipt.logs) != '[]') {
							const log = receipt.logs.find(
								l => l.topics.includes(eventJsonInterface.signature)
							)
							let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
			   				if (houseRel) {
			   					resolve(houseRel);
			   				} else {
			   					resolve(receipt);
			   				}
						}
		        	} else {
		        		console.log("Release house fail!");
		        	}
				}).catch(err => {
					console.log("Release fail!");
					reject(err);
				});
			}
		});
	});
}

function requestSign(contract, addr, privateKey, houseId, realRent) {
	return new Promise((resolve, reject) => {
		// Judge whether the user has logged in
		checkLogin(addr).then(flag => {
			if (!flag) {
				console.log("Please login in first");
				resolve(false);
			} else {
				const reqFun = contract.methods.requestSign(houseId, realRent);
			    const reqABI = reqFun.encodeABI();
			    console.log("Start request!", addr);
			    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
		        	if (receipt) {
		        		console.log("Request the house success!");
		        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'RequestSign') && o.type === 'event');
						if (JSON.stringify(receipt.logs) != '[]') {
							const log = receipt.logs.find(
								l => l.topics.includes(eventJsonInterface.signature)
							)
							let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
			   				if (houseRel) {
			   					resolve(houseRel);
			   				} else {
			   					resolve(receipt);
			   				}
						}
		        	} else {
		        		console.log("Release house fail!");
		        	}
				}).catch(err => {
					console.log("Release fail!", err);
					reject(err);
				});
			}
		});
		
	});
}

function signAgreement(contract, addr, privateKey, houseId, name, signHowLong, rental, yearRent) {
	return new Promise((resolve, reject) => {
		checkLogin(addr).then(flag => {
			if (!flag) {
				console.log("Please login in first");
				resolve(false);
			} else {
				const reqFun = contract.methods.signAgreement(houseId, name, signHowLong, rental, yearRent);
			    const reqABI = reqFun.encodeABI();
			    console.log("Start sign the agreement!", addr);
			    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
		        	if (receipt) {
		        		console.log("Sign success!");
		        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'SignContract') && o.type === 'event');
						if (JSON.stringify(receipt.logs) != '[]') {
							const log = receipt.logs.find(
								l => l.topics.includes(eventJsonInterface.signature)
							)
							let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
			   				if (houseRel) {
			   					resolve(houseRel);
			   				} else {
			   					resolve(receipt);
			   				}
						}
		        	} else {
		        		console.log("Sign Agreement fail!");
		        	}
				}).catch(err => {
					console.log("Sign fail!", err);
					reject(err);
				});
			}
		});
	});
}

function withdraw(contract, addr, privateKey, houseId, amount) {
	return new Promise((resolve, reject) => {
		const withFun = contract.methods.withdraw(houseId, amount);
	    const withABI = withFun.encodeABI();
	    packSendMsg(addr, privateKey, contractAddress, withABI).then(receipt => {
        	if (receipt) {
        		console.log("Withdraw the coin success!");
        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'WithdrawDeposit') && o.type === 'event');
				if (JSON.stringify(receipt.logs) != '[]') {
					const log = receipt.logs.find(
						l => l.topics.includes(eventJsonInterface.signature)
					)
					let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
	   				if (houseRel) {
	   					resolve(houseRel);
	   				} else {
	   					resolve(receipt);
	   				}
				}
        	} else {
        		console.log("Withdraw the coin fail!");
        	}
		}).catch(err => {
			console.log("Withdraw occure error!");
			reject(err);
		});
	});
}

function breakContract(contract, addr, privateKey, houseId, reason) {
	return new Promise((resolve, reject) => {
		checkLogin(addr).then(flag => {
			if (!flag) {
				console.log("Please login in first");
				resolve(false);
			} else {
				const reqFun = contract.methods.breakContract(houseId, reason);
			    const reqABI = reqFun.encodeABI();
			    console.log("Start Break the contract!", addr);
			    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
		        	if (receipt) {
		        		web3.eth.getTransactionReceipt(receipt.transactionHash).then(transaction => {
		        			  console.log("getTransactionReceipt", transaction);
		        			  if (transaction.status) {
		        			  	 console.log("Break Contract success!");
		        			  } else {
		        			  	reject(false);
		        			  }
		        		});
		        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'BreakContract') && o.type === 'event');
						if (JSON.stringify(receipt.logs) != '[]') {
							const log = receipt.logs.find(
								l => l.topics.includes(eventJsonInterface.signature)
							)
							let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
			   				if (houseRel) {
			   					resolve(houseRel);
			   				} else {
			   					resolve(receipt);
			   				}
						}
		        	} else {
		        		console.log("Break the contract fail!");
		        	}
				}).catch(err => {
					console.log("Break the contract occure error!, Please inspect whether already pass the admin check!");
					reject(err.message);
				});
			}
		});
	});
}

function checkBreak(contract, addr, privateKey, houseId, punishAmount, punishAddr) {
	return new Promise((resolve, reject) => {
		checkLogin(addr).then(flag => {
			if (!flag) {
				console.log("Please login in first");
				resolve(false);
			} else {
				const reqFun = contract.methods.checkBreak(houseId, punishAmount, punishAddr);
			    const reqABI = reqFun.encodeABI();
			    console.log("Start Check Break the contract!", addr);
			    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
		        	if (receipt) {
		        		console.log("Break Check Contract success!");
		        		const eventJsonInterface = contract._jsonInterface.find(
							o => (o.name === 'ApprovalBreak') && o.type === 'event');
						if (JSON.stringify(receipt.logs) != '[]') {
							const log = receipt.logs.find(
								l => l.topics.includes(eventJsonInterface.signature)
							)
							let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
			   				if (houseRel) {
			   					resolve(houseRel);
			   				} else {
			   					resolve(receipt);
			   				}
						}
		        	} else {
		        		console.log("Check Break the contract fail!");
		        	}
				}).catch(err => {
					console.log("Check Break the contract occure error!", err);
					reject(err);
				});
			}
		});
	});
}

function commentHouse(contract, addr, privateKey, houseId, ratingIndex, remark) {
	return new Promise((resolve, reject) => {
		checkLogin(addr).then(flag => {
			if (!flag) {
				console.log("Please login in first");
				resolve(false);
			} else {
				TokenFun.initHouseFunToken().then(con => {
					TokenFun.approveTransfer(con, comVar.disAddr, comVar.privKey, addr, comVar.disAmount).then((res, rej) => {
						console.log(res, addr)
						if (res) {
							const reqFun = contract.methods.commentHouse(houseId, ratingIndex, remark);
						    const reqABI = reqFun.encodeABI();
						    console.log("Start comment the house!", addr);
						    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
					        	if (receipt) {
					        		console.log("Comment the house success!");
					        		const eventJsonInterface = contract._jsonInterface.find(
										o => (o.name === 'CommentHouse') && o.type === 'event');
									if (JSON.stringify(receipt.logs) != '[]') {
										const log = receipt.logs.find(
											l => l.topics.includes(eventJsonInterface.signature)
										)
										let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
						   				console.log(houseRel);
						   				resolve(receipt);
									}
					        	} else {
					        		console.log("Comment the house fail!");
					        	}
							}).catch(err => {
								console.log("Comment the house occure error!", err);
								reject(err);
							});
						}
					});
				}).catch(err => {
					 console.log("distribute reward approval fail", err);
					 reject(err);
				});
			}
		});
	});
}

function packSendMsg(formAddr, privateKey, toAddr, createABI) {
		let gas, nonce;
		return new Promise((resolve, reject) => {
			gas = 2000000000;
			web3.eth.getTransactionCount(formAddr, 'pending').then(_nonce => {
				if (nonceMap.has(formAddr) && (nonceMap[formAddr] == _nonce)) {
		             _nonce += 1
		        }
		        nonceMap.set(formAddr, _nonce);
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

function getHouseBasic(contract, houseId) {
	return new Promise((resolve, reject) => {
		contract.methods.getHouseBasicInfo(houseId).call().then(res => {
			console.log(res);
		});
	});
}

function getHouseRelaseInfo(contract, houseId) {
	return new Promise((resolve, reject) => {
		contract.methods.getHouseBasicInfo(houseId).call().then(res => {
			console.log(res);
		});
	});
}

module.exports = {
	initHouseFun,
	releaseHouse,
	requestSign,
	signAgreement,
	withdraw,
	breakContract,
	checkBreak,
	commentHouse,
	getHouseBasic,
	getHouseRelaseInfo
}