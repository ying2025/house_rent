let getContract = require("./common/contract_com.js").GetContract;
let filePath = "./ethererscan/agreement_abi.json";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let comVar = require("./common/globe.js");
let dbFun = require("./db/agree.js");
let dbHouseFun = require("./db/house.js");
let dbCommentFun = require("./db/comment.js");
let nonceMap = new Map();
let RegisterFun = require("./get_register");
let TokenFun = require("./get_token");
let HouseFun = require("./get_house");
let contractAddress = comVar.agreeConAddr;
async function initAgreeFun() {
	let contract = await getContract(filePath, contractAddress);
	return contract;
}

// 房东签约
function signAgreement(db, contract, username, houseId, houseAddr, falsify, phoneNum, idCard, signHowLong, rental, houseDeadline, houseUse, payOne, addr, privateKey) {	
	return new Promise((resolve, reject) => {
		console.log("==start=signAgreement=", contract.methods.newAgreement);
		// 先查询是否已经签约
		dbFun.querySignInfo(db, houseId).then(result => {
			console.log("quer resl", result, result)
			if (result && result.status && result.data.length != 0) {
				resolve({status:false, err:"已签订该房屋合同!"});
			} else {
				const reqFun = contract.methods.newAgreement(username, idCard, phoneNum, rental, signHowLong, houseId, houseAddr, falsify, houseDeadline, payOne, houseUse);
			    const reqABI = reqFun.encodeABI();
			    console.log("Start sign the agreement!", addr);
			    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
		        	if (receipt) {
		        		console.log("Landlord sign success!");
		        		let [flag, ctx, logRes] = decodeLog(contract, receipt, 'LandLordSign');
		                if (flag) {
		                	console.log("request house receive: ", ctx);
		                	let txHash = ctx.transactionHash;
		                	resolve({status:flag, data: txHash});
		                	let house_state = comVar.houseState.UnderContract;    	
			                dbHouseFun.updateReleaseInfo(db, "", addr, houseId, house_state);
		                	dbFun.insertAgreeRecord(db, username, phoneNum, addr, houseAddr, rental, signHowLong, txHash, houseId, falsify, houseDeadline, houseUse, payOne);
		                } else {
		                	resolve({status:false, err:"签订合同失败!"});
		                }
		        	} 
				}).catch(err => {
					console.log("Sign fail!", err);
					reject({status: false, err: "请检查是否已经登录、余额能否满足租金要求、是否已预订该房屋！"});
				});
			}
		}).catch(err => {
			reject(err);
		});
	});
}
// 租户签约
function leaserSign(db, contract, contractHouse, leaserName, houseId, phoneNum, idCard, renewalMonth, breakMonth, tenancy, addr, privateKey) {	
	return new Promise((resolve, reject) => {
		contractHouse.then(con => {
			HouseFun.getHouseRelaseInfo(con, houseId).then(info => {
			if (info && info.status && info.data && parseInt(info.data[0]) != 1) {
				resolve({status:false, err:"合同已完成签订!"});
				dbHouseFun.updateReleaseInfo(db, "", addr, houseId, parseInt(info.data[0]));
				dbFun.updateAgreeState(db, houseId, parseInt(info.data[0])); // 乙方已签订合同，合同正式生效 
			} else {
				let startTime = Date.now();
		    	let endTime = (startTime/1000 + tenancy*30*24*3600)*1000;
				console.log("==start=leaser sign the contract=");
				const reqFun = contract.methods.tenantSign(houseId, leaserName, phoneNum, idCard, renewalMonth, breakMonth, startTime, endTime);
			    const reqABI = reqFun.encodeABI();
			    console.log("Start sign the agreement!", addr);
			    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
			    	if (receipt) {
			    		console.log("Leaser sign success!");
			    		let [flag, ctx, logRes] = decodeLog(contract, receipt, 'LeaserSign');
			            if (flag) {
			            	console.log("request house receive: ", ctx);
			            	let txHash = ctx.transactionHash;
			            	resolve({status:flag, data: txHash});
			            	let house_state = comVar.houseState.Renting; 
			            	dbHouseFun.updateReleaseInfo(db, "", addr, houseId, house_state);
			            	dbFun.updateAgreeRecord(db, houseId, leaserName, phoneNum, renewalMonth, breakMonth, addr, startTime, endTime);
			            } else {
			            	resolve({status:false, err:"签订合同失败!"});
			            }
			    	} 
				}).catch(err => {
					console.log("Sign fail!", err);
					reject({status: false, err: "请检查是否已经登录、余额能否满足租金要求、是否已预订该房屋！"});
				});
			}
		});
		});
		
	});
}
// 完成租赁
function endRent(db, contract, houseId, addr, privateKey) {	
	return new Promise((resolve, reject) => {
		console.log("==start=leaser sign the contract=");
		const reqFun = contract.methods.endRent(houseId);
	    const reqABI = reqFun.encodeABI();
	    console.log("Start sign the agreement!", addr);
	    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
	    	if (receipt) {
	    		console.log("Leaser sign success!");
	    		let [flag, ctx, logRes] = decodeLog(contract, receipt, 'LeaserSign');
	            if (flag) {
	            	console.log("request house receive: ", ctx);
	            	let txHash = ctx.transactionHash;
	            	resolve({status:flag, data: txHash});
	            	let house_state = comVar.houseState.EndRent; 
	            	dbHouseFun.updateReleaseInfo(db, "", addr, houseId, house_state);
	            	let rtnData= dbFun.updateAgreeState(db, houseId, comVar.agreeState.EndRent); // 租赁到期
	            	console.log(rtnData)
                    if (rtnData.status) {
                       let houseAddr = rtnData.house_addr;
                       dbCommentFun.insertCommentRecord(db, houseId, houseAddr);
                    }
	            } else {
	            	resolve({status:false, err:"结束租赁失败!"});
	            }
	    	} 
		}).catch(err => {
			console.log("Sign fail!", err);
			reject({status: false, err: "请检查该房屋租赁是否到期！"});
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
        let decodeLog = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1));
        console.log("==decode log==",decodeLog)
        return [true, receipt, decodeLog];
    } else {
      return [false, "Cannt find logs", {}];
    }
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


module.exports = {
	initAgreeFun,
	signAgreement,
	leaserSign,
	endRent
}