pragma solidity ^0.4.18;

// ----------------------------------------------------------------------------------------------
//Bit Capital Vendor by BitCV Foundation.
// An ERC20 standard
//
// author: BitCV Foundation Team

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

contract BIV is ERC20Interface {
    uint256 public constant decimals = 8;

    string public constant symbol = "BiV";
    string public constant name = "Bt";

    uint256 public _totalSupply = 120000000000000000; // total supply is 1.2 billion

    // Owner of this contract
    address public owner;

    // Balances BIV for each account
    mapping(address => uint256) private balances;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) private allowed;

    // List of approved investors
    mapping(address => bool) private approvedInvestorList;

    // deposit
    mapping(address => uint256) private deposit;


    // totalTokenSold
    uint256 public totalTokenSold = 0;


    /**
     * @dev Fix for the ERC20 short address attack.
     */
    modifier onlyPayloadSize(uint size) {
      if(msg.data.length < size + 4) {
        revert();
      }
      _;
    }



    /// @dev Constructor
    function BIV()
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
        if ( (balances[msg.sender] >= _amount) &&
             (_amount >= 0) &&
             (balances[_to] + _amount > balances[_to]) ) {

            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(msg.sender, _to, _amount);
            return true;
        } else {
            return false;
        }
    }

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
    public

    returns (bool success) {
        if (balances[_from] >= _amount && _amount > 0 && allowed[_from][msg.sender] >= _amount) {
            balances[_from] -= _amount;
            allowed[_from][msg.sender] -= _amount;
            balances[_to] += _amount;
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

    function () public payable{
        revert();
    }

}

/**
 * SafeMath
 * Math operations with safety checks that throw on error
 */
library SafeMath {

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

/**
 * The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  function Ownable() public {
    owner = msg.sender;
  }

  /**
   * Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

contract BivTokenVault is Ownable {
    using SafeMath for uint256;

    BIV public token;

    function BivTokenVault(ERC20Interface _token) public {
        owner = msg.sender;
        token = BIV(_token);
    }

    // Claim tokens for life reserve wallet
    function claimTokenReserveLife() public {

        address reserveWallet = msg.sender;

        // Can't claim before Lock ends
        // require(block.timestamp > timeLocks[reserveWallet]);

        // The vesting stage of life wallet
        uint256 vestingStage = 1;

        // Amount of tokens the life wallet should have at this vesting stage
        uint256 totalUnlocked = vestingStage.mul(2 * (10 ** 8) * (10 ** 8));

        // Transfer to life wallet address
        require(token.transfer(reserveWallet, totalUnlocked));
    }

}
