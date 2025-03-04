import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { setUp, SetupFixture } from "../utils/setUp";
import { CarbonCredit20, CarbonCredit20Vault } from "../../typechain-types";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserStorage test", () => {
  let user1: SignerWithAddress, deployer: SignerWithAddress;
  let carbonCredit20: CarbonCredit20, carbonCredit20Vault: CarbonCredit20Vault;

  beforeEach(async () => {
    ({ deployer, user1, carbonCredit20, carbonCredit20Vault } =
      await loadFixture<SetupFixture>(setUp));
    const CREDIT_WITHDRAWER_ROLE =
      "0xe964ec5cf39a6e0445036d53c706e8c2f5eef2d81603ffea17e06e2db4b943b2";
    await carbonCredit20Vault.grantRole(
      CREDIT_WITHDRAWER_ROLE,
      deployer.address
    );
  });

  it("Check if the burnCredit20 function can only be executed by a user with the CREDIT_WITHDRAWER_ROLE", async () => {
    const amount = ethers.parseEther("10");
    await carbonCredit20.mint(carbonCredit20Vault.target, amount);

    const carbonCredit20VaultBalanceBefore = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );

    await carbonCredit20Vault.burnCredit20(amount);
    await expect(carbonCredit20Vault.connect(user1).burnCredit20(amount)).to
      .rejected;

    const carbonCredit20VaultBalanceAfter = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );

    expect(carbonCredit20VaultBalanceAfter).to.eq(
      carbonCredit20VaultBalanceBefore - amount
    );
  });

  it("Check if the moveBackCredit20 function can only be executed by a user with the CREDIT_WITHDRAWER_ROLE", async () => {
    const amount = ethers.parseEther("10");
    await carbonCredit20.mint(carbonCredit20Vault.target, amount);

    const carbonCredit20VaultBalanceBefore = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );
    const user1BalanceBefore = await carbonCredit20.balanceOf(user1.address);

    await carbonCredit20Vault.moveBackCredit20(user1, amount);
    await expect(
      carbonCredit20Vault.connect(user1).moveBackCredit20(user1, amount)
    ).to.rejected;

    const carbonCredit20VaultBalanceAfter = await carbonCredit20.balanceOf(
      carbonCredit20Vault.target
    );
    const user1BalanceAfter = await carbonCredit20.balanceOf(user1.address);

    expect(carbonCredit20VaultBalanceAfter).to.eq(
      carbonCredit20VaultBalanceBefore - amount
    );
    expect(user1BalanceAfter).to.eq(user1BalanceBefore + amount);
  });

  it("Check if setCarbonCredit20 works correctly", async () => {
    const zeroAddress = ethers.ZeroAddress;
    await carbonCredit20Vault.setCarbonCredit20(zeroAddress);
    const carbonCredit20Address = await carbonCredit20Vault.carbonCredit20();
    await expect(
      carbonCredit20Vault.connect(user1).setCarbonCredit20(zeroAddress)
    ).rejected;
    expect(carbonCredit20Address).to.eq(zeroAddress);
  });
});
