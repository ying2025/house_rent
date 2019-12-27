let HouseFun = require("./get_house.js");
let RegisterFun = require("./get_register.js");
let web3 = require("./common/contract_com.js").web3;

testRegister()

function testRegister() {
	RegisterFun.initReg().then(con => {
		let addr = "0x12bb671c44c2593efaae0108d4db4b838792c3cc";
		let name = "forget2019";
		RegisterFun.isAlreayReg(con, addr, name).then(res => {
			console.log(res)
		})
	});
}

function testHouse() {
	HouseFun.initHouseFun().then(con => {
	let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";	
	let priKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
	let username = "zs";
	let houseAddr = "It lies in SanFan, the beautiful city!";
	let des = "It's very beautiful, and it has a lot of fun";
	let info = "Greate info";
	let hopeCtx = "Hope you are easygoing";
	// HouseFun.releaseHouse(con, addr, priKey, houseAddr, 5, des, info, 12, 320000000000, hopeCtx).then(res => {
	// 	if (res) {
	// 		console.log(res);
	// 	}
	// });
	// house id : 0x2a43eecd35d6b76aef7c08c9ab761ae366bd19018492fe8de12799ec342ac69f
	let addr2 = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
	let priKey2 = "0x502D29356356AE02B7E23ECC851CCA0F21FE9CDADEF1FBAB158EB82611F27229";

	let houseId = "0x94efed96b0fa279522423d1a558ea49dfdc4c17186dadfe59657aa9d73f3f6ff";
	let realRent = 320000000000;
	// requestSign(con, addr2, priKey2, houseId, realRent).then(res => {
	// 	if (res) {
	// 		console.log(res);
	// 	}
	// });
	let signHowLong = 12;
	let rental = 320000000000;
	let yearRent = signHowLong*rental;
	let username2 = "ym";
	// signAgreement(con, addr, priKey, houseId, username, signHowLong, rental, yearRent).then(res => {
	// 	console.log(res)
	// })
	let addrChecker = "0x8E0f4A1f3C0DBEA0C73684B49aE4AD02789B3EC4";
	let priKeyChecker = "0xFFE962244D80F95197089FE5FF87BE0163D485E7986A7070A498136012FD7B61";
	let punishAmount = 5000000000;
	let punishAddr = addr;
	let reason = "Donnt observe the rule2";
	// checkBreak(con, addrChecker, priKeyChecker, houseId, punishAmount, punishAddr).then(res => {
	// 	console.log(res)
	// });
	// breakContract(con, addr2, priKey2, houseId, reason).then(res => {

	// });
	let amount = 2000000000;
	// withdraw(con, addr2, priKey2, houseId, amount).then(res => {

	// });
	let ratingIndex = 3;
	let remark = "It is very good.";
	// const disRrkAddr = "0x16c0b9cb893BA4392131df01e70F831A07d02687";
	// commentHouse(con, addr2, priKey2, houseId, ratingIndex, remark).then(res => {

	// });
	let houseId3 = "0x6eff8e3db86afe6dbcde6c10b81fbce7b7d6b88e77516d1ba644816a21e76868";
	let houseId2 = "0x81800316020f90b6b421cdd4ed1cba7310b271c1c913f2de6e10d7b96dad65c8";
	HouseFun.getHouseRelaseInfo(con, houseId3).then(res => {
		console.log(res, res.data[0], 1111)
	});
	// let formAddr = "0xb173a99bf933a4b6b13cf5532efd75b894fba55d"
	// web3.eth.getTransactionCount(formAddr, 'pending').then(nonce => {
	// 	console.log(nonce)
	// });
	// HouseFun.getHouseBasic(con, houseId3).then(res => {
	// 	console.log(res)
	// })
});
}