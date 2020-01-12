let getContract = require("./common/contract_com.js").GetContract;
let filePath = "./ethererscan/house_abi.json";
let web3 = require("./common/contract_com.js").web3;
let Web3EthAbi = require('web3-eth-abi');
let comVar = require("./common/globe.js");
let dbFun = require("./db/house.js");
let dbAgreeFun = require("./db/agree.js");
let dbCommentFun = require("./db/comment.js");
let nonceMap = new Map();
let RegisterFun = require("./get_register");
let TokenFun = require("./get_token");
let contractAddress = comVar.houseConAddr;
async function initHouseFun() {
  let contract = await getContract(filePath, contractAddress);
  return contract;
}

function checkLogin(addr) {
  // 必须先登录
  return new Promise((resolve, reject) => {
    RegisterFun.initReg().then(con => {
      RegisterFun.isLogin(con, addr).then(res => {
        resolve(res);
      }).catch(err1 => {
        console.log("checkLogin error", err1);
        reject(err1)
      });
    }).catch(err => {
      console.log("Register init fail", err);
      reject(err);
    });
  });
}

function releaseHouse(db, contract, contractToken, addr, privateKey, houseAddr, huxing, des, info, tenancy, rent, hopeCtx) {
  return new Promise((resolve, reject) => {
    console.log("release===")
    contractToken.then(con => {
      console.log(addr.length, addr);
      TokenFun.getBalance(con, addr).then(bal => {
        console.log("bal", bal, typeof(bal), bal.data.length)
        if (!bal.status) {
            resolve({status: false, err: "RentToken数量不能满足保证金要求!"});
            return;
        }
        let tempBal = bal.data;
        let n = tempBal.length;
        let newBal;
        if (n > 6) {
           let temp = tempBal.slice(0, -6);
           let newBal = parseFloat(temp)/100;
           console.log("After parese value", temp, newBal);
           if (newBal < comVar.promiseAmount) {
              resolve({status: false, err: "RentToken数量不能满足保证金要求!余额为："+newBal});
           } else {
              console.log("---start release house---")
            checkLogin(addr).then(flag => {
            if (!flag) {
              console.log("Please login in first");
              resolve({status: false, err: "该用户未登录，请先登录!"});
            } else { // TokenFun
              const releaseFun = contract.methods.releaseHouse(houseAddr, huxing, des, info, tenancy, rent, hopeCtx);
                const relABI = releaseFun.encodeABI();
                packSendMsg(addr, privateKey, contractAddress, relABI).then(receipt => {
                    if (receipt) {
                      console.log("Release house success!");
                      let tx_hash="", house_hash="";
                      let [flag, ctx, logRes] = decodeLog(contract, receipt, 'RelBasic');
                            if (flag) {
                              console.log("release house receive: ", ctx, logRes);
                              tx_hash = ctx.transactionHash;
                              house_hash = logRes.houseHash;
                              console.log("===house_hash==", logRes, house_hash)
                              resolve({status:true, data:{trans: ctx.transactionHash, houseId: logRes.houseHash}});
                            } else {
                              resolve({status:false, err:"发布房源失败!"});
                            } 
                            const house_state = comVar.houseState.Release;
                            console.log("house state:", house_state, house_hash);
                            dbFun.insertRealseInfo(db, "", addr, houseAddr, huxing, des, info, tenancy, rent, hopeCtx, house_state, tx_hash, house_hash);
                    }
              }).catch(err => {
                console.log("Release fail!", err);
                reject({status:false, err:"请检查房屋是否已认证，余额是否满足保证金最少要求！"});
              });
            }
          }).catch(err1 => {
                 console.log("Create user error", err1);
                 reject({status:false, err:"网络繁忙，请稍后重试!"});
              });
           }
        } else {
          resolve({status: false, err: "RentToken余额不能满足发布房屋保证金的要求！"})
        }
      }).catch(err => {
        console.log("get balance parse error", err);
        reject({status: false, err: err});
      })
    });
  });
}

