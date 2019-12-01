const Tx = require('ethereumjs-tx');
var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/2571ab4c0de14ffb87392fb9c3904375"));


const fs = require("fs");
const readFile = require("util").promisify(fs.readFile);
const NoError = "";
async function run(filePath) {
  try {
      const fr = await readFile(filePath,"utf-8");
      return fr;
   } catch (err) {
      console.log('Error', err);
   }    
}
// GetContract("../ethererscan/token_abi.json", "0x6493cfdc9815a59236096e0974b75b30969c50bd", contract => {
// 	console.log(contract)
// })
function GetContract(filePath, contractAddress) {
	return new Promise((resolve, reject) => {
		run(filePath).then(abi => {
			let objABI = JSON.parse(abi);
			// console.log(contractAddress)
			let contract = new web3.eth.Contract(objABI, contractAddress,{gasPrice: '3000000'});
			resolve(contract);
		}).catch(err => {
		   console.log("Read ABI Fail:", err);
		   reject(err);
		});
	});
}
// function run(filePath) {
//   try {
//       const fr = fs.readFileSync(filePath,"utf-8");
//       return fr;
//    } catch (err) {
//       console.log('Error', err);
//    }    
// }

// function GetContract(filePath, contractAddress) {
//     let abi = run(filePath);
// 	let objABI = JSON.parse(abi);
// 	let contract = new web3.eth.Contract(objABI, contractAddress,{gasPrice: '3000000'});
// 	return contract;
// }


module.exports = {
	GetContract,
	web3
}