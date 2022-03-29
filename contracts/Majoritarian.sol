//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/iBPool.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";

contract Majoritarian is Ownable, GnosisSafe {
    constructor() {}
}