function requestSign(db, contract, addr, privateKey, houseId, realRent) {
  return new Promise((resolve, reject) => {
    // Judge whether the user has logged in
    checkLogin(addr).then(flag => {
      if (!flag) {
        console.log("Please login in first");
        resolve({status: 203, err: "请先登录！"});
      } else {
        getHouseRelaseInfo(contract, houseId).then(info => {
          console.log("get house release", info)
          if (info && info.status && info.data && parseInt(info.data[0]) != 0) {
            console.log("get====")
            resolve({status: 204, err: "该房屋已被预定！"});
            if (info.data) {
              let state = parseInt(info.data[0]);
              console.log("house state", state);
                dbFun.updateReleaseInfo(db, "", addr, houseId, state);
            }
          } else {
            console.log("=request sign=", houseId, realRent);
            const reqFun = contract.methods.requestSign(houseId, realRent);
              const reqABI = reqFun.encodeABI();
              console.log("Start request!", addr);
              packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
                  if (receipt) {
                    console.log("Request the house success!");
                    let [flag, ctx, logRes] = decodeLog(contract, receipt, 'RequestSign');
                          if (flag) {
                            console.log("request house receive: ", ctx)
                            resolve({status:200, data: ctx.transactionHash});
                            let house_state = comVar.houseState.WaitRent; 
                            dbFun.updateReleaseInfo(db, "", addr, houseId, house_state);
                          } else {
                            resolve({status:205, err:"网络异常，未获得链上数据!"});
                          } 
                  } else {
                    console.log("Release house fail!");
                    resolve({status:206, err:"请求签订房源失败!"});
                  }
            }).catch(err => {
              console.log("Release fail!", err);
              reject({status: 207, err: "请检查该房屋是否已经被预定，账户余额是否充足!"});
            });
          }
        });
      }     
    });   
  });
}

function withdraw(contract, addr, privateKey, houseId, amount) {
  return new Promise((resolve, reject) => {
    console.log("==withdraw==", addr, houseId);
    const withFun = contract.methods.withdraw(houseId, amount);
      const withABI = withFun.encodeABI();
      packSendMsg(addr, privateKey, contractAddress, withABI).then(receipt => {
          if (receipt) {
            console.log("Withdraw the coin success!");
            let [flag, ctx, logRes] = decodeLog(contract, receipt, 'WithdrawDeposit');
                if (flag) {
                  console.log("withdraw the promise receive: ", ctx)
                  resolve({status:flag, data: ctx.transactionHash});
                } else {
                  resolve({status:false, err:"退款失败!"});
                }
          } 
    }).catch(err => {
      console.log("Withdraw occure error!", err);
      reject({stats: false, err: err});
    });
  });
}

function breakContract(db, contract, addr, privateKey, houseId, reason) {
  return new Promise((resolve, reject) => {
        checkLogin(addr).then(flag => {
            if (!flag) {
                console.log("Please login in first");
                resolve({status:203, err: "请先登录！"});
            } else {
                getHouseRelaseInfo(contract, houseId).then(info => {
                  if (info && info.status && info.data && (parseInt(info.data[0]) == 5 || parseInt(info.data[0]) == 6)) {
                      resolve({status:207, err:"已申请毁约!"});
                      console.log("break contract", info.data)
                      dbFun.updateReleaseInfo(db, "", addr, houseId, parseInt(info.data[0]));
                      dbAgreeFun.updateAgreeState(db, houseId, parseInt(info.data[0])); // 乙方已签订合同，合同正式生效 
                  } else {
                    const reqFun = contract.methods.breakContract(houseId, reason);
                    const reqABI = reqFun.encodeABI();
                    console.log("Start Break the contract!", addr);
                    packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
                        if (receipt) {
                            // web3.eth.getTransactionReceipt(receipt.transactionHash).then(transaction => {
                            //     console.log("getTransactionReceipt", transaction);
                            //     if (transaction.status) {
                            //        console.log("Break Contract success!");
                            //     } else {
                            //       resolve({status:204, err: "获取不到链上收据"});
                            //       return;
                            //     }
                            // });
                            let [flag, ctx, logRes] = decodeLog(contract, receipt, 'BreakContract');
                            if (flag) {
                              console.log("Break the contract receive: ", ctx)
                              resolve({status:200, data: ctx.transactionHash});
                              let house_state = comVar.houseState.BreakRent; 
                              dbFun.updateReleaseInfo(db, "", addr, houseId, house_state);
                              dbAgreeFun.updateAgree(db, houseId, reason, comVar.agreeState.BreakRent); // 毁约
                            } else {
                              resolve({status:205, err:"毁约失败!"});
                            }
                        }
                    }).catch(err => {
                       console.log("Break the contract occure error!", err);
                       reject(err);
                    });         
                  }
                }).catch(err => {
                   console.log("Break the contract occure error!", err);
                   reject(err);
                });  
            }
        }).catch(err => {
           console.log("Break the contract occure error!", err);
           reject(err);
        }); 
  });
}

