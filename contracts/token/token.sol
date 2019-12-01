pragma solidity ^0.4.24;
//  RentHouse Foundation.

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
            balances[_from] = balances[_from].Sub(_amount);
            balances[_to] = balances[_to].Add(_amount);
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



