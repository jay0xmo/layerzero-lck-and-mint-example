import { ethers } from "hardhat";
import {config} from 'dotenv';
import {Wallet} from "ethers";
import {Hub, TestToken, Vault} from "../typechain-types";
import fs from "fs";
import path from "path";
config();

let ADDRESS_BOOK;
try {
  ADDRESS_BOOK = JSON.parse(fs.readFileSync(path.resolve(__dirname, "addresses.json")).toString())
} catch {
  throw Error("deploy first!")
}
const VAULT_ADDRESS = ADDRESS_BOOK['VAULT'];
const TOKEN_ADDRESS = ADDRESS_BOOK['TOKEN'];
const HUB_ADDRESS = ADDRESS_BOOK['BOOK'];

const amount = ethers.utils.parseEther('1.2');

async function main() {
  const privateKey = process.env!.PRIVATE_KEY;
  const avaxProvider = (
      new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/avalanche_fuji')
  )
  const arbiProvider = (
      new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')
  )

  const avaxWallet = new Wallet(privateKey, avaxProvider);
  const arbiWallet = new Wallet(privateKey, arbiProvider);

  console.log(`balance in AVAX(TESTNET) : ${ethers.utils.formatEther(await avaxWallet.getBalance())}`)
  console.log(`balance in Arbitrum(TESTNET): ${ethers.utils.formatEther(await arbiWallet.getBalance())}`)

  const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS, arbiWallet) as Vault;
  const testToken = await ethers.getContractAt('TestToken', TOKEN_ADDRESS, avaxWallet) as TestToken;
  const hub = await ethers.getContractAt('Hub', HUB_ADDRESS, avaxWallet) as Hub;

  // 1. faucet some token
  if ((await testToken.balanceOf(avaxWallet.address)).lt(amount)) {
    const tx = await testToken.mint(avaxWallet.address, amount,{gasLimit:300_000});
    await tx.wait(2)
    console.log(`faucet first! tx hash : ${tx.hash}\n`)
  }

  if ((await testToken.allowance(avaxWallet.address, hub.address)).lt(amount)) {
    const tx = await testToken.approve(hub.address, ethers.constants.MaxUint256,{gasLimit:300_000});
    await tx.wait(2)
    console.log(`approve first! tx hash : ${tx.hash}\n`)
  }

  const gasFee = await hub.estimateDepositGasFee(arbiWallet.address, amount);
  console.log(`gasFee for deposit : ${ethers.utils.formatEther(gasFee)}`)

  const tx = await hub.deposit(arbiWallet.address, amount, {value:gasFee, gasLimit:300_000})
  await tx.wait(2)
  console.log(`DEPOSIT TX! tx hash : ${tx.hash}\n`);

  console.log('WAIT TO RECEIVE DEPOSIT EVENT FROM VAULT');
  await vault.on('Mint', async (to, amount) => {
    console.log(`${to} ADDRESS MINTED ${ethers.utils.formatEther(amount)}`)
    process.exit();
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
