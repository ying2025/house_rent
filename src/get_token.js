let getContract = require("./common/contract_com.js").GetContract;
let filePath = "./ethererscan/token_abi.json";
let web3 = require("./common/contract_com.js").web3;
let comVar = require("./common/globe.js");
let contractAddress = comVar.tokenConAddr;
let Web3EthAbi = require('web3-eth-abi');
let nonceMap = new Map();

async function initToken() {
  let contract = await getContract(filePath, contractAddress);
  return contract;
}


function getBalance(contract, addr) {
  return new Promise((resolve, reject) => {
    console.log("enter into get balance")
    contract.methods.balanceOf(addr).call().then(res => {
      console.log("get the balance",res);
      resolve({status: true, data: res});
    }).catch(err => {
      console.log("get bal error:",err);
      reject({status: false, err: err});
    });
  });
}

function getAllBalance(contract, addr) {
   return new Promise((resolve, reject) => {
      contract.methods.balanceOf(addr).call().then(res => {
        console.log("get the balance",res);
        web3.eth.getBalance(addr).then(bal => {
            let tokenBal, ethBal;
            if (res && bal) {
               tokenBal = parseFloat(res.slice(0, -6))/100;
               ethBal = parseFloat(bal.slice(0, -10))/100000000;
            }
            console.log(res, 11, bal, 11, tokenBal, ethBal)
            resolve({status: true, data: {"ethbal": ethBal, "tokenbal": tokenBal}});
        }).catch(err => {
          console.log("get bal error:",err);
          reject({status: false, err: err});
        });
      }).catch(err => {
        console.log("get bal error:",err);
        reject({status: false, err: err});
      });
   });
}

/**
* des: initAddr: 若是普通转账则与from相同；若是授权后的转账，则与from不同 
*/
// req.params.to, req.params.amount, req.params.address, req.params.prikey
function transferToken(contract, to, amount, from, privateKey) {
  return new Promise((resolve, reject) => {
      amount = amount * 100000000;
      const transFun = contract.methods.transferFrom(from, to, amount);
      const transABI = transFun.encodeABI();
      packSendMsg(from, privateKey, contractAddress, transABI).then(receipt => {
          if (receipt) {
            console.log("Transfer success!");
            let [flag, ctx, logRes] = decodeLog(contract, receipt, 'Transfer');
                if (flag) {
                  console.log("Transfer receive: ", ctx)
                  resolve({status:flag, data: ctx.transactionHash});
                } else {
                  resolve({status:false, err:"转账失败!"});
                }
          } 
      }).catch(err => {
          console.log("transfer token error!", err);
          reject({status: false, err: err});
      });     
  });
}

function transferEth(contract, to, amount, from, privateKey) {
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
              value: web3.utils.toWei(amount+'', 'ether'),
              nonce: '0x' + nonce
          }
          web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
              web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
                if (receipt.status) {
                  console.log("transfer success!");
                  resolve({status: true, data: receipt});
                } else {
                  resolve({status: false, err: "未获取正确的返回!"});
                }
              }).catch(err => {
                console.log("Send Error", err);
                reject({status: false, err: err});
              });
          });  
      });      
  });
}
// Call one for every contract
function transferApprove(contract, spender, amount, from, privateKey) {
  return new Promise((resolve, reject) => {
      console.log("start approve transfer", spender);
      const transFun = contract.methods.approve(spender, amount);
      const transABI = transFun.encodeABI();
       packSendMsg(from, privateKey, spender, transABI).then(receipt => {
          if (receipt) {
            console.log("Approve success!");
            let [flag, ctx, logRes] = decodeLog(contract, receipt, 'Approve');
                if (flag) {
                  console.log("Approve receive: ", ctx)
                  resolve({status:flag, data: ctx.transactionHash});
                } else {
                  resolve({status:false, err:"授权失败!"});
                }
          } 
      }).catch(err => {
          console.log("approve transfer token error!", err);
          reject({status: false, err: err});
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
        web3.eth.accounts.signTransaction(txParams, privateKey).then(signedTx => {
            web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(receipt => {
                if (receipt.status) {
                   resolve(receipt);
                } else {
                  console.log("this user already regiester");
                  reject("send sign transaction error");
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
    transferToken,
    transferApprove,
    getAllBalance,
    transferEth
}
