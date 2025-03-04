import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  CarbonCredit20,
  CarbonCredit721,
  Router,
  RouterVault,
  UserStorage,
  CarbonCredit20Vault,
} from "../../typechain-types";
export interface SetupFixture {
  deployer: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  carbonCredit20: CarbonCredit20;
  carbonCredit721: CarbonCredit721;
  router: Router;
  routerVault: RouterVault;
  carbonCredit20Vault: CarbonCredit20Vault;
  userStorage: UserStorage;
}

export const CARBON_CREDIT_20_INITIAL_AMOUNT = ethers.parseEther("100000");
export const CARBON_CREDIT_721_NAME = "CarbonCredit721";
export const CARBON_CREDIT_721_SYMBOL = "CC721";
export const INITIAL_PRICE_PER_TOKEN = ethers.parseEther("0.0001");
export const SPEED = ethers.parseEther("1");

export async function setUp(): Promise<SetupFixture> {
  const [deployer, user1, user2] = await ethers.getSigners();
  // Router
  const RouterLogic = await ethers.getContractFactory("Router");
  const routerLogic = await RouterLogic.deploy();

  const RouterProxy = await ethers.getContractFactory("ERC1967Proxy");
  const routerProxy = await RouterProxy.deploy(routerLogic.target, "0x");

  const router = await ethers.getContractAt("Router", routerProxy.target);

  // CarbonCredit20
  const CarbonCredit20 = await ethers.getContractFactory("CarbonCredit20");
  const carbonCredit20 = await CarbonCredit20.deploy(
    CARBON_CREDIT_20_INITIAL_AMOUNT,
    router.target
  );

  // CarbonCredit721
  const CarbonCredit721Logic = await ethers.getContractFactory(
    "CarbonCredit721"
  );
  const carbonCredit721Logic = await CarbonCredit721Logic.deploy();

  const CarbonCredit721Proxy = await ethers.getContractFactory("ERC1967Proxy");
  const carbonCredit721Proxy = await CarbonCredit721Proxy.deploy(
    carbonCredit721Logic.target,
    "0x"
  );

  const carbonCredit721 = await ethers.getContractAt(
    "CarbonCredit721",
    carbonCredit721Proxy.target
  );

  // CarbonCredit20Vault
  const CarbonCredit20VaultLogic = await ethers.getContractFactory(
    "CarbonCredit20Vault"
  );
  const carbonCredit20VaultLogic = await CarbonCredit20VaultLogic.deploy();

  const CarbonCredit20VaultProxy = await ethers.getContractFactory(
    "ERC1967Proxy"
  );
  const carbonCredit20VaultProxy = await CarbonCredit20VaultProxy.deploy(
    carbonCredit20VaultLogic.target,
    "0x"
  );
  const carbonCredit20Vault = await ethers.getContractAt(
    "CarbonCredit20Vault",
    carbonCredit20VaultProxy.target
  );

  // RouterVault
  const RouterVaultLogic = await ethers.getContractFactory("RouterVault");
  const routerVaultLogic = await RouterVaultLogic.deploy();

  const RouterVaultProxy = await ethers.getContractFactory("ERC1967Proxy");
  const routerVaultProxy = await RouterVaultProxy.deploy(
    routerVaultLogic.target,
    "0x"
  );
  const routerVault = await ethers.getContractAt(
    "RouterVault",
    routerVaultProxy.target
  );

  // UserStorage
  const UserStorageLogic = await ethers.getContractFactory("UserStorage");
  const userStorageLogic = await UserStorageLogic.deploy();

  const UserStorageProxy = await ethers.getContractFactory("ERC1967Proxy");
  const userStorageProxy = await UserStorageProxy.deploy(
    userStorageLogic.target,
    "0x"
  );
  const userStorage = await ethers.getContractAt(
    "UserStorage",
    userStorageProxy.target
  );

  // Inits
  await carbonCredit721.init(
    carbonCredit20.target,
    carbonCredit20Vault.target,
    router.target,
    CARBON_CREDIT_721_NAME,
    CARBON_CREDIT_721_SYMBOL
  );

  await router.init(
    carbonCredit20.target,
    carbonCredit721.target,
    userStorage.target,
    routerVault.target,
    INITIAL_PRICE_PER_TOKEN
  );

  await carbonCredit20Vault.init(carbonCredit20.target, carbonCredit721.target);
  await routerVault.init();
  await userStorage.init(router.target, SPEED);

  return {
    deployer,
    user1,
    user2,
    carbonCredit20,
    carbonCredit721,
    router,
    routerVault,
    carbonCredit20Vault,
    userStorage,
  };
}
