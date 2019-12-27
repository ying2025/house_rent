let http = require('http');
const express = require('express');
let initParam = require("./init.js");
let RegisterFun = require("./get_register.js");
let TokenFun = require("./get_token.js");
let HouseFun = require("./get_house.js");
let RemarkFun = require("./get_remark.js");
let AuthFun = require("./get_auth.js");
let AgreeFun = require("./get_agree.js");
let comCos = require("./common/globe.js");

// db opt
let addrManager = require("./db/addr.js");
let houseManager = require("./db/house.js");
let authManager = require("./db/auth.js");
let agreeManager = require("./db/agree.js");

let configuration = initParam.configuration;
let regLists = new Map();
initialize()
function initialize() {
  return new Promise((resolve, reject) => {
  const app = express();
  server = http.createServer(app);
  let contractToken = TokenFun.initToken();
  let contractReg = RegisterFun.initReg();
  let contractHouse = HouseFun.initHouseFun();
  let contractRemark = RemarkFun.initRemark();
  let contractAuth = AuthFun.initAuth();
  let contractAgree = AgreeFun.initAgreeFun();
  let conn = initParam.connDb();
  console.log("----Init-----")
  // 
  app.get('/bindaddr/:userid/:address', (req, res) => {
    console.log("-----bind userid and address params----", req.params)
    setResHeadr(res);
    addrManager.insertUserAddress(conn, req.params.userid, req.params.address).then(ctx => {
        console.log(ctx)
        res.send(ctx);
    }).catch(err => {
        // console.log("bind address err:", err)
        res.send({status: false, err: err});
    });
  });
  app.get('/getaddr/:userid', (req, res) => {
    console.log("-----get userid and address params----", req.params)
    setResHeadr(res);
    addrManager.queryUserAddress(conn, req.params.userid,req.params.username, req.params.address).then(ctx => {
        console.log(ctx)
        res.send(ctx);
    }).catch(err => {
        // console.log("get address error", err)
        res.send({status: 204, err: err});
    });
  });
  // 获取用户链上状态
  app.get('/getstatus/:addr', (req, res) => {
    console.log("-----get userid and address params----", req.params)
    setResHeadr(res);
    addrManager.queryUserStatus(conn, req.params.addr).then(ctx => {
        console.log(ctx)
        res.send(ctx);
    }).catch(err => {
        console.log("get status error", err)
        res.send({status: 204, err: err});
    });
  });
  // 注册
  app.get('/register/:address/:username/:userId/:pwd/:cardId', (req, res) => {
    console.log("-----get adddress params----", req.params)
    setResHeadr(res);
    contractReg.then(con => {
        console.log("reg contract");
          RegisterFun.createUser(conn, con, req.params.address,req.params.username, req.params.userId, req.params.pwd, req.params.cardId).then(ctx => {
            console.log(ctx)
            res.send(ctx);
          }).catch(err => {
            console.log("register error:", err)
            res.send(err);
          });       
      }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  // 登录
  app.get('/login/:address/:username/:pwd/:prikey', (req, res) => {
    console.log("-----login params----", req.params)
    setResHeadr(res);
    contractReg.then(con => {
      console.time("login");
      console.log("start login contract");
      RegisterFun.login(conn, con, req.params.prikey, req.params.address,
          req.params.username, req.params.pwd).then(ctx => {
        res.send(ctx);
      }).catch(err => {
          console.log("Login callback", err);
          res.send(err);
      });
      console.timeEnd("login")
    }).catch(err => {
      // console.log("login err", err);
      res.send({
        "status": false,
        "err": err
      });
    });
  });
  app.get('/logout/:address/:username/:pwd/:prikey', (req, res) => {
    console.log("-----get adddress params----", req.params)
    contractReg.then(con => {
      RegisterFun.logout(con, req.params.prikey, req.params.address,req.params.username, req.username.pwd).then(ctx => {
         res.send(ctx);
      });
    }).catch(err => {
      res.send({
        "status": false,
        "err": err
      });
    });
  });
  //Token transfer
  app.get('/transfertoken/:to/:amount/:address/:prikey', (req, res) => {
      console.log("-----get transfer token params----", req.params)
      setResHeadr(res);
      contractToken.then(con => { 
          TokenFun.transferToken(con, req.params.to, req.params.amount, req.params.address, req.params.prikey).then(ctx => {
              res.send(ctx);
          }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
          });
      });  
  });
  //Eth transfer
  app.get('/transfereth/:to/:amount/:address/:prikey', (req, res) => {
      console.log("-----get transfer eth params----", req.params)
      setResHeadr(res);
      contractToken.then(con => { 
          TokenFun.transferEth(con, req.params.to, req.params.amount, req.params.address, req.params.prikey).then(ctx => {
              res.send(ctx);
          }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
          });
      });
  });
  app.get('/approvetransfer/:to/:amount/:address/:prikey', (req, res) => {
      console.log("-----get transfer approve params----", req.params)
      setResHeadr(res);
      contractToken.then(con => { 
          TokenFun.transferApprove(con, req.params.to, req.params.amount, req.params.address, req.params.prikey).then(ctx => {
              res.send(ctx);
          }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
          });
      });  
  });
  // 房屋认证
  app.get('/auth/:address/:idcard/:guid/:ownername/:userid/:prikey', (req, res) => {
      console.log("-----authenticate house params----", req.params)
      setResHeadr(res);
      contractAuth.then(con => {
         AuthFun.authHouse(conn, con, req.params.address, req.params.idcard, req.params.guid, req.params.ownername, req.params.userid, req.params.prikey).then(ctx => {
            res.send(ctx);
         }).catch(err => {
            res.send(err);
         });
      }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
      });
  });
  // 请求查看房屋授权
  app.get('/requestapprove/:houseid/:landlord_addr/:leaser_addr', (req, res) => {
      console.log("-----request approve params----", req.params)
      setResHeadr(res);
      authManager.insertApproRecord(conn, req.params.leaser_addr, req.params.landlord_addr, req.params.houseid).then(ctx => {
          console.log(ctx)
          res.send(ctx);
      }).catch(err => {
          console.log("request approve error", err)
          res.send({status: 204, err: err});
      });
  });
  // 授权某个用户访问认证信息
  app.get('/approve/:houseid/:leaseraddr/:landlordaddr/:prikey', (req, res) => {
      console.log("-----approve house params----", req.params)
      setResHeadr(res);
      contractAuth.then(con => {
         AuthFun.approveVisit(conn, con, req.params.houseid, req.params.leaseraddr, req.params.landlordaddr, req.params.prikey).then(ctx => {
            res.send(ctx);
         }).catch(err => {
            res.send(err);
         });
      }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
      });
  });
  app.get('/getAuthInfo/:houseid/:leaser_addr', (req, res) => {
      console.log("-----authenticate house params----", req.params)
      setResHeadr(res);
      contractAuth.then(con => {
         AuthFun.getHouseOwer(con, req.params.houseid, req.params.leaser_addr).then(ctx => {
            res.send(ctx);
         }).catch(err => {
            res.send(err);
         });
      }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
      });
  });
  // reject approve
  app.get('/reject/:houseid/:leaser_addr', (req, res) => {
      console.log("-----release house params----", req.params)
      setResHeadr(res);
      authManager.updateAuthInfo(conn, req.params.houseid, req.params.leaser_addr, 2).then(ctx => {
          console.log(ctx)
          res.send(ctx);
      }).catch(err => {
          console.log("get address error", err)
          res.send({status: 204, err: err});
      });
  });
  // get auth
  app.get('/getauth/:houseid', (req, res) => {
      console.log("-----release house params----", req.params)
      setResHeadr(res);
      authManager.queryApprove(conn, req.params.houseid).then(ctx => {
          console.log(ctx)
          res.send(ctx);
      }).catch(err => {
          console.log("get address error", err)
          res.send({status: 204, err: err});
      });
  });
  // House 
  app.get('/release/:address/:prikey/:houseaddr/:des/:info/:tenancy/:rent/:hopectx', (req, res) => {
      console.log("-----release house params----", req.params);
      setResHeadr(res);
      contractHouse.then(con => {
        HouseFun.releaseHouse(conn, con, contractToken, req.params.address, req.params.prikey, req.params.houseaddr, 0, req.params.des, req.params.info, req.params.tenancy, req.params.rent, req.params.hopectx).then(ctx => {
          res.send(ctx);
        }).catch(err => {
          res.send(err);
        });
      }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  // 获取发布的房源
  app.get('/gethouse/:houseid/:housestate', (req, res) => {
      console.log("-----release house params----", req.params)
      setResHeadr(res);
      houseManager.queryReleaseInfo(conn, req.params.houseid,req.params.housestate).then(ctx => {
          console.log(ctx)
          res.send(ctx);
      }).catch(err => {
          console.log("get address error", err)
          res.send({status: 204, err: err});
      });
  });
  // 预定房屋
  app.get('/requestsign/:address/:prikey/:houseid/:realrent', (req, res) => {
      console.log("-----request sign house params----", req.params)
      setResHeadr(res);
      contractHouse.then(con => {
          HouseFun.requestSign(conn, con, req.params.address, req.params.prikey, req.params.houseid, req.params.realrent).then(ctx => {
            res.send(ctx);
          }).catch(err => {
            res.send({
              "status": 201,
              "err": err
            });
          });
      });
  });
  // 签订合同
  // app.get('/sign/:address/:prikey/:name/:signlong/:rental/:yearrent', (req, res) => {
  app.get('/sign/:username/:idcard/:phonenum/:rental/:tenacy/:houseid/:houseaddr/:falsify/:housedeadline/:houseuse/:payone/:addr/:prikey', (req, res) => {
      console.log("-----sign house params----", req.params);
      setResHeadr(res);
      let params = req.params;
      contractAgree.then(con => {
          console.log("sign agreement");
          AgreeFun.signAgreement(conn, con, params.username, params.houseid, params.houseaddr, params.falsify, params.phonenum, params.idcard,
           params.tenacy, params.rental, params.housedeadline, params.houseuse, params.payone, params.addr, params.prikey).then(ctx => {
            res.send(ctx);
          }).catch(err => {
            res.send(err);
          });
      }).catch(err => {
          res.send({
            "status": false,
            "err": err
          });
      });
  });
  // 获取甲方已签订的协议
  app.get('/getagree/:houseid', (req, res) => {
      console.log("-----release house params----", req.params)
      setResHeadr(res);
      agreeManager.querySignInfo(conn, req.params.houseid).then(ctx => {
          res.send(ctx);
      }).catch(err => {
          console.log("get agree error", err)
          res.send({status: false, err: err});
      });
  });
  app.get('/leasersign/:leaser_name/:idcard/:phonenum/:houseid/:renewal_month/:break_month/:tenancy/:addr/:prikey', (req, res) => {
      console.log("-----leaser sign house params----", req.params);
      setResHeadr(res);
      contractAgree.then(con => {
          console.log("sign agreement"); // db, contract, leaserName, houseId, phoneNum, idCard, renewalMonth, breakMonth, addr, privateKey
          let params = req.params;
          AgreeFun.leaserSign(conn, con, contractHouse, params.leaser_name, params.houseid, params.phonenum, 
              params.idcard, params.renewal_month, params.break_month, params.tenancy,params.addr, params.prikey).then(ctx => {
            res.send(ctx);
          }).catch(err => {
            res.send(err);
          });
      }).catch(err => {
          console.log("==err=", err);
          res.send({
            "status": false,
            "err": err
          });
      });
  });
  // 完成租赁
  app.get('/complete/:houseid/:addr/:prikey', (req, res) => {
      console.log("-----leaser sign house params----", req.params);
      setResHeadr(res);
      contractAgree.then(con => {
          console.log("sign agreement"); // db, contract, leaserName, houseId, phoneNum, idCard, renewalMonth, breakMonth, addr, privateKey
          let params = req.params;
          AgreeFun.endRent(conn, con, params.houseid, params.addr, params.prikey).then(ctx => {
            res.send(ctx);
          }).catch(err => {
            res.send(err);
          });
      }).catch(err => {
          console.log("=endRent=err=", err);
          res.send({
            "status": false,
            "err": err
          });
      });
  });
  // 毁约
  app.get('/break/:houseid/:reason/:address/:prikey', (req, res) => {
      console.log("-----sign house params----", req.params);
      setResHeadr(res);
      contractHouse.then(con => {
          HouseFun.breakContract(conn, con, req.params.address, req.params.prikey, req.params.houseid, req.params.reason).then(ctx => {
             res.send(ctx);
          }).catch(err => {
            res.send({
              "status": 201,
              "err": err
            });
          });
      });
  });
  // 审查毁约
  app.get('/checkbreak/:houseid/:punishaddr/:punishamount/:address/:prikey', (req, res) => {
      console.log("-----check break agreement params----", req.params)
      setResHeadr(res);
      contractHouse.then(con => {
          HouseFun.checkBreak(conn, con, req.params.houseid, req.params.punishamount, req.params.punishaddr, req.params.address, req.params.prikey).then(ctx => {
            res.send(ctx);
          }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
          });
      });
  });
  app.get('/transfereth/:to/:amount/:address/:prikey', (req, res) => {
      console.log("-----get transfer eth params----", req.params)
      setResHeadr(res);
      contractToken.then(con => { 
          TokenFun.transferEth(con, req.params.to, req.params.amount, req.params.address, req.params.prikey).then(ctx => {
              res.send(ctx);
          }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
          });
      });
  });
  app.get('/getbalance/:address', (req, res) => {
      console.log("-----get balance params----", req.params)
      setResHeadr(res);
      contractToken.then(con => { 
          TokenFun.getAllBalance(con, req.params.address).then(ctx => {
              res.send(ctx);
          }).catch(err => {
            res.send({
              "status": false,
              "err": err
            });
          });
      });
  });
  // 退币
  app.get('/withdraw/:address/:prikey/:houseid/:amount', (req, res) => {
      console.log("-----withdraw coin params----", req.params)
      setResHeadr(res);
      contractHouse.then(con => {
          HouseFun.withdraw(con, req.params.address, req.params.prikey, req.params.houseid, req.params.amount).then(ctx => {
              res.send(ctx);
          }).catch(err => {
              console.log("==init house error==", err)
              res.send(err);
          });
      }).catch(err => {
          res.send({
            "status": false,
            "err": err
          });
      });
  });
  // 评论房屋
  app.get('/commenthouse/:address/:prikey/:houseid/:ratingindex/reamrk', (req, res) => {
      console.log("-----withdraw coin params----", req.params)
      HouseFun.commentHouse(contractHouse, req.params.address, req.params.prikey, req.params.houseid, req.params.ratingindex, req.params.reamrk).then(ctx => {
       if (ctx) { // Already sign
            res.send({
              "status": ctx.status,
              "txHash": ctx.transactionHash
            });
          }
     }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  // 获取房屋基本信息
  app.get('/getbasic/:houseid', (req, res) => {
      console.log("---------", req.params)
      HouseFun.commentHouse(contractHouse, req.params.houseid).then(ctx => {
       if (ctx) { // Already sign
            res.send({
              "status": ctx.status,
              "info": ctx
            });
          }
     }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  // 获取房屋基本信息
  app.get('/getrelease/:houseid', (req, res) => {
      console.log("---------", req.params)
      HouseFun.getHouseRelaseInfo(contractHouse, req.params.houseid).then(ctx => {
       if (ctx) { // Already sign
            res.send({
              "status": ctx.status,
              "info": ctx
            });
          }
     }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  // 获取对房东的评论
  app.get('/getremark/:houseid', (req, res) => {
      console.log("---------", req.params)
      RemarkFun.getRemarkHouse(contractRemark, req.params.houseid).then(ctx => {
       if (ctx) { // Already sign
            res.send({
              "status": ctx.status,
              "remark": ctx
            });
          }
     }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  // 获取对租户的评论
  app.get('/getremark/:houseid', (req, res) => {
      console.log("---------", req.params)
      RemarkFun.getRemarkTenant(contractRemark, req.params.houseid).then(ctx => {
       if (ctx) { // Already sign
            res.send({
              "status": ctx.status,
              "remark": ctx
            });
          }
     }).catch(err => {
        res.send({
          "status": false,
          "err": err
        });
      });
  });
  console.log("Start listen the port");
  server.listen(configuration.ServerPort,configuration.ServerAddress);
  });
}

function packSuc(res, ctx) {
  res.send({"status": ctx.status,"data": ctx});
}

function packFail(res, err) {
  res.send({"status": false,"err": err});
}

function setResHeadr(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}


module.exports = {
  initialize
}