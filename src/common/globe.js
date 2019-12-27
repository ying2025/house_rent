const disAmount = 400000000;
const disAddr = "0x16c0b9cb893BA4392131df01e70F831A07d02687";
const privKey = "0xEAEC183C4BADF7D89DEEF365F668C5D1C4FD47ADDC835F75EA2B572DA2502953";
const regAddr = "0x5AcA28f9da9960145e81c11293F94ad115ca3218";
const regpri = "0x8C6817D77CFD962F6EAB191251B9720D3EB76221AE5A28379C9B3D03EC68EA8A";

// contract address
const tokenConAddr = "0xfed21ab2993faa0e0b2ab92752428d96370d4889";
const regConAddr = "0x5e0c84653fb7546002c9522b4adec22778ab8de4";
const remarkConAddr = "0xb7fdf357abf21d7d6aa0e956c2a4ba38651025f9";
const authConAddr= "0x0455633466ab2091171489c4c85103b530371bdb";
const houseConAddr = "0xbfd70614bd972295ee95f0aa3462950c21a7853d";
const agreeConAddr = "0x9a3494c480d27083d35ad8364d05d1e1bbd58d8c";

const promiseAmount = 50;
const houseState = {
	Release: 0,
	WaitRent: 1,
	Renting: 2,
	EndRent: 3,
	Cance: 4,
	BreakRent: 5,
	AlreadyBreak: 6
}

const agreeState = {
	WaitSign: 0, // 等待租户签约
	FinishSign: 1, // 合同签约完成
	Renting: 2, //合同已生效
	EndRent: 3, // 租赁到期
	Cance: 4, // 取消租赁
	BreakRent: 5,// 毁约审核中
	AlreadyBreak: 6// 已毁约
}

module.exports = {
	disAmount,
	disAddr,
	privKey,
	regAddr,
	regpri,
	tokenConAddr,
	regConAddr,
	remarkConAddr,
	authConAddr,
	houseConAddr,
	agreeConAddr,
	promiseAmount,
	houseState,
	agreeState
}

