pragma solidity ^0.4.24;

interface token {
    function transfer(address receiver, uint amount) external;
}

contract YingRentSale {
    using SafeMath for uint256;
    address public beneficiary;  // 募资成功后的收款方
    uint public fundingGoal;   // 募资额度
    uint public amountRaised;   // 参与数量
    uint public deadline;      // 募资截止期

    uint public price;    //  token 与以太坊的汇率 , token卖多少钱
    token public tokenReward;   // 要卖的token
    mapping(address => uint256) public balanceOf;

    bool fundingGoalReached = false;  // 众筹是否达到目标
    bool crowdsaleClosed = false;   //  众筹是否结束

    /**
    * 事件可以用来跟踪信息
    **/
    event GoalReached(address recipient, uint totalAmountRaised);
    event FundTransfer(address backer, uint amount, bool isContribution);

    /**
     *  构造函数, 设置相关属性
     *  ifSuccessfulSendTo： 募资成功后的收款方（其实这里可以默认为合约创建者）
     *  fundingGoalInEthers： 募资额度， 为了方便我们仅募3个ether
     *  durationInMinutes： 募资时间
     *  finneyCostOfEachToken 每个代币的价格, 这里为了方便使用了单位finney及值为：1 （1 ether = 1000 finney）
     *  tokenContractAddress： 代币合约地址
     */
    function YingRentSale(
        address ifSuccessfulSendTo,
        uint fundingGoalInEthers,
        uint durationInMinutes,
        uint finneyCostOfEachToken,
        address tokenContractAddress) {
            beneficiary = ifSuccessfulSendTo;
            fundingGoal = fundingGoalInEthers * 1 ether;
            deadline = now + durationInMinutes * 1 minutes;
            price = finneyCostOfEachToken * 1 finney;
            tokenReward = token(tokenContractAddress);   // 传入已发布的 token 合约的地址来创建实例
    }
    /**
     * 无函数名的Fallback函数，
     * 在向合约转账时，这个函数会被调用
     */
    function () payable external {
        require(!crowdsaleClosed);
        uint amount = msg.value;
        balanceOf[msg.sender] = balanceOf[msg.sender].Add(amount);
        amountRaised = amountRaised.Add(amount);
        tokenReward.transfer(msg.sender, amount.Div(price).Mul(10**8)); // Token decimal is 8
        FundTransfer(msg.sender, amount, true);
    }

    /**
    *  定义函数修改器modifier（作用和Python的装饰器很相似）
    * 用于在函数执行前检查某种前置条件（判断通过之后才会继续执行该方法）
    * _ 表示继续执行之后的代码
    **/
    modifier afterDeadline() { 
        if (now >= deadline) _; 
    }
    /**
     * 判断众筹是否完成融资目标， 这个方法使用了afterDeadline函数修改器
     *
     */
    function checkGoalReached() afterDeadline {
        if (amountRaised >= fundingGoal) {
            fundingGoalReached = true;
            GoalReached(beneficiary, amountRaised);
        }
        crowdsaleClosed = true;
    }


    /**
     * 完成融资目标时，融资款发送到收款方
     * 未完成融资目标时，执行退款
     *
     */
    function safeWithdrawal() afterDeadline {
        if (!fundingGoalReached) {
            uint amount = balanceOf[msg.sender];
            balanceOf[msg.sender] = 0;
            if (amount > 0) {
                if (msg.sender.send(amount)) {
                    FundTransfer(msg.sender, amount, false);
                } else {
                    balanceOf[msg.sender] = amount;
                }
            }
        }

        if (fundingGoalReached && beneficiary == msg.sender) {
            if (beneficiary.send(amountRaised)) {
                FundTransfer(beneficiary, amountRaised, false);
            } else {
                //If we fail to send the funds to beneficiary, unlock funders balance
                fundingGoalReached = false;
            }
        }
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