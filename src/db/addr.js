// 查询用户地址, userId是Phone Number
function insertUserAddress(conn, userId, addr) {
	console.log("-------insertUserAddress---------", userId)
	return new Promise((resolve, reject) => {
		conn.then(con => {
			con.query("SELECT * FROM house_addr_map_user WHERE userid = ? ", [userId],  function (err, result, fields) {
			    if (err) console.log(err);
			    console.log(result)
			    if (result != null && result.length != 0) {
			    	resolve({status:201, data: result[0].addr});
			    } else {
			    	// 插入map表
					let insertSql = "INSERT INTO house_addr_map_user (`userid`, `addr`, `createtime`, `updatetime`) VALUES ?";
					let addParam = [[userId, addr, Date.now(), Date.now()]]; // Mul
					con.query(insertSql, [addParam], function(err, result, fileds){
						console.log("--insert map--user address-----",result);
						if (err) {
							console.log(err);
							resolve({status:202, data:"该用户已经生成过地址！"});
						} else {
							resolve({status:200, data:result});
						}
					})
			    }
		    });
		}).catch(err => {
			console.log("---insert userid map address error----", err);
			reject(err);
		});
	});
}
// 查询用户地址, userId是Phone Number
function queryUserAddress(conn, userId) {
	console.log("-------queryUserAddress---------", userId)
	return new Promise((resolve, reject) => {
		conn.then(con => {
			con.query("SELECT * FROM house_addr_map_user WHERE userid = ? ", [userId],  function (err, result, fields) {
			    if (err) console.log(err);
			    if (result != null && result.length != 0) {
			    	resolve({status:true, data:result[0].addr});
			    } else {
			    	resolve({status: false, data: result});
			    }
		    });
			// con.release();
		}).catch(err => {
			console.log("----query---error---" ,err)
			reject(err);
		});
	});
}


module.exports = {
	queryUserAddress,
	insertUserAddress
}