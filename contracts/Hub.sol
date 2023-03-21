// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@layerzerolabs/solidity-examples/contracts/lzApp/LzApp.sol';

contract Hub is LzApp {

    IERC20 public token;
    uint16 public vaultChainId;
    address public vaultAddress;

    // allow this contract to receive ether
    receive() external payable {}

    event Deposit(address to, uint256 amount);

    constructor(
        address _token,
        address _endpoint,
        uint16 _vaultChainId,
        address _vaultAddress
    ) LzApp(_endpoint) {
        token = IERC20(_token);

        vaultChainId = _vaultChainId;
        vaultAddress = _vaultAddress;

        _setTrustedRemote(vaultChainId, vaultAddress);
    }

    function _setTrustedRemote(uint16 _remoteChainId, address _remoteAddress) internal {
        trustedRemoteLookup[_remoteChainId] = abi.encodePacked(_remoteAddress, address(this));
        emit SetTrustedRemoteAddress(_remoteChainId, abi.encodePacked(_remoteAddress));
    }

    /// @notice If you deposit tokens in Hub, you will receive locked tokens in Vault
    /// @param to address to receive locked token
    /// @param amount amount to deposit
    /// @dev msg.value should be greater than `estimateDepositGasFee(to, amount)`
    function deposit(address to, uint256 amount) external payable {
        token.transferFrom(msg.sender, address(this), amount);

        // send message
        _lzSend(
            vaultChainId,
            abi.encode(to, amount),
            payable(msg.sender),
            address(0),
            abi.encodePacked(uint16(1), uint256(200_000)),
            uint256(msg.value)
        );

        emit Deposit(to, amount);
    }

    /// @notice pay for the gas fee to be called in Remote Chain
    function estimateDepositGasFee(address to, uint256 amount) external view returns (uint256 fee) {
        (fee, ) = lzEndpoint.estimateFees(
            vaultChainId,
            address(this),
            abi.encode(to, amount),
            false,
            abi.encodePacked(uint16(1), uint256(200_000))
        );
    }

    function _blockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal override {
        // ignore
    }
}
