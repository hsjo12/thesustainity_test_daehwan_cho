import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { setUp, SetupFixture } from "../utils/setUp";
import { UserStorage } from "../../typechain-types";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserStorage test", () => {
  let user1: SignerWithAddress;
  let userStorage: UserStorage;

  beforeEach(async () => {
    ({ user1, userStorage } = await loadFixture<SetupFixture>(setUp));
  });

  it("Check if user1 can register their information", async () => {
    await expect(userStorage.connect(user1).register()).to.not.be.reverted;
  });

  it("Check if user1 can register their information multiple times", async () => {
    await expect(userStorage.connect(user1).register()).to.not.be.reverted;
    await expect(
      userStorage.connect(user1).register()
    ).to.revertedWithCustomError(userStorage, "AlreadyRegistered");
  });

  it("Check if the increaseBurntCarbonCredit and emittedCarbonAmountOf functions work", async () => {
    // User1 is granted a CREDIT_BURNER_ROLE to execute the increaseBurntCarbonCredit function
    const CREDIT_BURNER_ROLE =
      "0xc1afd8425b8b41464386646c3e1045d33b9103e915d44771f2b8986b8c964dc5";
    await userStorage.grantRole(CREDIT_BURNER_ROLE, user1);
    await userStorage.connect(user1).register();

    // Fetch current carbon credit information of user1
    const user1EmittedCarbonAmountOfBefore =
      await userStorage.emittedCarbonAmountOf(user1.address);

    const amount = ethers.parseEther("10");

    const expectedUserTotalBurntCarbonCredit =
      user1EmittedCarbonAmountOfBefore[2] + amount;

    const expectedEmittedCarbonAmount =
      user1EmittedCarbonAmountOfBefore[0] > expectedUserTotalBurntCarbonCredit
        ? user1EmittedCarbonAmountOfBefore[0] - amount
        : 0;
    const expectedExtraCarbonCredit =
      user1EmittedCarbonAmountOfBefore[0] > expectedUserTotalBurntCarbonCredit
        ? 0
        : expectedUserTotalBurntCarbonCredit -
          user1EmittedCarbonAmountOfBefore[0];

    // Burn 10 tokens
    await userStorage.connect(user1).increaseBurntCarbonCredit(user1, amount);

    const user1EmittedCarbonAmountOfAfter =
      await userStorage.emittedCarbonAmountOf(user1.address);

    expect(user1EmittedCarbonAmountOfAfter[0]).to.eq(
      expectedEmittedCarbonAmount
    );
    expect(user1EmittedCarbonAmountOfAfter[1]).to.lte(
      expectedExtraCarbonCredit
    );
    expect(user1EmittedCarbonAmountOfAfter[2]).to.eq(
      expectedUserTotalBurntCarbonCredit
    );
  });

  it("Check if the AlreadyRegistered error triggered in the increaseBurntCarbonCredit function", async () => {
    // User1 is granted a CREDIT_BURNER_ROLE to execute the increaseBurntCarbonCredit function
    const CREDIT_BURNER_ROLE =
      "0xc1afd8425b8b41464386646c3e1045d33b9103e915d44771f2b8986b8c964dc5";
    await userStorage.grantRole(CREDIT_BURNER_ROLE, user1);

    const amount = ethers.parseEther("10");
    // Burn 10 tokens
    await expect(
      userStorage.connect(user1).increaseBurntCarbonCredit(user1, amount)
    ).revertedWithCustomError(userStorage, "UserNotRegistered");
  });

  it("Check if user1 without CREDIT_BURNER_ROLE cannot execute the increaseBurntCarbonCredit function", async () => {
    const amount = ethers.parseEther("10");
    await expect(
      userStorage
        .connect(user1)
        .increaseBurntCarbonCredit(user1.address, amount)
    ).to.rejected;
  });

  it("Check if the setSpeed function works correctly", async () => {
    const speedAmount = ethers.parseEther("100");
    await userStorage.setSpeed(speedAmount);
    const speed = await userStorage.speed();
    expect(speed).to.eq(speedAmount);
  });

  it("Check if a user without MANAGER_ROLE cannot run the setSpeed function", async () => {
    const speedAmount = ethers.parseEther("100");
    await expect(userStorage.connect(user1).setSpeed(speedAmount)).reverted;
  });
});
