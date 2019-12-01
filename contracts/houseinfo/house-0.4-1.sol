pragma solidity ^0.4.24;

contract ERC20Interface {
    function totalSupply() public constant returns (uint256 _totalSupply);
    function balanceOf(address _owner) public constant returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract RentToken is ERC20Interface {
    using SafeMath for uint256;
    uint256 public constant decimals = 8;

    string public constant symbol = "RentToken";
    string public constant name = "BLT";

    uint256 public _totalSupply = 40 * (10 ** 8) * (10 ** 8); // total supply is 4 billion
    uint256 public _maxIncreaseAmount = 2 * (10 ** 8) * (10 ** 8); //  every time max increase 20 millions
    uint256 public _increaseInterval = 1 years;  // 6 month interval can increase

    // Owner of this contract
    address public owner;
    uint256 public tempAmount;
    uint256 public temp;

    // Balances AAC for each account
    mapping(address => uint256) private balances;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) private allowed;

    // List of approved investors
    mapping(address => bool) private approvedInvestorList;

    // deposit
    mapping(address => uint256) private deposit;


    // totalTokenSold
    uint256 public totalTokenSold = 0;
    uint256 public releaseTokenTime = block.timestamp;

    /**
     * @dev Fix for the ERC20 short address attack.
     */
    modifier onlyPayloadSize(uint size) {
      if(msg.data.length < size + 4) {
        revert();
      }
      _;
    }
    /**
    *  @dev Only owner can modifer 
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /// @dev Constructor
    function RentToken()
        public {
        owner = msg.sender;
        balances[owner] = _totalSupply;
    }

    /// @dev Gets totalSupply
    /// @return Total supply
    function totalSupply()
        public
        constant
        returns (uint256) {
        return _totalSupply;
    }

    /// @dev Gets account's balance
    /// @param _addr Address of the account
    /// @return Account balance
    function balanceOf(address _addr)
        public
        constant
        returns (uint256) {
        return balances[_addr];
    }

    /// @dev check address is approved investor
    /// @param _addr address
    function isApprovedInvestor(address _addr)
        public
        constant
        returns (bool) {
        return approvedInvestorList[_addr];
    }

    /// @dev get ETH deposit
    /// @param _addr address get deposit
    /// @return amount deposit of an buyer
    function getDeposit(address _addr)
        public
        constant
        returns(uint256){
        return deposit[_addr];
    }


    /// @dev Transfers the balance from msg.sender to an account
    /// @param _to Recipient address
    /// @param _amount Transfered amount in unit
    /// @return Transfer status
    function transfer(address _to, uint256 _amount)
        public

        returns (bool) {
        // if sender's balance has enough unit and amount >= 0,
        //      and the sum is not overflow,
        // then do transfer
        require(_amount > 0);
        balances[msg.sender] = balances[msg.sender].Sub(_amount);
        balances[_to] = balances[_to].Add(_amount);
        Transfer(msg.sender, _to, _amount);
        return true;
    }

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in Sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
    public

    returns (bool success) {
        require(_amount > 0);
        if (balances[_from] >= _amount) {
            tempAmount = _amount;
            temp = balances[_from];
            balances[_from] = balances[_from].Sub(_amount);
            temp = balances[_from];
            allowed[_from][msg.sender] = allowed[_from][msg.sender].Sub(_amount);
            balances[_to] = balances[_to].Add(_amount);
            tempAmount = balances[_to];
            Transfer(_from, _to, _amount);
            return true;
        } else {
            return false;
        }
    }

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount)
        public

        returns (bool success) {
        require((_amount == 0) || (allowed[msg.sender][_spender] == 0));
        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);
        return true;
    }

    // get allowance
    function allowance(address _owner, address _spender)
        public
        constant
        returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function increaseAmount() internal onlyOwner  {
        uint256  nowTime = block.timestamp;
        uint256 nextTime = releaseTokenTime.Add(_increaseInterval);
        require(nextTime > nowTime);
        _totalSupply = _totalSupply.Add(_maxIncreaseAmount);
        uint256   timeInterval = 1 years;
        _increaseInterval = _increaseInterval.Add(timeInterval);
    } 

    function decreaseAmount(uint amount) internal onlyOwner {
        _totalSupply = _totalSupply.Sub(amount);
    }

    function () public payable{
        revert();
    }

}

/**
 * SafeMath
 * Math operations with safety checks that throw on error
 */
library SafeMath {

  function Mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function Div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function Sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function Add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract TenancyAgreement {
	struct Agreement {
		string  leaser; // 出租方
		string  tenant; // 承租方
		string  houseAddress; // 房屋地址
		string describe; // 房屋描述  
		bytes32 leaserSign; // 甲方签名 
		bytes32 tenantSign; // 乙方签名
		uint256  leaseTerm; //租赁期限
		uint256 rent; // 每月租金
		uint256 yearRent; // 年租金
		uint256 startTime; // 租赁开始
		uint256 endTime; // 结束租赁时间
		bool    isSign; // 是否已签约
	}
	mapping(bytes32 => Agreement) agrees;
	/**
	 * dev rent house agreement, landlord call this agreement.
	 * Parm {_leaser: who rents out the house, _tenant: who rent the house, _houseId: the hash of the house,
	 * _houseAddress: the house position, _describe: the house describe, _rental: monthly rent, _signHowLong: lease term}
	 */
	constructor(string _leaser, bytes32 _houseId, string _houseAddress, string _describe, bytes32 _signInfo,
			uint256 _rental, uint _signHowLong){	
		agrees[_houseId].leaser = _leaser;
		agrees[_houseId].houseAddress = _houseAddress;
		agrees[_houseId].describe = _describe;
		agrees[_houseId].leaserSign = _signInfo;
		agrees[_houseId].leaseTerm = _signHowLong;
		agrees[_houseId].rent = _rental;	
	}
	/* title: tenantSign
	*  dev: tenant call this method to sign the rent house agreement 
	*  Param: 
	*/
	function tenantSign(bytes32 _houseId, string _tenant, uint256 _rental, uint _signHowLong, 
			bytes32 _signInfo) public returns(bool) {
		uint256 startTime = now;
		uint256 end  = startTime + (_signHowLong * 30) * 1 days;
		agrees[_houseId].tenant = _tenant;
		agrees[_houseId].yearRent = 12 * _rental;
		agrees[_houseId].startTime = startTime;
		agrees[_houseId].endTime = end;
		agrees[_houseId].isSign  = true;
	}
	/* title: getAgreement
	*  dev: According to the house hash, query the agreement. 
	*  Param: 
	*/
	function getAgreement(bytes32 _houseId) public returns(string, string, string, string, bytes32, bytes32) {
		Agreement ag = agrees[_houseId];
		return (ag.leaser, ag.tenant, ag.houseAddress, ag.describe, ag.leaserSign, ag.tenantSign);
	}
	/* title: getRentTenancyInfo
	*  dev: Get Rent tenancy time inforamation 
	*  Param: 
	*/
	function getRentTenancyInfo(bytes32 _houseId) public returns(uint256, uint256, uint256, uint256) {
		Agreement ag = agrees[_houseId];
		return (ag.rent, ag.yearRent, ag.startTime, ag.endTime);
	}
}

contract RentBasic {
	enum HouseState {
		ReleaseRent,  // 发布租赁中
		WaitRent,   // 租客交付定金后，请求租赁中
		Renting,  // 租赁中
		EndRent,   // 完成租赁
		Cance,   // 取消租赁
		ReturnRent  // 退回租赁(当超出dealine时仍未租出)
	}

	HouseState defaultState = HouseState.ReleaseRent;
	// 房源基本信息
	struct HouseInfo {			
			uint8    landRate; // 房东信用等级 1、信用非常好，2、信用良好，3、信用一般，4、信用差
		    uint8    ratingIndex;  // 评级指数
		    uint8    huxing;  // 户型（1/2/3居）		    
			string   houseAddress; // 房屋地址			
			bytes32  houseId;   // 房屋hash
			string  descibe;	// 房屋描述
			string	 landlordInfo; //房东情况 			
			string  hopeYou;  // 期待你的描述			
			address  landlord; // 房东地址			
	}
	// 房源发布信息
	struct HouseReleaseInfo {
		HouseState    state;   // 当前的状态
		uint32        tenancy; // 租期
		uint256       rent; // 租金
		uint          releaseTime;  // 发布时间
		uint          updateTime; // 更新时间
		uint          dealineTime;  // 截止时间
		bool          existed; // 该hash对应的House是否存在
	}
	// 租客对某一房源评价
	struct RemarkHouse {
		address tenant; // 租客地址	
		uint8   ratingIndex; // 评级级别
		string remarkLandlord; // 对房东评价
		uint256 operateTime; // 评论时间
	}
	// 房东对某一租客评价
	struct RemarkTenant {
		address leaser; // 房东
		uint8   ratingIndex; // 评价级别
		string remarkTenant; // 对租客评价
		uint256 operateTime; // 评论时间
	}

	RentToken token;
	TenancyAgreement tenancyContract;
	HouseInfo hsInformation;
	HouseReleaseInfo hsReleaseInfo;
	mapping(bytes32 => HouseInfo) houseInfos;  // 房源基本信息映射
	mapping(bytes32 => HouseReleaseInfo) hsReleaseInfos; // 房源发布信息映射
	mapping(address => uint) addrMoney;  // 用户对应地址所交保证金
	mapping(bytes32 => RemarkHouse) remarks; // 租客对房子以房东的评价
	mapping(bytes32 => RemarkTenant) remarkTenants; // 房东对租客评价的集合
	mapping(bytes32 => mapping(address => uint)) bonds; // 租客对某一房子所交保证金
	// mapping(bytes32 => HouseRelation) releations; // 房屋hash映射租赁关系
	mapping(address => address) l2rMaps; // 房东与租客的映射
	mapping(address => uint256) creditManager; // 信用等级管理 

    bytes32 hosIds; // linshi临时变量
    uint256 bal; // 临时变量临时变量变量余额
	address public owner; // 合约发布者

	address public receiverPromiseMoney = 0x3c13520Bc27C8A38FD67533d02071e775da7b12F; // 接收房东交保证金地址
	address public distributeRemarkAddr = 0xA4ef5514CCfe79B821a3F36A123e528e096cEa28; // 发放奖励的地址
	address public saveTenanantAddr = 0xF87932Ee0e167f8B54209ca943af4Fad93B3B8A0; // 存放租客保证金的地址

	uint256 public promiseAmount = 500 * (10 ** 8); // 保证金
	uint256 public punishAmount = 10 * (10 ** 8); // 惩罚扣除
	uint256 public remarkAmount = 4 * (10 ** 8); // 奖励数量

	event ReleaseInfo(bytes32 houseHash, HouseState _defaultState, uint32 _tenancy, uint256 _rent, uint _releaseTime, uint _deadTime, bool existed);	
	event ReleaseHouseBasicInfo(bytes32 houseHash, uint8 rating,string _houseAddr,uint8 _huxing,string _describe, string _info, string _hopeYou,address indexed _landlord);		
	event SignContract(address indexed _sender, bytes32 _houseId, uint256 _signHowLong, uint256 _rental, bytes32 _signatrue, uint256 _time);
	event CommentHouse(address indexed _commenter, uint8 _rating, string _ramark);
	event RequestSign(address indexed _sender, bytes32 _houseId,uint256 _realRent, address indexed saveTenanantAddr);
	// event RenterRaiseCrowding(address indexed _receiver, uint256 _fundingGoal, uint256 _durationInMinutes, address indexed _tokenContractAddress);
	
	constructor(ERC20Interface _token) {
		owner = msg.sender;
		token = RentToken(_token);
	}

	modifier gtMinMoney(uint amount) {
		require(amount >= promiseAmount, "promise amount is not enough");
		_;
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
	/**
	 * title lease
	 * dev leaser rent out the house
	 * Parm {_leaser: the address of the leaser, _lockKey：the key of the door , _value: the cash deposit}
	 */
	function releaseHouse(string _houseAddr,uint8 _huxing,string _describe, string _info, uint32 _tenancy, uint256 _rent, string _hopeYou) public returns (bool) {
		uint256 nowTimes = now; 
		uint256 deadTime = nowTimes + 7 days;
		address houseOwer = msg.sender;
		// releaser should hold not less than 500 BLT
		bal = token.balanceOf(houseOwer);
		require(token.transferFrom(houseOwer, receiverPromiseMoney, promiseAmount), "Please promise enough money, which is not less than 500 BLT!");
		addrMoney[houseOwer] = promiseAmount;
		bytes32 houseIds = keccak256(abi.encodePacked(houseOwer, nowTimes, deadTime));
		hosIds = houseIds;
		hsInformation = HouseInfo({				
			landRate: 2,		 
			ratingIndex: 2,
			huxing: _huxing,			
			hopeYou: _hopeYou,
			houseAddress: _houseAddr,			
			houseId: houseIds, 
			descibe: _describe,
			landlordInfo: _info,
			landlord: houseOwer			
		});
		hsReleaseInfo = HouseReleaseInfo({
			state: defaultState,
			tenancy: _tenancy,
			rent: _rent,
			releaseTime: nowTimes,
			updateTime: nowTimes,
			dealineTime: deadTime,
			existed: true
		});
        // hsReleaseInfo = HouseReleaseInfo(defaultState, _tenancy,_rent,nowTimes,nowTimes,deadTime,true);
		houseInfos[houseIds] = hsInformation;
		hsReleaseInfos[houseIds] = hsReleaseInfo;
// 		releations[houseId].leaser = houseOwer;
		ReleaseHouseBasicInfo(houseIds, 2, _houseAddr, _huxing, _describe, _info, _hopeYou, houseOwer);
		ReleaseInfo(houseIds, defaultState, _tenancy,_rent,nowTimes,deadTime,true);
	}
	function getState() public returns(address, string, uint256) {
	    return (hsInformation.landlord,hsInformation.hopeYou, hsReleaseInfo.releaseTime);
	}
	/*
	* title deadReleaseHouse
	* dev check whether the house alread dealine
	* Param:  {_houseId: house hash} 
	*/
	function deadReleaseHouse(bytes32 _houseId) returns(bool) {
		HouseReleaseInfo hsRelInfo = hsReleaseInfos[_houseId];
		if (now > hsRelInfo.dealineTime && hsRelInfo.state == HouseState.Renting) {
			hsReleaseInfos[_houseId].state = HouseState.Cance;
			return true;
		}
		return false;
	}
	/**
	 * title requestSign
	 * dev tenant request sign the agreement.
	 * Parm {_leaser: the address of the leaser, _rental: month rental, signHowLong: how long of the agreement}
	 */
	function requestSign(bytes32 _houseId, uint256 _realRent) {
		HouseInfo hsInfo = houseInfos[_houseId];
		HouseReleaseInfo hsReInfo = hsReleaseInfos[_houseId];
		address sender = msg.sender;
		require(!hsReInfo.existed, "House is not existed");
		require(hsReInfo.state != defaultState, "House State is not in release");
		require(!token.transferFrom(sender, saveTenanantAddr, _realRent), "Tenat's BLT not enough !");
		hsReleaseInfos[_houseId].state = HouseState.WaitRent;
		bonds[_houseId][msg.sender] = _realRent;
		// releations[_houseId].tenant = msg.sender;
		l2rMaps[hsInfo.landlord] = sender;
		RequestSign(sender, _houseId, _realRent, saveTenanantAddr);
	}
	/**
	 * title signContract
	 * dev leaser sign the agreement.
	 * Parm {_leaser: the address of the leaser, _rental: month rental, signHowLong: how long of the agreement}
	 */
	function signAgreement(bytes32 _houseId,string _name, uint _signHowLong,uint _rental, uint256 _yearRent) public returns (bool) {
		HouseInfo hsInfo = houseInfos[_houseId];
		HouseReleaseInfo hsReInfo = hsReleaseInfos[_houseId];
		require(!hsReInfo.existed, "House is not existed");
		require(hsReInfo.state != HouseState.WaitRent, "House State is not in wait rent");
		uint256 nowTime = now;
		// pack message 
		bytes memory message = abi.encodePacked(sender, _houseId, _signHowLong, _rental, nowTime);
		// sign the message
		bytes32 signatrue = keccak256(message);
		address sender = msg.sender;
		if (sender != hsInfo.landlord) {
			require(bonds[_houseId][sender] > 0, "Require the tenant have enough bond");
			require(!token.transferFrom(sender, hsInfo.landlord, _rental), "Tenat's BLT not enough !");
			tenancyContract.tenantSign(_houseId, _name, _rental, _signHowLong, signatrue);
		} else {
			tenancyContract = new TenancyAgreement(_name, _houseId, hsInfo.houseAddress, hsInfo.descibe, signatrue,
		        _rental, _signHowLong);
			hsReleaseInfos[_houseId].state = HouseState.Renting;
		}
		// client start timer
		SignContract(sender, _houseId, _signHowLong, _rental, signatrue, nowTime);
		hsReleaseInfos[_houseId].updateTime = nowTime;
	}
	/**
	 * title signContract
	 * dev  _renter and _leaser sign how long agreement. It may be also including approve, send key
	 * Parm {_leaser: the address of the leaser, _renter：the address of the renter , signHowLong: how long of the agreement}
	 */
	 function withdrawPromise(bytes32 _houseId, uint amount) {
	 	HouseInfo hs = houseInfos[_houseId];
	 	HouseReleaseInfo reInfo = hsReleaseInfos[_houseId];
	 	require(!reInfo.existed, "Not find the house");
	 	require(msg.sender != hs.landlord, "It can be called only by landlord");
	 	require(reInfo.state != HouseState.EndRent || reInfo.state != HouseState.Cance, "House rent is not finished");
	 	require(addrMoney[msg.sender] > amount && amount > 0 , "Amount is not ");
	 	require(!token.transferFrom(receiverPromiseMoney, msg.sender, amount));
	 	addrMoney[msg.sender] = addrMoney[msg.sender] - amount; // decrease the landlord promise amount.
	 	// Return the bond to the tenant
	 	require(!token.transferFrom(saveTenanantAddr, l2rMaps[msg.sender], bonds[_houseId][l2rMaps[msg.sender]]), "Transfer fail");
	 	bonds[_houseId][l2rMaps[msg.sender]] = 0;  // clear the tenant bond
	 	uint256 nowTime = now;
	 	hsReleaseInfos[_houseId].updateTime = nowTime;
	 }
	/**
	 * title getHouseInfo
	 * dev get release rent house information
	 * Parm {_index: the house informaion position}
	 */
	function getHouseBasicInfo(bytes32 _houseId) public returns(bytes32, uint8, string, uint8, string, 
		string, string, address) {
		HouseInfo houseInfo = houseInfos[_houseId];
		return (_houseId, houseInfo.ratingIndex, houseInfo.houseAddress, houseInfo.huxing,houseInfo.descibe,
			  houseInfo.landlordInfo,houseInfo.hopeYou, houseInfo.landlord);		
	}
	/**
	 * title getHouseInfo
	 * dev get release rent house information
	 * Parm {_index: the house informaion position}
	 */
	function getHouseReleaseInfo(bytes32 _houseId) public returns(HouseState, uint32, uint256, uint, uint, bool) {
		HouseReleaseInfo releaseInfo = hsReleaseInfos[_houseId];
		require(!releaseInfo.existed, "Require the house is existed");
		return (releaseInfo.state, releaseInfo.tenancy, releaseInfo.rent, releaseInfo.releaseTime, releaseInfo.dealineTime, releaseInfo.existed);		
	}		
	
	/**
	 * title breakContract
	 * dev  who break the contract and how to record it. And it will run by the contract or anyone call it
	 * Parm 
	 * TODO punishAmount
	 */
	function breakContract(bytes32 _houseId, string _reason) public returns (uint256 money) {
		HouseInfo hs = houseInfos[_houseId];
		HouseReleaseInfo relInfo = hsReleaseInfos[_houseId];
		require(!relInfo.existed, "Require the house is existed");		
		if (hs.landlord == msg.sender && relInfo.state != HouseState.ReleaseRent) {
			addrMoney[msg.sender] = addrMoney[msg.sender] - punishAmount;
		}
		// Update releaseHouse information
		hsReleaseInfos[_houseId].state = HouseState.Cance;
		hsReleaseInfos[_houseId].updateTime = now;	
	}
	/**
	 * title commentHouse
	 * dev leaser and tenant comment echo other
	 * Parm {_houseId: the house hash, _ratingIndex: remarkable record (1-10) , _ramark: remark about the house or the tenant}
	 */
	function commentHouse(bytes32 _houseId, uint8 _ratingIndex, string _ramark) returns(bool) {
		address sender = msg.sender;
		HouseReleaseInfo reInfo = hsReleaseInfos[_houseId];
		require(!reInfo.existed, "Not find the house");
	 	require(reInfo.state != HouseState.EndRent, "House rent is not finished");
		if (houseInfos[_houseId].landlord == sender) {
			remarks[_houseId] = RemarkHouse(sender, _ratingIndex, _ramark, now);
			creditManager[l2rMaps[sender]] += _ratingIndex; 
		} else {
			address landlord = houseInfos[_houseId].landlord;
			creditManager[landlord] += _ratingIndex;
			remarkTenants[_houseId] = RemarkTenant(sender, _ratingIndex, _ramark, now);
		}
		require(!token.transferFrom(distributeRemarkAddr,sender, remarkAmount), "Reward distribute fail !");
		CommentHouse(sender, _ratingIndex, _ramark);
		return true;
	}
	/**
	 * title getCreditRecord
	 * dev Get the person of the address credit record
	 * Parm {_viewer: the address of who viewed}
	 */
	function getCreditRecord(address _viewer) returns(uint) {
		return creditManager[_viewer];
	}
	/**
	 * title sendKey
	 * dev _leaser send the key to _renter
	 * Parm {_leaser: the address of the leaser, _renter：the address of the renter , _lockKey: the key of the door}
	 */
	function sendKey(address _leaser, address _renter, address _lockKey) public returns (bool) {

	}
	/**
	 * title raisePromiseMoney
	 * dev _renter and _leaser should raise a amount of the token as a promise
	 * Parm {_addr: the address of the raise promise money, _lock_key：the key of the door , _value: the cash deposit}
	 */
	function raisePromiseMoney(uint _amount) public gtMinMoney(_amount) {
		address addr = msg.sender;
		// transfer(msg.sender, _amount);
	}
	/**
	 * title setPromiseMoney
	 * dev _leaser send the key to _renter
	 * Parm {_leaser: the address of the leaser, _renter：the address of the renter , _lockKey: the key of the door}
	 */
	function setPromiseMoney(uint256 _promiseAmount) public onlyOwner {
		promiseAmount = _promiseAmount;
	}

	function getPromiseMoney() public returns(uint256) {
		return promiseAmount;
	}

}
