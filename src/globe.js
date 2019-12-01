let http = require('http');
const express = require('express');
let initParam = require("./init.js");
let RegisterFun = require("./get_register.js");
let TokenFun = require("./get_token.js");
let HouseFun = require("./get_house.js");
let RemarkFun = require("./get_remark.js");
let AuthFun = require("./get_auth.js");
let comCos = require("./common/globe.js");

// db opt
let addrManager = require("./db/addr.js");

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
        console.log("bind address err:", err)
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
        console.log("get address error", err)
        res.send({status: 204, err: err});
    });
  });
  // 注册
  app.get('/register/:address/:username/:userId/:pwd/:cardId', (req, res) => {
    console.log("-----get adddress params----", req.params)
    setResHeadr(res);
    contractReg.then(con => {
        console.log("reg contract");
          RegisterFun.createUser(con, req.params.address,req.params.username, req.params.userId, req.params.pwd, req.params.cardId).then(ctx => {
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
      console.log("start login contract");
      RegisterFun.login(con, req.params.prikey, req.params.address,
          req.params.username, req.params.pwd).then(ctx => {
        if (ctx) { // Already sign
          res.send(ctx);
        }
      }).catch(err => {
          console.log("Login callback", err);
          res.send(err);
      });
    }).catch(err => {
      console.log("login err", err);
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
        if (ctx) { // Already sign
          res.send({
            "status": ctx.status,
            "txHash": ctx.transactionHash
          });
        }
      });
    }).catch(err => {
      res.send({
        "status": false,
        "err": err
      });
    });
  });
  //Token transfer
  app.get('/transfer/:address/:to/:amount/:prikey', (req, res) => {
    console.log("-----get transfer params----", req.params)
    TokenFun.transfer(contractToken, req.params.address, req.params.prikey, req.params.address, req.params.to, req.params.amount).then(ctx => {
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
  //Token transfer
  app.get('/transferEth/:address/:to/:amount/:prikey', (req, res) => {
      console.log("-----get transfer eth params----", req.params)
      TokenFun.transfer(contractToken, req.params.prikey, req.params.address, req.params.to, req.params.amount).then(ctx => {
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
  // 房屋认证
  app.get('/auth/:address/:idcard/:guid/:ownername/:userid/:prikey', (req, res) => {
      console.log("-----authenticate house params----", req.params)
      setResHeadr(res);
      contractAuth.then(con => {
         AuthFun.authHouse(con, req.params.address, req.params.idcard, req.params.guid, req.params.ownername, req.params.userid, req.params.prikey).then(ctx => {
           if (ctx) { 
                res.send(ctx);
            }
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
  // House 
  app.get('/release/:address/:prikey/:houseaddr/:des/:info/:tenancy/:rent/:hopectx', (req, res) => {
      console.log("-----release house params----", req.params);
      contractHouse.then(con => {
        HouseFun.releaseHouse(con, req.params.address, req.params.prikey, req.params.houseaddr, 0, req.params.des, req.params.info, req.params.tenancy, req.params.rent, req.params.hopectx).then(ctx => {
          if (ctx) { // Already sign
            res.send(ctx);
          }
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
  // 签订意向
  app.get('/requestsign/:address/:prikey/:houseid/:realrent', (req, res) => {
      console.log("-----request sign house params----", req.params)
      HouseFun.requestSign(contractHouse, req.params.address, req.params.prikey, req.params.houseid, req.params.realrent).then(ctx => {
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
  // 签订合同
  app.get('/sign/:address/:prikey/:name/:signlong/:rental/:yearrent', (req, res) => {
      console.log("-----sign house params----", req.params)
      HouseFun.signAgreement(contractHouse, req.params.address, req.params.prikey, req.params.name, req.params.signlong, req.params.rental, req.params.yearrent).then(ctx => {
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
  // 毁约
  app.get('/break/:address/:prikey/:houseid/:reason', (req, res) => {
      console.log("-----sign house params----", req.params)
      HouseFun.breakContract(contractHouse, req.params.address, req.params.prikey, req.params.houseid, req.params.reason).then(ctx => {
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
  // 审查毁约
  app.get('/checkbreak/:address/:prikey/:houseid/:punishamount/:punishaddr', (req, res) => {
      console.log("-----check break agreement params----", req.params)
      HouseFun.checkBreak(contractHouse, req.params.address, req.params.prikey, req.params.houseid, req.params.punishamount, req.params.punishaddr).then(ctx => {
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
  // 退币
  app.get('/withdraw/:address/:prikey/:houseid/:amount', (req, res) => {
      console.log("-----withdraw coin params----", req.params)
      HouseFun.withdraw(contractHouse, req.params.address, req.params.prikey, req.params.houseid, req.params.amount).then(ctx => {
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
}


module.exports = {
  initialize
}