//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/iBPool.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Majoritarian is Ownable, GnosisSafe {
    iBPool public balancerPool;
    address[2] poolTokens;

    struct Proposal {
        uint256 lastChangedAt;
        uint256 currentForce;
    }

    /// @dev address of sender [relational] or 0 [default], address of who = > Proposal
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

    event WasFlipped(address indexed who, uint256 pressureAmt);

    /**
     * @dev    Initializes balancer pool.
     */
    function initBPool() public onlyOwner returns (bool s) {
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

        balancerPool.bind(poolTokens[0], (10 ** 20), 25 * (10**18) - 1);
        balancerPool.bind(poolTokens[1], (10 ** 20), 25 * (10**18) - 1);
        balancerPool.finalize();
        s = balancerPool.isFinalized();
        require(s, "Initialization Failed");
    }
    /**
     * @dev                 boting functionality. Flips owner status on simple majority.
     * @notice              used to vote for the change of _who's current safe status
     * @param _who          addres who is being voted for add/remove
     */
    function vote(address payable _who) external returns (bool s) {
        require(_who != address(0));

        require(proposalState[msg.sender][_who].lastChangedAt <= proposalState[address(0)][_who].lastChangedAt);

        proposalState[msg.sender][_who].lastChangedAt = block.timestamp; 
        bool whoState = isOwner(_who);

        s = addOrDrop(_who, whoState);

        if (whoState != isOwner(_who)) {
            proposalState[address(0)][_who].lastChangedAt = block.timestamp;
            proposalState[address(0)][_who].currentForce = 0; 
        }
    }
        function addOrDrop(address _w, bool _isOwner) private returns (bool) {

            uint256 sentForce = balancerPool.balanceOf(msg.sender);
            proposalState[address(0)][_w].currentForce += sentForce;
            proposalState[msg.sender][_w].currentForce = sentForce;
            proposalState[msg.sender][_w].lastChangedAt = block.timestamp;

            if (isMajority(_w)) {
                if (! _isOwner) addOwnerWithThreshold(_w, (ownerCount / 2 + 1));
                if (_isOwner) removeOwner(address(this), _w, (ownerCount - 1) / 2 + 1);

                emit WasFlipped(_w, proposalState[address(0)][_w].currentForce);
            }
        return true;
    }
    function isMajority(address _who) internal view returns (bool x) {
        x = (balancerPool.totalSupply() - balancerPool.balanceOf(address(this))) / 2 < proposalState[address(0)][_who].currentForce;
    }
}
