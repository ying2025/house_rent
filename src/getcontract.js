// conbsole.log(web3)
let abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_userAddress",
				"type": "address"
			},
			{
				"name": "_username",
				"type": "string"
			}
		],
		"name": "createUser",
		"outputs": [
			{
				"name": "index",
				"type": "uint256"
			},
			{
				"name": "nindex",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_userAddress",
				"type": "address"
			},
			{
				"name": "_username",
				"type": "string"
			},
			{
				"name": "index",
				"type": "uint256"
			},
			{
				"name": "nindex",
				"type": "uint256"
			}
		],
		"name": "deleteUser",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_username",
				"type": "string"
			}
		],
		"name": "findAddrByName",
		"outputs": [
			{
				"name": "userAddress",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "findUser",
		"outputs": [
			{
				"name": "userAddresses",
				"type": "address"
			},
			{
				"name": "username",
				"type": "string"
			},
			{
				"name": "time",
				"type": "uint256"
			},
			{
				"name": "index",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "isExitUserAddress",
		"outputs": [
			{
				"name": "isIndeed",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_username",
				"type": "string"
			}
		],
		"name": "isExitUsername",
		"outputs": [
			{
				"name": "isIndeed",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userAddresses",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "usernames",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "userStruct",
		"outputs": [
			{
				"name": "userAddress",
				"type": "address"
			},
			{
				"name": "username",
				"type": "string"
			},
			{
				"name": "time",
				"type": "uint256"
			},
			{
				"name": "index",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];
const Tx = require('ethereumjs-tx');
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/2571ab4c0de14ffb87392fb9c3904375"));
// let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

let contractAddress = "0x9939b2c8e46e26bea4b1814c487f4b03894c362c";
let userAddr = "0x3c8b2739a757bba8769e722ca914cc7624991c98";
// testCreate()
let nonceMap = new Map();
// 通过web3调用合约内的方法
// testA()
function testA() {
	console.log(typeof(abi))
	let testAddr = "0xc96CeD51346896c5dF44E40eE41CDBfb67AE6888";
	let contract = new web3.eth.Contract(abi, contractAddress, {gasPrice: '3000000', from: userAddr});
	let options = {
            from: testAddr, //创建账户用主账号
            gas: 8000000, //最大的gas数值
            gasPrice:"2100000" 
    }
    // console.log(contract)
}
findOrCreate()
function findOrCreate() {
	// let testAddr = "0x960bedf8df0a6e66b470ba560ee6fd1e0e32ee23";
	let testAddr = "0xc96CeD51346896c5dF44E40eE41CDBfb67AE6888";
	let contract = new web3.eth.Contract(abi, contractAddress, {gasPrice: '3000000', from: userAddr});
	let options = {
            from: testAddr, //创建账户用主账号
            gas: 8000000, //最大的gas数值
            gasPrice:"2100000" 
        }
	// let privateKey = "0x99d3a520b871ac67693da99db675d83e0944c73498e750a6a2ed50b54ec5be78";
	let privateKey = "0x5FCC55798BD426BA7683ED01DA9DB35A64B96FFE9EEE1549C6EF673494A39FAB";
	contract.methods.isExitUserAddress(testAddr).call().then(res => {
		console.log(res) 
		if (res) {
			console.log("this user already exist");
		} else {
			const createFunc = contract.methods.createUser(testAddr, "ym"); // it will be fail, if userAddr not in created user
			const createABI = createFunc.encodeABI()
			let gas, nonce;
			web3.eth.getBalance(testAddr).then(console.log)
				gas = 20000000000;
				web3.eth.getTransactionCount(testAddr, 'pending').then(_nonce => {
					if (nonceMap.has(_nonce)) {
						_nonce += 1
					}
					nonceMap.set(_nonce, true);
					// console.log(_nonce)
					nonce = _nonce.toString(16);
					const txParams = {
					  gasPrice: gas,
				      gasLimit: 2000000,
				      to: contractAddress,
				      data: createABI,
				      from: testAddr,
				      chainId: 3,
				      nonce: '0x' + nonce
					}
				 	web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
				 		// console.log(signedTx)
				 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
				 			console.log(receipt)
				 			if (receipt.status) {
				 				console.log(receipt.transactionHash)
				 			} else {
				 				console.log("this user already regiester");
				 			}
				 		}).catch(err => {
				 			console.log(err)
				 	})
				})
		  			
			});
		}
	}).catch(err => {
				console.log(err)
	})
}







// 通过web3调用合约内的方法
function testCreate() {
	// let testAddr = "0x960bedf8df0a6e66b470ba560ee6fd1e0e32ee23";
	let testAddr = "0xc96CeD51346896c5dF44E40eE41CDBfb67AE6888";
	let contract = new web3.eth.Contract(abi, contractAddress, {gasPrice: '3000000', from: userAddr});
	let options = {
            from: testAddr, //创建账户用主账号
            gas: 8000000, //最大的gas数值
            gasPrice:"2100000" 
        }
	// let privateKey = "0x99d3a520b871ac67693da99db675d83e0944c73498e750a6a2ed50b54ec5be78";
	let privateKey = "0x5FCC55798BD426BA7683ED01DA9DB35A64B96FFE9EEE1549C6EF673494A39FAB";
	contract.methods.isExitUserAddress(testAddr).call().then(res => {
		console.log(res) // it will be fail, if userAddr not in created user
	    if (!res) {
			const createFunc = contract.methods.createUser(testAddr, "ym");
			// const createFunc = contract.methods.isExitUserAddress(testAddr);
			const createABI = createFunc.encodeABI()
			let gas, nonce;
			web3.eth.getBalance(testAddr).then(console.log)
				gas = 20000000000;
				web3.eth.getTransactionCount(testAddr, 'pending').then(_nonce => {
					if (nonceMap.has(_nonce)) {
						_nonce += 1
					}
					nonceMap.set(_nonce, true);
					// console.log(_nonce)
					nonce = _nonce.toString(16);
					const txParams = {
					  gasPrice: gas,
				      gasLimit: 2000000,
				      to: contractAddress,
				      data: createABI,
				      from: testAddr,
				      chainId: 3,
				      nonce: '0x' + nonce
					}
				 	web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
				 		// console.log(signedTx)
				 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
				 			console.log(receipt)
				 			if (receipt.status) {
				 				console.log(receipt.transactionHash)
				 			} else {
				 				console.log("this user already regiester");
				 				// web3.eth.filter({fromBlock:0, toBlock: 'latest', topics:[/* ????!!! */]}, (err, res) => {
				 				// 	if (!error) {
				 				// 		console.log(res)
				 				// 	} else {
				 				// 		console.log(err)
				 				// 	}
				 				// })
				 			}
				 		}).catch(err => {
				 			console.log(err)
				 		})
				 	})
		  			
				});
				}
			}).catch(err => {
				console.log(err)
			})
}

