// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Mock1 is ERC20, Ownable {
    constructor() ERC20("Mock1", "MTK1") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
