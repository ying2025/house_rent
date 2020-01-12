let comVar = require("../common/globe.js");
// 房东签订合同记录表
function insertCommentBreak(conn, houseId, punishAmount, punishAddr, reason, houseAddr) {
	console.log("-------insert Comment Record---------", phoneNum)
	return new Promise((resolve, reject) => {
		conn.then(con => {
			con.query("SELECT * FROM house_comment_record WHERE house_id = ? ", [houseId],  function (err, result, fields) {
			    if (err) {
			    	console.log("--release insert query error:", err);
			    	resolve({status: 203, err: err})
			    }
			    console.log(result);
			    // if (result != null && result.length != 0) { // 如果已经有该记录，则更新    	
			    // } else { // 插入评论记录表
		    	let state = comVar.CommentState.AlreadyBreak;  // houseId, punishAmount, punishAddr, reason
				let insertSql = "INSERT INTO house_comment_record (`house_id`, `house_addr`,`state`, `punish_amount`, `punish_addr`, `reason`, `createtime`, `updatetime`) VALUES ?";
				let addParam = [[houseId, houseAddr, state, punishAmount, punishAddr, reason, Date.now(), Date.now()]]; // Mul
				con.query(insertSql, [addParam], function(err, result, fileds){
					console.log("--insert comment info-----",result);
					if (err) {
						console.log("comment insert error:", err);
						resolve({status:202, data:"插入评论失败！"});
					} else {
						resolve({status:200, data:result});
					}
				})
			    // }
		    });
		}).catch(err => {
			console.log("---insert release info----", err);
			reject(err);
		});
	});
}
function insertCommentRecord(conn, houseId, houseAddr) {
	console.log("-------insert Comment Record---------", phoneNum)
	return new Promise((resolve, reject) => {
		conn.then(con => {
			con.query("SELECT * FROM house_comment_record WHERE house_id = ? ", [houseId],  function (err, result, fields) {
			    if (err) {
			    	console.log("--release insert query error:", err);
			    	resolve({status: 203, err: err})
			    }
			    console.log(result);
			    // if (result != null && result.length != 0) { // 如果已经有该记录，则更新    	
			    // } else { // 插入评论记录表
		    	let state = comVar.CommentState.AlreadyRent;  // houseId, punishAmount, punishAddr, reason
				let insertSql = "INSERT INTO house_comment_record (`house_id`, `house_addr`, `state`, `createtime`, `updatetime`) VALUES ?";
				let addParam = [[houseId, houseAddr, state, Date.now(), Date.now()]]; // Mul
				con.query(insertSql, [addParam], function(err, result, fileds){
					console.log("--insert comment info-----",result);
					if (err) {
						console.log("comment insert error:", err);
						resolve({status:202, data:"插入评论失败！"});
					} else {
						resolve({status:200, data:result});
					}
				})
			    // }
		    });
		}).catch(err => {
			console.log("---insert release info----", err);
			reject(err);
		});
	});
}
// 查询房东签订信息
function getComment(conn, houseId) {
	console.log("-------query comment--------", houseId)
	return new Promise((resolve, reject) => {
		conn.then(con => {
			let sql, criteria;
			if (!houseId || houseId == '0x') {
				sql = "SELECT * FROM house_comment_record";
				criteria = [];
			} else {
				sql = "SELECT * FROM house_comment_record WHERE `house_id` = ?";
				criteria = [houseId];
			} 
			con.query(sql, criteria,  function (err, result, fields) {
			    if (err) {
			    	console.log(err);
			    	resolve({status:false, err:err});
			    } else {
			    	resolve({status: true, data:result});
			    }
		    });
		}).catch(err => {
			console.log("----query-comment--error---", err)
			reject(err);
		});
	});
}

// leaser更新评论信息
function leaserUpdateComment(conn, houseId, leaserRemarkScope, leaserComment, leaserAddr) {
	console.log("-------update Comment Record---------", houseId);
	return new Promise((resolve, reject) => {
		conn.then(con => {
		    let sql = "UPDATE `house_comment_record` SET `leaser_remark_scope` = ?, `leaser_addr` = ?, `state` = ?, `leaser_comment` = ?, `updatetime` = ? WHERE `house_id` = ?";
			let condition = [leaserRemarkScope, leaserAddr, comVar.commentState.LeaserRemark, leaserComment, Date.now(), houseId];
			con.query(sql, condition, function(err, result, fileds){
				console.log("---update ---", result);
			});
			con.query("SELECT * FROM house_comment_record WHERE house_id = ? ", [houseId],  function (err, result, fields) {
			    if (err) {
			    	console.log("Query release after update info" ,err);
			    	reject(err);
			    }
			    resolve({status: true, err: result});
		    });
		}).catch(err => {
			console.log("----query-release--error---" ,err)
			reject(err);
		});
	});
}

// landlord更新评论信息
function landlordUpdateComment(conn, houseId, landlordRemarkScope, landlordComment, landlordAddr) {
	console.log("-------update Comment Record---------", houseId);
	return new Promise((resolve, reject) => {
		conn.then(con => {
		    let sql = "UPDATE `house_comment_record` SET `landlord_remark_scope` = ?, `landlord_addr` = ?, `state` = ?, `landlord_comment` = ?, `updatetime` = ? WHERE `house_id` = ?";
			let condition = [landlordRemarkScope, landlordAddr, comVar.commentState.LandlordRemark, landlordComment, Date.now(), houseId];
			con.query(sql, condition, function(err, result, fileds){
				console.log("---update ---", result);
			});
			con.query("SELECT * FROM house_comment_record WHERE house_id = ? ", [houseId],  function (err, result, fields) {
			    if (err) {
			    	console.log("Query release after update info" ,err);
			    	reject(err);
			    }
			    resolve({status: true, err: result});
		    });
		}).catch(err => {
			console.log("----query-release--error---" ,err)
			reject(err);
		});
	});
}

// 更新签订合同信息
function updateCommentState(conn, houseId, state) {
	console.log("-------update Agree Record--state-------", houseId, state);
	return new Promise((resolve, reject) => {
		conn.then(con => {
			let sql = "UPDATE `house_comment_record` SET `state` = ?, `updatetime` = ? WHERE `house_id` = ?";
			let condition = [state, Date.now(), houseId];
			con.query(sql, condition, function(err, result, fileds){
				console.log("---update ---", result);
			});
			con.query("SELECT * FROM house_comment_record WHERE house_id = ? ", [houseId],  function (err, result, fields) {
			    if (err) {
			    	console.log("Query agreement record after update info" ,err);
			    	reject(err);
			    }
			    resolve({status: true, err: result});
		    });
		}).catch(err => {
			console.log("----query-agreement record--error---" ,err)
			reject(err);
		});
	});
}


module.exports = {
	insertCommentBreak,
	insertCommentRecord,
	getComment,
	leaserUpdateComment,
	landlordUpdateComment,
	updateCommentState
}