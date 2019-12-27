let getContract = require("./common/contract_com.js").GetContract;
let  filePath = "./ethererscan/auth_abi.json";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let comCos = require("./common/globe.js");
let dbFun = require("./db/auth.js");
let token = require("./get_token.js");
let contractAddress = comCos.authConAddr;
let nonceMap = new Map();

async function initAuth() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}

function getIsAuth(contract, addr) {
	return new Promise(resolve => {
		// console.log("==get auth==", contract.methods)
  	    contract.methods.getIsAuth(addr).call().then(res => {
			if (res) {
				console.log("this house authenticate success");
				resolve(res);
			} else {
				resolve(false);
			}
		}).catch(err => {
				console.log("-getIsAuth: whether already auth----",err);
				reject(err);
		});
    });
}
function getHouseIds(contract, addr) {
	return new Promise((resolve, reject) => {
		contract.methods.getHouseIds(addr).call().then(res => {
			if (res) {
				resolve({status: true, data: res.transactionHash});
			} else {
				resolve({status:false, data:"查不到该地址对应的房屋ID！"});
			}
		});
	});
}
// 房屋认证
function authHouse(db, contract, addr, idCard, guid, owername, userId, prikey) {
    return new Promise((resolve, reject) => {
    	console.log("auth the house", addr)
    	getIsAuth(contract, addr).then(res => {
    		if (!res) {
    			const loginFun = contract.methods.authHouse(idCard, guid, owername);
                const logABI = loginFun.encodeABI();
                packSendMsg(addr, prikey, contractAddress, logABI).then(receipt => {                        
                    console.log("auth house rece", receipt);
                    let [flag, ctx] = decodeLog(contract, receipt, 'AuthHouse');
                    if (flag) {
                    	resolve({status:flag, data:ctx.transactionHash});
                    } else {
                    	resolve({status:false, err:"认证房屋失败，请稍后重新认证!"});
                    }            
                }).catch(err1 => {
                  console.log("Auth user error", err1);
                  reject({status:false, err:"请检查余额是否足以支付手续费！"});
                });
            } else {
              resolve({status:false, err:"这个房屋已经被认证过！"});
           };
    	}).catch(err => {
    		console.log("auth error", err)
    		reject({status:false, err: err});
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
// Approve addr can visit approveAddr refer house
function approveVisit(db, contract, houseId, addr, approveAddr, arpprovePrikey) {
	return new Promise((resolve, reject) => {
		const loginFun = contract.methods.approveVisit(addr);
        const logABI = loginFun.encodeABI();
        packSendMsg(approveAddr, arpprovePrikey, contractAddress, logABI).then(receipt => {  
            console.log("Approve Vist callback: " ,receipt) 
			let [flag, ctx, sendMsg] = decodeLog(contract, receipt, 'ApproveVist');
            if (flag) {
            	console.log(sendMsg);
            	resolve({status:flag, data:ctx.transactionHash});
            	dbFun.updateAuthInfo(db, houseId, addr, 1); // 
            } else {
            	resolve({status:false, err:"授权失败，请稍后重新授权！"});
            }  
		}).catch(err => {
			console.log("授权访问失败，请检查是房屋是否已经认证！");
			reject({status:false, err: "授权访问失败，请检查余额是否充足,房屋是否已经认证！"});
		});
    });
}

function getHouseOwer(contract, houseId, addr) {
	return new Promise((resolve, reject) => {
		contract.methods.getHouseOwer().call({from:addr}).then(res => {
			console.log("get house owner", res);
			resolve({status: true, data: res});
		}).catch(err => {
			console.log("get auth info error:", err)
			reject({status:false, data: err});
		});
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
				console.log("start sign the transaction")
				web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
					console.log("start send the transaction")
			 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
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
				}).catch(err => {
		 			console.log("Sign Fail:", err);
		 			reject(err);
		 		});;
			}).catch(err => {
	 			console.log("GetTransactionCount Fail:", err);
	 			reject(err);
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
        let sendMsg = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1));
        console.log("==decode log==",sendMsg)
        return [true, receipt, sendMsg];
    } else {
      return [false, "Cannt find logs", {}];
    }
}

module.exports = {
	initAuth,
	getIsAuth,
	getHouseIds,
	authHouse,
	approveVisit,
	getHouseOwer
}