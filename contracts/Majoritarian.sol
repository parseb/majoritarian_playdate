//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/iBPool.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";

/// known unknowns : ERC20 fungibility. loan attack

contract Majoritarian is Ownable, GnosisSafe {
    iBPool public balancerPool;

    /// msg.sender => Who (y) => nr. of stones to acknowledge for add/remove 'Em
    mapping(address => mapping(address => uint256)) pressForce;

    /// address of Who (Y) => [sum of total stones to add/remove Y]
    mapping(address => uint256) whoTotal;

    /// address of sender => address of Who (Y) => status of Y when sender last voted
    mapping(address => mapping(address => bool)) lastPressedY;

    constructor(address BPool) {
        balancerPool = iBPool(BPool);
    }

    function vote(address payable _who) external returns (bool s) {
        entersToVote(_who);
        bool whoState = isOwner(_who);
        if (whoState) require(incrementDrop(_who));
        if (!whoState) require(incrementAdd(_who));

        if (whoState != isOwner(_who)) {
            lastPressedY[msg.sender][_who] = isOwner(_who);
            whoTotal[_who] = 0;
        }
        s = true;
    }

    function incrementDrop(address _w) private returns (bool) {
        // function removeOwner( address prevOwner, address owner, uint256 _threshold)
        return true;
    }

    function incrementAdd(address _w) private returns (bool) {
        // addOwnerWithThreshold(address owner, uint256 _threshold)
        return true;
    }

    function entersToVote(address _who) private {
        pressForce[msg.sender][_who] = (pressForce[msg.sender][_who] > 0 &&
            lastPressedY[msg.sender][_who] != isOwner(_who))
            ? 0
            : balancerPool.balanceOf(msg.sender);
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
