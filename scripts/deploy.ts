import { ethers } from "hardhat";
import {config} from 'dotenv';
import {Wallet} from "ethers";
import {Hub, Hub__factory, TestToken, TestToken__factory, Vault, Vault__factory} from "../typechain-types";
config();

// reference
// https://layerzero.gitbook.io/docs/technical-reference/testnet/testnet-addresses
const AVAX_CHAINID = 10106;
const ARBI_CHAINID = 10143;

const AVAX_ENDPOINT = '0x93f54D755A063cE7bB9e6Ac47Eccc8e33411d706';
const ARBI_ENDPOINT ='0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab';

async function main() {
  const privateKey = process.env!.PRIVATE_KEY;
  const avaxProvider = (
      new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc')
  )
  const arbiProvider = (
      new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')
  )

  const avaxWallet = new Wallet(privateKey, avaxProvider);
  const arbiWallet = new Wallet(privateKey, arbiProvider);

  console.log(`balance in AVAX(TESTNET) : ${ethers.utils.formatEther(await avaxWallet.getBalance())}`)
  console.log(`balance in Arbitrum(TESTNET): ${ethers.utils.formatEther(await arbiWallet.getBalance())}`)

  console.log(`1) deploy vault on arbitrum`);
  const Vault = await ethers.getContractFactory("Vault", arbiWallet) as Vault__factory;
  const vault = await Vault.deploy(ARBI_ENDPOINT) as Vault;
  await vault.deployed();
  console.log(`VAULT ADDRESS : ${vault.address}\n`)

  console.log(`2) deploy mock token to avalanche`)
  const TestToken = await ethers.getContractFactory("TestToken", avaxWallet) as TestToken__factory;
  const testToken = await TestToken.deploy() as TestToken;
  await testToken.deployed();
  console.log(`TOKEN ADDRESS : ${testToken.address}\n`)

  console.log(`3) deploy hub`)
  const Hub = await ethers.getContractFactory('Hub', avaxWallet) as Hub__factory;
  const hub = await Hub.deploy(testToken.address, AVAX_ENDPOINT, ARBI_CHAINID, vault.address) as Hub;
  await hub.deployed();
  console.log(`HUB ADDRESS : ${hub.address}\n`)

  console.log(`4) set trusted remote in vault`)
  const tx = await vault.setTrustedRemoteAddress(
      AVAX_CHAINID,
      ethers.utils.solidityPack(['address'], [hub.address]),
      {gasLimit:800_000}
  )
  await tx.wait(2)
  console.log(`TX HASH : ${tx.hash}\n`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
