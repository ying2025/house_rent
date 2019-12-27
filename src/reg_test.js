let RegisterFun = require("./get_register.js");


RegisterFun.initReg().then(con => {
	// console.log(con.methods)
	let addr = "0xaDCe9984d4d2E3936A0eB6F21a6105217a3E8766";
	// isExitUserAddress(con, addr).then(res => {
	// 	console.log(res)
	// });
	let priKey = "0x36923250A8BF14292202A7932DA90A3222560E8FF3C0426FC6B6199F1EE29023";
	let username = "zs";
	let pwd = "123";
	let addr2 = "0x5b0ccb1c93064Eb8Fd695a60497240efd94A44ed";
	let priKey2 = "0x502D29356356AE02B7E23ECC851CCA0F21FE9CDADEF1FBAB158EB82611F27229";
	let username2 = "ym";
	let addr4 = "0x478aeeeb794a1098ee9d52db8a4bd1c70ec68be9";
	let priKey4 = "0x3be1831284af07413ac1b7b678c7360e177d66c1bbd0593de7b99a96da4bc98b";
	let username4 = "best2076";
	// let pwd = "pwd";
	RegisterFun.login(con, priKey4, addr4, username4, pwd).then((res, rej) => {
		console.log(4343, res);
		RegisterFun.isLogin(con, addr4).then(res => {
			console.log("isLogin", 444, res)
		});
	});
	let addr3 = "0x17B0477C515A5615f18F0E70DF144D4ec13607cf";
	let priKey3 = "0x052719F3BB83E6081F064CBF4A2087067CD55F088404D0A20DB5CDCB075D867B";
	let username3 = "ym2"; 
	// login(con, priKey3, addr3, username3, pwd).then((res, rej) => {
	// 	console.log(4343, res);
	// RegisterFun.isLogin(con, addr3).then(res => {
	// 	console.log("isLogin", 444, res)

	// });
	// });
	// logout(con, priKey, addr, username, pwd).then((res, rej) => {
	// 	console.log(res);
	// });
	// findUserInfo(con, addr).then(res => {
	// 	console.log(res);
	// })
	// let addr3 = "0x7c943AAd08FE4FAC036FD8185Db145ae88dE1bb3";
	// getFalg(con).then(res => {

	// })
	// isLogin(con, addr3).then(res => {
	// 	console.log("isLogin", 444, res)
	// 	getFalg(con).then(res => {

	// 	})
	// });
});