let getContract = require("./common/contract_com.js").GetContract;
let  filePath = "./ethererscan/register.json";
let web3 = require("./common/contract_com.js").web3;
// let AbiCoder = require("web3-eth-abi");
let Web3EthAbi = require('web3-eth-abi');
let comCos = require("./common/globe.js");
let addrManager = require("./db/addr.js");
// let contractAddress = "0xb7ff5ab3734091aaa440cad83e492e289f49b9e7";
let contractAddress = comCos.regConAddr;
let nonceMap = new Map();

async function initReg() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}
function getFalg(contract) {
	return new Promise(resolve => {
		contract.methods.getFlag1().call().then(res => {
			console.log("flag", res)
		})
	})
}


function isAlreayReg(contract, addr, username) {
	return new Promise(resolve => {
		console.log("Is already Register");
  	    contract.methods.isAlreayReg(addr, username).call().then(res => {
			if (res) {
				console.log("this user already exist");
				resolve(res);
			} else {
				resolve(false);
			}
		}).catch(err => {
				console.log(err);
				reject(err);
		});
    });
}

// 免费注册链上用户
function createUser(db, contract, addr, username, userId, pwd, cardId) {
    return new Promise((resolve, reject) => {
    	console.log("create user", addr);
    	isAlreayReg(contract, addr, username).then(res => {
    		console.log("is al rec", res)
    		if (!res) {
    			// const loginFun = contract.methods.createUser(addr, username, userId, pwd);   // 合约需要加入id
                const loginFun = contract.methods.createUser(addr, username, pwd, userId, cardId);
                const logABI = loginFun.encodeABI();
                console.log("addr", comCos.regAddr);
                packSendMsg(comCos.regAddr, comCos.regpri, contractAddress, logABI).then(receipt => {                        
                    console.log("create user rece", receipt);
                    let [flag, ctx] = decodeLog(contract, receipt, 'CreateUser');
                    if (flag) {
                    	resolve({status:flag, data:ctx.transactionHash});
                    	addrManager.updateUserStatus(db, "", addr, 1);
                    } else {
                    	resolve({status:false, err:"注册失败!"});
                    }             
                }).catch(err1 => {
                  console.log("Create user error", err1);
                  reject({status:false, err:err1});
                });
            } else {
              resolve({status:false, err:"该用户已注册！"});
           };
    	}).catch(err1 => {
           console.log("Create user error", err1);
           reject({status:false, err:"网络繁忙，请稍后重试!"});
        });
   });
}

function decodeLog(contract, receipt, eventName) {
	const eventJsonInterface = contract._jsonInterface.find(
      o => (o.name === eventName) && o.type === 'event');
    if (JSON.stringify(receipt.logs) != '[]') {
      const log = receipt.logs.find(
        l => l.topics.includes(eventJsonInterface.signature)
      );
      let decodeLog = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
        console.log(decodeLog)
        return [true, receipt];
    } else {
      return [false, "Cannt find logs"];
    }
}
// First, judge whether user register
// If user already register, login directly
// Or, the user must login firstly.
function login(db, contract, privateKey, addr, username, pwd) {
	return new Promise((resolve, reject) => {
		addr = addr.replace(/\s+/g,'')
		const loginFun = contract.methods.login(addr, username, pwd);
        const logABI = loginFun.encodeABI();
        console.time("packSendMsg");
        console.log("packsendmsg", privateKey, addr, username, pwd)
        packSendMsg(addr, privateKey, contractAddress, logABI).then(receipt => {  
            console.log("Login callback: ", receipt);
			let [flag, ctx] = decodeLog(contract, receipt, 'LoginEvent');
            if (flag) {
            	resolve({status:flag, data: ctx.transactionHash});
            } else {
            	resolve({status:false, err:"登录失败!"});
            } 
            addrManager.updateUserStatus(db, "", addr, 2);
        	console.log("login after resolve"); 
		}).catch(err => {
			console.log("Login fail！", err);
			reject({status:false, err: "请检查余额是否不足,是否已注册，是否已登录,地址是否正确!"});
		});
		console.timeEnd("packSendMsg")
    });
}

function isLogin(contract, addr) {
	return new Promise((resolve, reject) => {
		contract.methods.isLogin(addr).call().then(res => {
			// console.log("res", res)
			if (res) {
				resolve(res);
			} else {
				resolve(false);
			}
		}).catch(err => {
			console.log("isLogin err: ", err);
			reject(err);
		});
	});
}

function getStatus(db, contract, addr) {
	return new Promise((resolve, reject) => {
		contract.methods.chainStatus(addr).call().then(res => {
			if (res) {
				resolve({status: true, data: res});
				addrManager.queryUserStatus(db, addr).then(ctx => {
			        console.log("query ", typeof(res), res, typeof(ctx.data), ctx)
			        let chainState = parseInt(res);
			        if (ctx && (ctx.data != chainState)) {
			        	addrManager.updateUserStatus(db, "", addr, chainState);
			        }
			    }).catch(err => {
			        console.log("get status error", err)
			        reject(err);
			    });
			} else {
				resolve(false);
			}
		}).catch(err => {
			console.log("isLogin err: ", err);
			reject(err);
		});
	});
}

function findUserInfo(contract, addr) {
	return new Promise((resolve, reject) => {
		contract.methods.findUser(addr).call().then(res => {
			resolve(res);
		})
	})
}

function logout(contract, privateKey, addr, username, pwd) {
	return new Promise((resolve, reject) => {
  	    contract.methods.isLogin(addr).call().then(res => {
			if (res) {
				console.log("Find the user", res);
				const loginFun = contract.methods.logout(addr, username, pwd);
		        const logABI = loginFun.encodeABI();
		        packSendMsg(addr, privateKey, contractAddress, logABI).then(receipt => {        	
		        	if (receipt) {
		        		console.log("Login out success");
		        		resolve(receipt);
		        	} 
				}).catch(err => {
					console.log("Already login out", err);
					reject(err);
				});
			} else {
				reject("this user doesn't sign in!");			
			}
		});
    });
}

function isExitUserAddress(contract, addr) {
	return new Promise(resolve => {
  	    contract.methods.isExitUserAddress(addr).call().then(res => {
			if (res) {
				console.log("this user already exist");
				resolve(res);
			} else {
				resolve(false);
			}
		}).catch(err => {
				console.log(err)
		});
    });
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
				console.time("signTransaction");
				console.log("start sign the transaction")
				web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
					console.log("start send the transaction")
					console.time("sendSignedTransaction");
			 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
			 			// console.log("send sign receive", receipt);
			 			if (receipt.status) {
			 				console.log(receipt.transactionHash)
			 				resolve(receipt);
			 			} else {
			 				reject("发送交易失败!");
			 			}
			 		}).catch(err1 => {
			 			console.log("Send Fail:", err1);
			 			reject(err1);
			 		});
			 		console.timeEnd("sendSignedTransaction");
				}).catch(err => {
		 			console.log("Sign Fail:", err);
		 			reject(err);
		 		});;
		 		console.timeEnd("signTransaction")
			}).catch(err => {
	 			console.log("GetTransactionCount Fail:", err);
	 			reject(err);
	 		});
		});	 	
}

module.exports = {
	initReg,
	isAlreayReg,
	isExitUserAddress,
	isLogin,
	login,
	logout,
	createUser,
	getStatus
}