// function testSend2() {
// 	let testAddr = "0x960bedf8df0a6e66b470ba560ee6fd1e0e32ee23";
// 	let contract = new web3.eth.Contract(abi, contractAddress, {gasPrice: '3000000', from: userAddr});
// 	let options = {
//             from: testAddr, //创建账户用主账号
//             gas: 8000000, //最大的gas数值
//             gasPrice:"2100000" 
//         }
// 	// let privateKey = Buffer.from("99d3a520b871ac67693da99db675d83e0944c73498e750a6a2ed50b54ec5be78",'hex');
// 	let privateKey = "0x99d3a520b871ac67693da99db675d83e0944c73498e750a6a2ed50b54ec5be78";
// 	const createFunc = contract.methods.createUser(testAddr, "ym");
// 	const createABI = createFunc.encodeABI()
// 	let gas, nonce;
// 	web3.eth.getBalance(testAddr).then(console.log)
// 	// createFunc.estimateGas().then((gasAmount) => {
// 		// console.log(gasAmount)
// 		// gas = gasAmount + 10000000000;
// 		gas = 20000000000;
// 		web3.eth.getTransactionCount(testAddr, 'pending').then(_nonce => {
// 			// console.log(_nonce)
// 			// console.log(_nonce)
// 			// _nonce = 12;
// 			// console.log(nonceMap, _nonce)
// 			if (nonceMap.has(_nonce)) {
// 				_nonce += 1
// 			}
// 			nonceMap.set(_nonce, true);
// 			console.log(_nonce)
// 			nonce = _nonce.toString(16);

