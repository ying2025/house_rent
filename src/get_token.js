let getContract = require("./common/contract_com.js").GetContract;
let  filePath = "./ethererscan/token_abi.json";
let contractAddress = "0xfed21ab2993faa0e0b2ab92752428d96370d4889";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let nonceMap = new Map();

async function initToken() {
  let contract = await getContract(filePath, contractAddress);
  return contract;
}

// initToken().then(con => {
//    let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
//    getBalance(con, addr).then(res => {
//      console.log(res);
//    });
//    let to = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
//    // let from = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
//    let privKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
   
//    let addr2 = "0x16c0b9cb893BA4392131df01e70F831A07d02687";
//    let privKey2 = "0xEAEC183C4BADF7D89DEEF365F668C5D1C4FD47ADDC835F75EA2B572DA2502953";
//    let addr3 = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
//    let privKey3 = "0x502D29356356AE02B7E23ECC851CCA0F21FE9CDADEF1FBAB158EB82611F27229";
//    transfer(con, addr3, privKey3, addr2, addr3, 200000000).then((receipt, reject) => {
//      console.log(receipt.transactionHash)
//    });
//    let spender = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
//    // approveTransfer(con, addr, privKey, spender, 10000000000).then((receipt, reject) => {
//    //  console.log(receipt.transactionHash);
//    // });
// });

function getBalance(contract, addr) {
  return new Promise((resolve, reject) => {
    contract.methods.balanceOf(addr).call().then(res => {
      // console.log(res);
      resolve(res)
    }).catch(err => {
      console.log(err);
      reject(err);
    });
  });
}
// initToken().then(con => {
//    let from = "0x16c0b9cb893BA4392131df01e70F831A07d02687";
//    let addr3 = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
//    let privKey3 = "0x502D29356356AE02B7E23ECC851CCA0F21FE9CDADEF1FBAB158EB82611F27229";
//    transfer(con, addr3, privKey3, from, addr3, 200000000).then((receipt, reject) => {
//      console.log(receipt)
//    });
//    // getBalance(con, from).then(res => {
//    //   console.log(res);
//    // });
//    // let fromKey = "0xEAEC183C4BADF7D89DEEF365F668C5D1C4FD47ADDC835F75EA2B572DA2502953";
//    // approveTransfer(con, from, fromKey, addr3, 10000000000).then((receipt, reject) => {
//    //      console.log(receipt.transactionHash);
//    // });
// });
/**
* des: initAddr: 若是普通转账则与from相同；若是授权后的转账，则与from不同 
*/
function transfer(contract, initAddr, privateKey, from, to, amount) {
  return new Promise((resolve, reject) => {
      // console.log(contract.methods)
      const transFun = contract.methods.transferFrom(from, to, amount);
      const transABI = transFun.encodeABI();
      let gas, nonce;
      gas = 20000000000;
      web3.eth.getTransactionCount(initAddr, 'pending').then(_nonce => {
          if (nonceMap.has(initAddr) && (nonceMap[initAddr] == _nonce)) {
             _nonce += 1
          }
          nonceMap.set(initAddr, _nonce);
          nonce = _nonce.toString(16);
          const txParams = {
              gasPrice: gas,
              gasLimit: 210000,
              to: contractAddress,
              data: transABI,
              from: initAddr,
              chainId: 3,
              // value: web3.utils.toHex(amount),
              nonce: '0x' + nonce
          }
          web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
              web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
                console.log(receipt.transactionHash)
                if (receipt.status) {
                  const eventJsonInterface = contract._jsonInterface.find(
                  o => (o.name === 'Transfer') && o.type === 'event');
                  if (JSON.stringify(receipt.logs) != '[]') {
                    const log = receipt.logs.find(
                      l => l.topics.includes(eventJsonInterface.signature)
                    )
                    let houseRel = Web3EthAbi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1))
                    console.log(houseRel);
                    resolve(receipt);
                  }
                    // console.log(receipt.transactionHash)
                } else {
                  reject(receipt);
                }
              }).catch(err => {
                console.log(err);
              });
          });  
      });      
  });
}

function transferEth(contract, privateKey, from, to, amount) {
  return new Promise((resolve, reject) => {
      let gas, nonce;
      gas = 20000000000;
      web3.eth.getTransactionCount(from, 'pending').then(_nonce => {
          if (nonceMap.has(from) && (nonceMap[from] == _nonce)) {
             _nonce += 1
          }
          nonceMap.set(from, _nonce);
          nonce = _nonce.toString(16);
          const txParams = {
              gasPrice: gas,
              gasLimit: 210000,
              to: to,
              from: from,
              chainId: 3,
              value: amount,
              nonce: '0x' + nonce
          }
          web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
              web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
                if (receipt.status) {
                  console.log("transfer success!");
                  resolve(receipt);
                } else {
                  reject(receipt);
                }
              }).catch(err => {
                console.log(err);
              });
          });  
      });      
  });
}
// Call one for every contract
function approveTransfer(contract, from, privateKey,spender, amount) {
  return new Promise((resolve, reject) => {
      // console.log(contract.methods)
      const transFun = contract.methods.approve(spender, amount);
      const transABI = transFun.encodeABI();
      packSendMsg(from, privateKey, spender, transABI).then((res, rej)=> {
         resolve(res);
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
        web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
          web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
            if (receipt.status) {
              // console.log(receipt.transactionHash)
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
    initToken,
    getBalance,
    transfer,
    approveTransfer,
    transferEth
}
