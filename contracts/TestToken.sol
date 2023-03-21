// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestToken is ERC20 {

    constructor() ERC20("TEST TOKEN", "TT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

}
