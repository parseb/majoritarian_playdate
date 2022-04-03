//SPDX-License-Identifier: UNLICENSED
/// @security contact: @parseb
pragma solidity 0.8.6;

import "./interfaces/iBPool.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Majoritarian is GnosisSafe {
    iBPool public balancerPool;
    address[2] poolTokens;
    bool isInitialized;

    struct Proposal {
        uint256 lastChangedAt;
        uint256 currentForce;
        // bytes32 fxProposed;
        // bytes32[] fxArguments;
    }

    /// @dev address of sender [subjective] OR 0 [objective], address of _who [subject] = > Proposal
    mapping(address => mapping(address => Proposal)) proposalState;

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

    event wasVoted(address indexed who, address indexed byWhom, uint256 force);
    event WasFlipped(address indexed who, uint256 pressureAmt);

    /**
     * @dev    Initializes balancer pool.
     */
    function initBPool() public returns (bool s) {
        require(!isInitialized);
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

        balancerPool.bind(poolTokens[0], (10**20), 25 * (10**18) - 1);
        balancerPool.bind(poolTokens[1], (10**20), 25 * (10**18) - 1);
        balancerPool.finalize();
        s = balancerPool.isFinalized();
        if (s) isInitialized = true;
        require(s, "Initialization Failed");
    }

    /**
     * @dev                 voting functionality. Flips owner status on simple majority.
     * @notice              used to vote for the change of _who's current safe status
     * @param _who          address: who is being voted for add/remove
     */
    function vote(address payable _who) public returns (bool s) {
        require(_who != address(0));
        require(
            proposalState[msg.sender][_who].lastChangedAt <=
                proposalState[address(0)][_who].lastChangedAt,
            "Voted. Cannot Actualize"
        );
        proposalState[msg.sender][_who].lastChangedAt = block.timestamp;
        bool whoState = isOwner(_who);
        s = addOrDrop(_who, whoState);
    }

    function addOrDrop(address _who, bool _isOwner) private returns (bool) {
        uint256 sentForce = balancerPool.balanceOf(msg.sender);
        proposalState[address(0)][_who].currentForce += sentForce;
        proposalState[msg.sender][_who].currentForce = sentForce;
        proposalState[msg.sender][_who].lastChangedAt = block.timestamp;

        emit wasVoted(_who, msg.sender, sentForce);

        if (isMajority(_who)) {
            if (!_isOwner) {
                owners[address(this)] = _who;
                owners[_who] = owners[address(this)];
                ++ownerCount;
            } else {
                owners[address(this)] = owners[_who];
                owners[_who] = address(0);
                ownerCount--;
            }
            proposalState[address(0)][_who].lastChangedAt = block.timestamp;
            proposalState[address(0)][_who].currentForce = 0;
            emit WasFlipped(_who, proposalState[address(0)][_who].currentForce);
        }
        return true;
    }

    function isMajority(address _who) public view returns (bool x) {
        x =
            (balancerPool.totalSupply() -
                balancerPool.balanceOf(address(this))) /
                2 <
            proposalState[address(0)][_who].currentForce;
    }

    function getVotesOf(address _who) public view returns (uint256) {
        return (proposalState[address(0)][_who].currentForce);
    }
}