// 			console.log(nonce)
// 			const txParams = {
// 			  // gasPrice: '0x09184e72a000',
// 			  gasPrice: gas,
// 		      gasLimit: 2000000,
// 		      to: contractAddress,
// 		      data: createABI,
// 		      from: testAddr,
// 		      chainId: 3,
// 		      // chainId: web3.utils.toHex('3'),
// 		      nonce: '0x' + nonce
// 		      // "value": web3.utils.toHex(amountToSend)
// 			}
// 			// console.log(txParams.gasLimit*gas)
// 			// web3.eth.getBlock("latest").then(console.log)
// 			// console.log("SDSD", Tx)
// 			// const tx = new Tx.Transaction(txParams);
// 		 //    tx.sign(privateKey);
// 		 //    web3.eth.net.getId().then(console.log)
// 		 //    const serializedTx = tx.serialize();
// 		 //    // contract.methods.get().call().then(v => console.log("Value before increment: " + v));
// 		 //    console.log(serializedTx.length)
// 		 //    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', receipt => {
// 		 //      console.log(receipt);
// 		 //      // contract.methods.get().call().then(v => console.log("Value after increment: " + v));
// 		 //    })
// 		 	web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
// 		 		console.log(signedTx)
// 		 		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
// 		 			console.log(receipt)
// 		 		}).catch(err => {
// 		 			console.log(err)
// 		 		})
  			
// 		 	})
  			
// 		})
// 	// }).catch(err => {
// 	// 	console.log(err)
// 	// })
// 		// 通过web3调用合约内的方法
// }



// testSend()

function testSend() {
	let testAddr = "0x960bEDf8DF0A6e66B470ba560eE6fD1e0e32Ee23";
	let contract = new web3.eth.Contract(abi, contractAddress, {gasPrice: '3000000', from: userAddr});
	let options = {
            from: userAddr, //创建账户用主账号
            gas: 8000000, //最大的gas数值
            gasPrice:"2100000" 
        }
	// contract.methods.findUser(userAddr).call().then(res => {
	// 	console.log(res) // it will be fail, if userAddr not in created user
	// }).catch(err => {
	// 	console.log(err)
	// })
	// contract.methods.createUser(testAddr, "ym").send(options).on("transactionsHash", hash => {
	// 	console.log(hash)
	// }).on("confirmation", (confirmNum, receipt)=> {
	// 	console.log(confirmNum, receipt)
	// }).catch(err => {
	// 	console.log(err)
	// });
	let pri = "99D3A520B871AC67693DA99DB675D83E0944C73498E750A6A2ED50B54EC5BE78";
	web3.eth.personal.unlockAccount(userAddr, pri).then((res, e) => {
		console.log("account "+ from + "unlock sucess");
		contract.methods.createUser(testAddr, "ym").send(options).on("transactionsHash", hash => {
		console.log(hash)
	}).on("confirmation", (confirmNum, receipt)=> {
		console.log(confirmNum, receipt)
	}).catch(err => {
		console.log(err)
	});
	})
		// 通过web3调用合约内的方法
}

 // testAccount()

function testAccount() {
	let gasPrice = web3.eth.getGasPrice().then(console.log);
	// let account = web3.eth.getAccounts().then(console.log);
	// let bal = web3.eth.getBalance(userAddr).then(console.log); // get eth number

	console.log(gasPrice); 
	// console.log(web3)
}

