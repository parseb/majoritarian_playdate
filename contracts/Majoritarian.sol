//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/iBPool.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/// known unknowns : ERC20 fungibility. loan attack

contract Majoritarian is Ownable, GnosisSafe {
    iBPool public balancerPool;
    address[2] poolTokens;
    /// msg.sender => Who (y) => nr. of stones to acknowledge for add/remove 'Em
    mapping(address => mapping(address => uint256)) pressForce;

    /// address of Who (Y) => [sum of total stones to add/remove Y]
    mapping(address => uint256) whoTotal;

    /// address of sender => address of Who (Y) => status of Y when sender last voted
    mapping(address => mapping(address => bool)) lastPressedY;

    constructor(
        address _bpAddress,
        address _token1,
        address _token2
    ) {
        require(
            _bpAddress != address(0) &&
                _token1 != address(0) &&
                _token2 != address(0)
        );
        balancerPool = iBPool(_bpAddress);
        poolTokens = [_token1, _token2];
    }

    function initBPool() public onlyOwner {
        require(
            IERC20(poolTokens[0]).approve(
                address(balancerPool),
                type(uint256).max - 1
            ) &&
                IERC20(poolTokens[1]).approve(
                    address(balancerPool),
                    type(uint256).max - 1
                )
        );

        balancerPool.bind(poolTokens[0], 1000000, 50 * (10 * 18));
        balancerPool.bind(poolTokens[1], 1000000, 50 * (10 * 18));
        balancerPool.finalize();
        require(balancerPool.isFinalized(), "Initialization Failed");
    }

    event WasFlipped(address indexed who, uint256 pressureAmt);

    function vote(address payable _who) external returns (bool s) {
        require(_who != address(0));
        bool whoState = isOwner(_who);
        entersToVote(_who, whoState);

        if (whoState) require(incrementDrop(_who));
        if (!whoState) require(incrementAdd(_who));

        if (whoState != isOwner(_who)) {
            lastPressedY[msg.sender][_who] = isOwner(_who);
            emit WasFlipped(_who, whoTotal[_who]);
            whoTotal[_who] = 0;
        }
        s = true;
    }

    function incrementDrop(address _w) private returns (bool) {
        // function removeOwner( address prevOwner, address owner, uint256 _threshold)

        pressForce[msg.sender][_w] = balancerPool.balanceOf(msg.sender);
        return true;
    }

    function incrementAdd(address _w) private returns (bool) {
        // addOwnerWithThreshold(address owner, uint256 _threshold)

        pressForce[msg.sender][_w] = balancerPool.balanceOf(msg.sender);
        return true;
    }

    function entersToVote(address _who, bool isIn) private {
        uint256 currentBalance = balancerPool.balanceOf(msg.sender);

        if (pressForce[msg.sender][_who] > 0) {
            if (pressForce[msg.sender][_who] > currentBalance) {
                whoTotal[_who] -= (pressForce[msg.sender][_who] -
                    currentBalance);
            } else {
                whoTotal[_who] += (currentBalance -
                    pressForce[msg.sender][_who]);
            }

            pressForce[msg.sender][_who] = (lastPressedY[msg.sender][_who] !=
                isIn)
                ? 0
                : currentBalance;
        }
    }

    function isMajority(address _who) internal view returns (bool x) {
        x = balancerPool.totalSupply() / 2 < whoTotal[_who];
    }

    // function addOwnerWithThreshold(address owner, uint256 _threshold)
    //     public
    //     override
    //     authorized
    // {
    //     // Owner address cannot be null, the sentinel or the Safe itself.
    //     require(
    //         owner != address(0) &&
    //             owner != SENTINEL_OWNERS &&
    //             owner != address(this),
    //         "GS203"
    //     );
    //     // No duplicate owners allowed.
    //     require(owners[owner] == address(0), "GS204");
    //     owners[owner] = owners[SENTINEL_OWNERS];
    //     owners[SENTINEL_OWNERS] = owner;
    //     ownerCount++;
    //     emit AddedOwner(owner);
    //     // Change threshold if threshold was changed.
    //     if (threshold != _threshold) changeThreshold(_threshold);
    // }
}
