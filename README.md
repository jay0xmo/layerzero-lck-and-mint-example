# Layerzero Lock & Mint Example

This project demonstrates a basic Layerzero use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

## INSTALLATION

1. [install foundry](https://book.getfoundry.sh/getting-started/installation)
2. [install yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
3. `yarn install`

## USAGE

Before run the scripts, you create `.env` file first and set `PRIVATE_KEY`
````shell
PRIVATE_KEY='*******'
````

And you need some tokens to execute in test net
* [avalanche faucet](https://faucet.avax.network/) 
* [arbitrum faucet](https://faucet.quicknode.com/arbitrum/rinkeby) 

1. deploy test contracts

```shell
yarn hardhat run ./scripts/deploy.ts

balance in AVAX(TESTNET) : 3.815
balance in Arbitrum(TESTNET): 0.189
1) deploy vault on arbitrum
VAULT ADDRESS : 0x45A60d56dba3f356d15E69e3a33eb315B99329B6

2) deploy mock token to avalanche
TOKEN ADDRESS : 0xAb1Fb7d540d76505F6c22c6F3a60FDdce8C93DAf

3) deploy hub
HUB ADDRESS : 0xa94b108478d93644DB5Acd862B65daE943e018Ea

4) set trusted remote in vault
TX HASH : 0x773873de2c984b7cac22a0c9abad23afdaa86e78e93c8d3bb9b2d5b9756bcc42
```

2. send Deposit TX

before you run this script, you should set the contracts
````shell
yarn hardhat run ./scripts/deposit.ts

balance in AVAX(TESTNET) : 3.70
balance in Arbitrum(TESTNET): 0.187
faucet first! tx hash : 0x03b3b6f0cadb3a9e40e23a7a5188e64eb3a2075487a496f4d3c23103a40e2729

approve first! tx hash : 0x18309c88ec71135270181c2b0dc5ef37fadd41c906f71f84d8f76a3dc975f729

gasFee for deposit : 0.178479397716115523
DEPOSIT TX! tx hash : 0xbdcdd5796cdbb55e4b80825c83ad3f9b465a4851d453718af1581f96a7819303

WAIT TO RECEIVE DEPOSIT EVENT FROM VAULT
0x960d4dF56d76CC4C88b655871f64D474A2712d55 ADDRESS MINTED 1.2
````
