import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { INITIAL_PRICE_PER_TOKEN, setUp, SetupFixture } from "../utils/setUp";
import {
  CarbonCredit20,
  CarbonCredit721,
  Router,
  RouterVault,
  UserStorage,
} from "../../typechain-types";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { getRequiredETH } from "../utils/utils";

describe("Router test", () => {
  let user1: SignerWithAddress;
  let carbonCredit20: CarbonCredit20,
    carbonCredit721: CarbonCredit721,
    router: Router,
    routerVault: RouterVault,
    userStorage: UserStorage;

  beforeEach(async () => {
    ({
      user1,
      carbonCredit20,
      carbonCredit721,
      userStorage,
      router,
      routerVault,
    } = await loadFixture<SetupFixture>(setUp));
  });

  it("Check if setup functions works", async () => {
    const zeroAddress = ethers.ZeroAddress;
    const amount = ethers.parseEther("1");

    await router.setCarbonCredit20(zeroAddress);
    await router.setCarbonCredit721(zeroAddress);
    await router.setPricePerToken(amount);
    const carbonCredit20Address = await router.carbonCredit20();
    const carbonCredit721Address = await router.carbonCredit721();
    const pricePerToken = await router.pricePerToken();

    expect(carbonCredit20Address).to.eq(zeroAddress);
    expect(carbonCredit721Address).to.eq(zeroAddress);
    expect(pricePerToken).to.eq(amount);
  });

  it("Check if a user without MANAGER_ROLE cannot execute setup function", async () => {
    const zeroAddress = ethers.ZeroAddress;
    const amount = ethers.parseEther("1");
    await expect(router.connect(user1).setCarbonCredit20(zeroAddress)).to
      .rejected;
    await expect(router.connect(user1).setCarbonCredit721(zeroAddress)).to
      .rejected;
    await expect(router.connect(user1).setPricePerToken(amount)).to.rejected;
  });

  it("Check if user1 can buy carbonCredit20 with ETH", async () => {
    const amountToBuy = ethers.parseEther("10");
    const requiredETH = getRequiredETH(INITIAL_PRICE_PER_TOKEN, amountToBuy);

    // Check ETH balance of router vault before buyCredit20
    const routerVaultBalanceBefore = await ethers.provider.getBalance(
      routerVault.target
    );
    // Check CarbonCredit20 balance of router vault before buyCredit20
    const user1BalanceBefore = await carbonCredit20.balanceOf(user1.address);

    await router.connect(user1).buyCredit20({ value: requiredETH });

    // Check ETH balance of router vault after buyCredit20
    const routerVaultBalanceAfter = await ethers.provider.getBalance(
      routerVault.target
    );

    // Check CarbonCredit20 balance of router vault after buyCredit20
    const user1BalanceAfter = await carbonCredit20.balanceOf(user1.address);

    expect(routerVaultBalanceAfter).to.eq(
      routerVaultBalanceBefore + requiredETH
    );
    expect(user1BalanceAfter).to.eq(user1BalanceBefore + amountToBuy);
  });

  it("Check if user1 can burn carbonCredit20 and reduce emittedCarbon through router.sol", async () => {
    // Gain carbonCredit20
    const amountToBuy = ethers.parseEther("10");
    const requiredETH = getRequiredETH(INITIAL_PRICE_PER_TOKEN, amountToBuy);
    await router.connect(user1).buyCredit20({ value: requiredETH });

    // Register user info
    await userStorage.connect(user1).register();

    await time.increase(3000);
    // the emitted Carbon amount of user1 before burn
    const user1EmittedCarbonAmountBefore = (
      await userStorage.emittedCarbonAmountOf(user1.address)
    )[0];

    await carbonCredit20.connect(user1).approve(router.target, amountToBuy);
    await router.connect(user1).burnCredit20(amountToBuy);

    // the emitted Carbon amount of user1 after burn
    const user1EmittedCarbonAmountAfter = (
      await userStorage.emittedCarbonAmountOf(user1.address)
    )[0];

    const expectedUser1EmittedCarbonAmountAfter =
      user1EmittedCarbonAmountBefore > amountToBuy
        ? user1EmittedCarbonAmountAfter
        : 0n;

    expect(user1EmittedCarbonAmountAfter).to.eq(
      expectedUser1EmittedCarbonAmountAfter
    );
  });

  it("Check if user1 can burn carbonCredit721 and reduce emittedCarbon through router.sol", async () => {
    // Gain carbonCredit20
    const amountToBuy = ethers.parseEther("10");
    const requiredETH = getRequiredETH(INITIAL_PRICE_PER_TOKEN, amountToBuy);
    await router.connect(user1).buyCredit20({ value: requiredETH });
    // Gain carbonCredit721
    //Approve carbonCredit721 to spend 10 token from the user1's balance
    await carbonCredit20
      .connect(user1)
      .approve(carbonCredit721.target, amountToBuy);
    // deposit 10 carbonCredit20 and mint carbonCredit721
    await carbonCredit721.connect(user1).mint(user1.address, amountToBuy);

    // Register user info
    await userStorage.connect(user1).register();

    await time.increase(3000);
    // the emitted Carbon amount of user1 before burn
    const user1EmittedCarbonAmountBefore = (
      await userStorage.emittedCarbonAmountOf(user1.address)
    )[0];
    const NFT_ID = 0n;
    await carbonCredit721.connect(user1).setApprovalForAll(router.target, true);
    await router.connect(user1).burnCredit721(NFT_ID);

    // the emitted Carbon amount of user1 after burn
    const user1EmittedCarbonAmountAfter = (
      await userStorage.emittedCarbonAmountOf(user1.address)
    )[0];

    const expectedUser1EmittedCarbonAmountAfter =
      user1EmittedCarbonAmountBefore > amountToBuy
        ? user1EmittedCarbonAmountAfter
        : 0n;

    expect(user1EmittedCarbonAmountAfter).to.eq(
      expectedUser1EmittedCarbonAmountAfter
    );
  });

  it("Check if the errors in the buyCredit20 function works", async () => {
    const amountToBuy = ethers.parseEther("0");
    const requiredETH = getRequiredETH(INITIAL_PRICE_PER_TOKEN, amountToBuy);

    await expect(router.buyCredit20({ value: 0 })).revertedWithCustomError(
      router,
      "tooSmallAmount"
    );

    await expect(
      router.buyCredit20({ value: requiredETH })
    ).revertedWithCustomError(router, "tooSmallAmount");
  });

  it("Check if user can fetch a required amount of ETH to buy a certain amount of token correctly", async () => {
    const pricePerToken = await router.pricePerToken();
    const amountTobuy = ethers.parseEther("10");
    const denominator = ethers.parseEther("1");
    const requiredETH = (pricePerToken * amountTobuy) / denominator;

    const expectedRequiredETH = getRequiredETH(
      INITIAL_PRICE_PER_TOKEN,
      amountTobuy
    );

    expect(expectedRequiredETH).to.eq(requiredETH);
  });
});
