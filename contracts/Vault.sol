// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@layerzerolabs/solidity-examples/contracts/lzApp/LzApp.sol';

contract Vault is LzApp, ERC20 {

    event Mint(address to, uint256 amount);

    // allow this contract to receive ether
    receive() external payable {}

    constructor(address _endpoint) ERC20("LOCKED TEST TOKEN", "LTT") LzApp(_endpoint) {}

    /// @notice mint token Based on the payload that the asset is deposited in the remote chain
    function _blockingLzReceive(
        uint16, // srcChainId
        bytes memory, // srcAddress
        uint64, // nonce
        bytes memory _payload
    ) internal override {
        (address to, uint256 amount) = abi.decode(_payload, (address, uint256));
        _mint(to, amount);
        emit Mint(to, amount);
    }
}
