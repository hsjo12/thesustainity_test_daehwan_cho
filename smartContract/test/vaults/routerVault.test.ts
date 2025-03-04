import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { setUp, SetupFixture } from "../utils/setUp";
import { RouterVault } from "../../typechain-types";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserStorage test", () => {
  let user1: SignerWithAddress, deployer: SignerWithAddress;
  let routerVault: RouterVault;

  beforeEach(async () => {
    ({ deployer, user1, routerVault } = await loadFixture<SetupFixture>(setUp));
  });

  it("Check if the withdraw function works correctly", async () => {
    const amount = ethers.parseEther("100");
    await deployer.sendTransaction({ to: routerVault.target, value: amount });

    const routerVaultETHBalanceBefore = await ethers.provider.getBalance(
      routerVault.target
    );
    const user1ETHBalanceBefore = await ethers.provider.getBalance(
      user1.address
    );
    await routerVault.withdraw(user1.address, amount);

    const routerVaultETHBalanceAfter = await ethers.provider.getBalance(
      routerVault.target
    );
    const user1ETHBalanceAfter = await ethers.provider.getBalance(
      user1.address
    );

    expect(routerVaultETHBalanceBefore - amount).to.eq(
      routerVaultETHBalanceAfter
    );
    expect(user1ETHBalanceBefore + amount).to.eq(user1ETHBalanceAfter);
  });

  it("Check if user1 without MANAGE_ROLE cannot execute the withdraw function", async () => {
    const amount = ethers.parseEther("100");
    await deployer.sendTransaction({ to: routerVault.target, value: amount });

    await expect(routerVault.connect(user1).withdraw(user1.address, amount)).to
      .rejected;
  });
});
