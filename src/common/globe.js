const disAmount = 4;
const disAddr = "0x16c0b9cb893BA4392131df01e70F831A07d02687";
const privKey = "0xEAEC183C4BADF7D89DEEF365F668C5D1C4FD47ADDC835F75EA2B572DA2502953";
const regAddr = "0x5AcA28f9da9960145e81c11293F94ad115ca3218";
const regpri = "0x8C6817D77CFD962F6EAB191251B9720D3EB76221AE5A28379C9B3D03EC68EA8A";

// contract address
const tokenConAddr = "0xfed21ab2993faa0e0b2ab92752428d96370d4889";
const regConAddr = "0x89c93a7c4cfda689f19afb45c705c3e6a0d56a72";
const remarkConAddr = "0xb7fdf357abf21d7d6aa0e956c2a4ba38651025f9";
const authConAddr= "0x788278aefccfd3545aeebca0141115e1217ebe03";
const houseConAddr = "0x508c73a58706a11f81266b008c28633170c8bbf4";
const agreeConAddr = "0x09a9e20bd5ea225854b26a50e48f740f905fb98f";

const promiseAmount = 50;
const houseState = {
	Release: 0,
	WaitRent: 1,
	Renting: 2,
	EndRent: 3,
	Cance: 4,
	BreakRent: 5,
	AlreadyBreak: 6,
	RejectBreak: 9 // 拒绝毁约
}

const agreeState = {
	WaitSign: 0, // 等待租户签约
	FinishSign: 1, // 合同签约完成
	Renting: 2, //合同已生效
	EndRent: 3, // 租赁到期
	Cance: 4, // 取消租赁
	BreakRent: 5,// 毁约审核中
	AlreadyBreak: 6,// 已毁约
	RejectBreak: 9 // 拒绝毁约
}

const commentState = {
   AlreadyRent: 0, // 租赁已完成
   AlreadyBreak: 1, // 已毁约
   LandlordRemark: 2, // 房东已评论
   LeaserRemark: 3, // 租客已评论
   CloseRemark: 4 // 评论关闭
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
	agreeState,
	commentState
}

