import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  setUp,
  SetupFixture,
  CARBON_CREDIT_20_INITIAL_AMOUNT,
} from "../utils/setUp";
import {
  CarbonCredit20,
  CarbonCredit721,
  Router,
  RouterVault,
  UserStorage,
  CarbonCredit20Vault,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
describe("CarbonCredit20 test", () => {
  let deployer: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;
  let carbonCredit20: CarbonCredit20;

  beforeEach(async () => {
    ({ deployer, user1, user2, carbonCredit20 } =
      await loadFixture<SetupFixture>(setUp));
  });

  it("Check if total supply of carbonCredit20 is equal to the input initial amount", async () => {
    const totalSupply = await carbonCredit20.totalSupply();
    expect(totalSupply).to.eq(CARBON_CREDIT_20_INITIAL_AMOUNT);
  });

  it("Check if Authorized user(deployer) can mint carbonCredit20", async () => {
    const amount = ethers.parseEther("10");

    // Check the balance of deployer before mint
    const balanceOfDeployerBefore = await carbonCredit20.balanceOf(
      deployer.address
    );

    // mint 10 tokens
    await carbonCredit20.mint(deployer.address, amount);

    // Check the balance of deployer after mint
    const balanceOfDeployerAfter = await carbonCredit20.balanceOf(
      deployer.address
    );
    expect(balanceOfDeployerAfter).to.eq(balanceOfDeployerBefore + amount);
  });

  it("Check if Authorized user(deployer) can burn carbonCredit20", async () => {
    const amount = ethers.parseEther("10");
    // Check the balance of deployer before burn
    const balanceOfDeployerBefore = await carbonCredit20.balanceOf(
      deployer.address
    );

    // burn 10 tokens
    await carbonCredit20.mint(deployer.address, amount);

    // Check the balance of deployer after burn
    const balanceOfDeployerAfter = await carbonCredit20.balanceOf(
      deployer.address
    );

    expect(balanceOfDeployerAfter).to.eq(balanceOfDeployerBefore + amount);
  });

  it("Check if Authorized user1 can burn deployer's carbonCredit20 with the burnfrom function", async () => {
    const amount = ethers.parseEther("10");

    // Approve user1 to spend 10 tokens from the deployer's balance
    await carbonCredit20.approve(user1.address, amount);

    // Check the balance of deployer before burnfrom
    const balanceOfDeployerBefore = await carbonCredit20.balanceOf(
      deployer.address
    );

    // user1 burns 10 tokens from deployer's balance
    await carbonCredit20.connect(user1).burnFrom(deployer.address, amount);

    // Check the balance of deployer after burn
    const balanceOfDeployerAfter = await carbonCredit20.balanceOf(
      deployer.address
    );

    expect(balanceOfDeployerAfter).to.eq(balanceOfDeployerBefore - amount);
  });

  it("Check if user1(Unauthorized user) cannot mint carbonCredit20", async () => {
    const amount = ethers.parseEther("10");

    // Check the balance of deployer before mint
    const balanceOfDeployerBefore = await carbonCredit20.balanceOf(
      deployer.address
    );

    expect(carbonCredit20.connect(user1).mint(user1.address, amount)).rejected;

    // Check the balance of deployer after mint
    const balanceOfDeployerAfter = await carbonCredit20.balanceOf(
      deployer.address
    );
    expect(balanceOfDeployerAfter).to.eq(balanceOfDeployerBefore);
  });
});
