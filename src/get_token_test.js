let TokenFun = require("./get_token.js");
// let RegisterFun = require("./get_register.js");
let web3 = require("./common/contract_com.js").web3;
TokenFun.initToken().then(con => {
   // let addr = "0xb829d1285c19462C85f935774458BE90aE9E8973";
   // getBalance(con, addr).then(res => {
   //   console.log(res);
   // });
   let to = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
   // let from = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
   let addr = "0x8E0f4A1f3C0DBEA0C73684B49aE4AD02789B3EC4";
   let privKey = "0xFFE962244D80F95197089FE5FF87BE0163D485E7986A7070A498136012FD7B61";
   // transfer(con, addr3, privKey3, addr2, addr3, 200000000).then((receipt, reject) => {
   //   console.log(receipt.transactionHash)
   // });
   let spender = "0x1b9d88664a697e210ace82549ad9c6d21eac21ca";
   // TokenFun.transferApprove(con, spender, 2000000000, addr, privKey).then(res => {
   // 		console.log(receipt.transactionHash);
   // });
   let prk2="0xd5fe65e6a34b0290a4c45e6b53bdeb959b2ba0d62c30c39357bc5b905b7baa3e";
   TokenFun.transferToken(con, addr, to, 20, spender, prk2).then(res => {
   	  console.log(res.transactionHash);
   });
});