// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import 'forge-std/Test.sol';
import 'forge-std/console.sol';
import 'contracts/Hub.sol';
import 'contracts/TestToken.sol';
import 'contracts/Vault.sol';

/// MOCK
import '@layerzerolabs/solidity-examples/contracts/mocks/LZEndpointMock.sol';

contract DepositRemoteTest is Test {

    address private deployer = vm.addr(1);
    address private user = vm.addr(2);

    uint16 hostChainId = 1;
    uint16 remoteChainId = 2;

    LZEndpointMock private hostEndpoint;
    LZEndpointMock private remoteEndpoint;

    TestToken private token;
    Hub private hub;
    Vault private vault;

    function setUp() external {
        // prepare LZEndPoint
        hostEndpoint = new LZEndpointMock(hostChainId);
        remoteEndpoint = new LZEndpointMock(remoteChainId);

        vm.startPrank(deployer);
        // create vault
        vault = new Vault(address(hostEndpoint));

        // create token & hub
        token = new TestToken();
        token.mint(user, 10 ether);
        hub = new Hub(
            address(token),
            address(remoteEndpoint),
            hostChainId,
            address(vault)
        );

        // set up trusted remote address
        vault.setTrustedRemoteAddress(remoteChainId, abi.encodePacked(address(hub)));
        vm.stopPrank();

        // for mocking behavior
        hostEndpoint.setDestLzEndpoint(address(hub), address(remoteEndpoint));
        remoteEndpoint.setDestLzEndpoint(address(vault), address(hostEndpoint));

        // deal gas
        vm.deal(user, 100 ether);
    }

    function testDepositToHubAndMintTokenFromHub() external {
        vm.startPrank(user);
        // GIVEN
        uint256 amount = 1 ether;
        token.approve(address(hub), type(uint256).max);

        // WHEN
        uint256 gas = hub.estimateDepositGasFee(user, amount);
        hub.deposit{value:gas}(user, amount);

        // THEN
        assertEq(vault.balanceOf(user), amount);
        vm.stopPrank();
    }
}