function checkBreak(db, contract, houseId, punishAmount, punishAddr, addr, privateKey) {
  return new Promise((resolve, reject) => {
      getHouseRelaseInfo(contract, houseId).then(info => {
          if (info && info.status && info.data && parseInt(info.data[0]) != 5) { // 状态为申请毁约，否则更新状态
              resolve({status:207, err:"房源当前不处于毁约申请中!"});
              dbFun.updateReleaseInfo(db, "", addr, houseId, parseInt(info.data[0]));
              dbAgreeFun.updateAgreeState(db, houseId, parseInt(info.data[0])); 
          } else {
              const reqFun = contract.methods.checkBreak(houseId, punishAmount, punishAddr);
              const reqABI = reqFun.encodeABI();
              console.log("Start Check Break the contract!", addr);
              packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
                  if (receipt) {
                    console.log("Check Break Contract success!");
                    let [flag, ctx, logRes] = decodeLog(contract, receipt, 'ApprovalBreak');
                        if (flag) {
                          console.log("Check Break the contract receive: ", ctx)
                          resolve({status:flag, data: ctx.transactionHash});
                          let house_state = comVar.houseState.AlreadyBreak; 
                          dbFun.updateReleaseInfo(db, "", addr, houseId, house_state);
                          let rtnData = dbAgreeFun.updateAgreeState(db, houseId, comVar.agreeState.AlreadyBreak);
                          console.log(rtnData)
                          if (rtnData.status) {
                             let reason = rtnData.reason;
                             dbCommentFun.insertCommentBreak(db, houseId, punishAmount, punishAddr, reason, rtnData.house_addr);
                          }
                        } else {
                          resolve({status:false, err:"审核失败!"});
                        }
                  } 
              }).catch(err => {
                console.log("Check Break the contract occure error!", err);
                 reject(err);
              });
          }
      }).catch(err => {
          console.log("get release info error", err)
          reject(err)
      });
  });
}

// 评论房源
function commentHouse(db, contract, relType, houseId, ratingIndex, remark, addr, privateKey) {
  return new Promise((resolve, reject) => {
    TokenFun.initToken().then(con => {
          TokenFun.transferApprove(con, addr, comVar.disAmount, comVar.disAddr, comVar.privKey).then((res, rej) => {
            console.log(res, addr)
            if (res) {
                const reqFun = contract.methods.commentHouse(houseId, ratingIndex, remark);
                const reqABI = reqFun.encodeABI();
                console.log("Start comment the house!", addr);
                packSendMsg(addr, privateKey, contractAddress, reqABI).then(receipt => {
                    let [flag, ctx, logRes] = decodeLog(contract, receipt, 'CommentHouse');
                    console.log("Decode comment the contract receive: ", ctx)
                    resolve({status:200, data: ctx.transactionHash});
                    if (relType == '1' || relType == 1) { // 房东
                        dbCommentFun.landlordUpdateComment(db, houseId, ratingIndex, remark, addr);
                    } else { // 租户  
                        dbCommentFun.leaserUpdateComment(db, houseId, ratingIndex, remark, addr);
                    }  
                }).catch(err => {
                   console.log("Comment the house occure error!", err);
                   reject(err);
                });
            }
          }).catch(err => {
               console.log("approve error", err);
               resolve({status: 204, err: "授权失败！"});
          });
    }).catch(err => {
       console.log("Init token", err);
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

function getHouseBasic(contract, houseId) {
  return new Promise((resolve, reject) => {
    contract.methods.getHouseBasicInfo(houseId).call().then(res => {
      console.log(res);
    }).catch(err => {
      console.log("get house basic information err:", err);
      reject(err);
    });
  });
}

function getHouseRelaseInfo(contract, houseId) {
  return new Promise((resolve, reject) => {
    console.log("---get House Relase Info---",houseId)
    contract.methods.getHouseReleaseInfo(houseId).call().then(res => {
      console.log(res);
      resolve({status: true, data: res});
    }).catch(err => {
      console.log("get house relase information err:", err);
      reject(err);
    });
  });
}

module.exports = {
  initHouseFun,
  releaseHouse,
  requestSign,
  withdraw,
  breakContract,
  checkBreak,
  commentHouse,
  getHouseBasic,
  getHouseRelaseInfo
}