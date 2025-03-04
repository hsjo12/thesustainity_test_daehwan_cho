import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  setUp,
  SetupFixture,
  CARBON_CREDIT_721_NAME,
  CARBON_CREDIT_721_SYMBOL,
} from "../utils/setUp";
import {
  CarbonCredit20,
  CarbonCredit721,
  CarbonCredit20Vault,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
describe("CarbonCredit721 test", () => {
  let deployer: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;
  let carbonCredit20: CarbonCredit20,
    carbonCredit721: CarbonCredit721,
    carbonCredit20Vault: CarbonCredit20Vault;

  beforeEach(async () => {
    ({
      deployer,
      user1,
      user2,
      carbonCredit20,
      carbonCredit721,
      carbonCredit20Vault,
    } = await loadFixture<SetupFixture>(setUp));
  });

  it("Check if name and symbol are equal to the input name and symbol", async () => {
    const name = await carbonCredit721.name();
    const symbol = await carbonCredit721.symbol();

    expect(name).to.eq(CARBON_CREDIT_721_NAME);
    expect(symbol).to.eq(CARBON_CREDIT_721_SYMBOL);
  });

  it("Check if setup functions work", async () => {
    const zeroAddress = ethers.ZeroAddress;
    const imageURIValue = "IMAGEURI";
    await carbonCredit721.setCarbonCredit20(zeroAddress);
    await carbonCredit721.setCarbonCredit20Vault(zeroAddress);
    await carbonCredit721.setImageURI(imageURIValue);

    const carbonCredit20 = await carbonCredit721.carbonCredit20();
    const carbonCredit20Vault = await carbonCredit721.carbonCredit20Vault();
    const imageURI = await carbonCredit721.imageURI();
    expect(carbonCredit20).to.eq(zeroAddress);
    expect(carbonCredit20Vault).to.eq(zeroAddress);
    expect(imageURI).to.eq(imageURIValue);
  });

  it("Check if user1 can mint CarbonCredit721 by depositing carbonCredit20", async () => {
    const amount = ethers.parseEther("10");

    // Transfer 10 tokens to user1
    await carbonCredit20.transfer(user1.address, amount);

    // Check the balance of user1 before mint
    const user1Cc721BalanceBefore = await carbonCredit721.balanceOf(
      user1.address
    );
    const vaultCc20BalanceBefore = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );

    //Approve carbonCredit721 to spend 10 token from the user1's balance
    await carbonCredit20.connect(user1).approve(carbonCredit721.target, amount);
    // deposit 10 carbonCredit20 and mint carbonCredit721
    await carbonCredit721.connect(user1).mint(user1.address, amount);

    // Check the balance of user1 after mint
    const user1Cc721BalanceAfter = await carbonCredit721.balanceOf(
      user1.address
    );
    const vaultCc20BalanceAfter = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );
    const theAmountBackedByCc20 = await carbonCredit721.creditsById(0n);

    expect(theAmountBackedByCc20).to.eq(amount);
    expect(user1Cc721BalanceAfter).to.eq(user1Cc721BalanceBefore + 1n);
    expect(vaultCc20BalanceAfter).to.eq(vaultCc20BalanceBefore + amount);
  });

  it("Check if user1 can mint more than one CarbonCredit721 by depositing CarbonCredit20", async () => {
    const amount1 = ethers.parseEther("10");
    const amount2 = ethers.parseEther("1");
    // Transfer 11 tokens to user1
    await carbonCredit20.transfer(user1.address, amount1 + amount2);

    // Check the balance of user1 before mint
    const user1Cc721BalanceBefore = await carbonCredit721.balanceOf(
      user1.address
    );
    const vaultCc20BalanceBefore = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );

    //Approve carbonCredit721 to spend 10 token from the deployer's balance
    await carbonCredit20.approve(carbonCredit721.target, amount1 + amount2);
    // deposit 10 carbonCredit20 and mint carbonCredit721
    await carbonCredit721.mintBatch(
      [user1.address, user1.address],
      [amount1, amount2]
    );

    // Check the balance of user1 after mint
    const user1Cc721BalanceAfter = await carbonCredit721.balanceOf(
      user1.address
    );
    const vaultCc20BalanceAfter = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );
    const theAmount1BackedByCc20 = await carbonCredit721.creditsById(0n);
    const theAmount2BackedByCc20 = await carbonCredit721.creditsById(1n);

    expect(theAmount1BackedByCc20).to.eq(amount1);
    expect(theAmount2BackedByCc20).to.eq(amount2);
    expect(user1Cc721BalanceAfter).to.eq(user1Cc721BalanceBefore + 2n);
    expect(vaultCc20BalanceAfter).to.eq(
      vaultCc20BalanceBefore + amount1 + amount2
    );
  });

  it("Check if user1 can convert NFT to CarbonCredit20", async () => {
    const amount = ethers.parseEther("10");
    await carbonCredit20.transfer(user1.address, amount);
    await carbonCredit20.connect(user1).approve(carbonCredit721.target, amount);
    await carbonCredit721.connect(user1).mint(user1.address, amount);

    // Check the balance of user1 before mint
    const user1Cc20BalanceBefore = await carbonCredit20.balanceOf(
      user1.address
    );
    const tokenId = 0n;
    await carbonCredit721.connect(user1).convertToCarbonCredit20(tokenId);
    // Check the balance of user1 after mint
    const user1Cc20BalanceAfter = await carbonCredit20.balanceOf(user1.address);
    expect(user1Cc20BalanceBefore + amount).to.eq(user1Cc20BalanceAfter);
  });

  it("Check if a user with CREDIT_BURNER_ROLE only can execute the burn function", async () => {
    const amount = ethers.parseEther("10");
    await carbonCredit20.transfer(user1.address, amount);
    await carbonCredit20.connect(user1).approve(carbonCredit721.target, amount);
    await carbonCredit721.connect(user1).mint(user1.address, amount);
    const tokenId = 0n;

    // Check the balance of user1 before burn
    const user1Cc721BalanceBefore = await carbonCredit721.balanceOf(
      user1.address
    );

    // A user1 could not execute the "burn" function
    await expect(carbonCredit721.connect(user1).burn(tokenId)).rejected;

    // A user1 is granted "CREDIT_BURNER_ROLE"
    const CREDIT_BURNER_ROLE =
      "0xc1afd8425b8b41464386646c3e1045d33b9103e915d44771f2b8986b8c964dc5";
    await carbonCredit721.grantRole(CREDIT_BURNER_ROLE, user1);
    await carbonCredit721.connect(user1).burn(tokenId);

    // Check the balance of user1 after mint
    const user1Cc721BalanceAfter = await carbonCredit721.balanceOf(
      user1.address
    );

    expect(user1Cc721BalanceAfter).to.eq(user1Cc721BalanceBefore - 1n);
  });
});
