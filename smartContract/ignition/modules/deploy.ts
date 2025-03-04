import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export const CARBON_CREDIT_20_INITIAL_AMOUNT = ethers.parseEther("100000");
export const CARBON_CREDIT_721_NAME = "CarbonCredit721";
export const CARBON_CREDIT_721_SYMBOL = "CC721";
export const INITIAL_PRICE_PER_TOKEN = ethers.parseEther("0.0001");
export const SPEED = ethers.parseEther("1");

const RouterModule = buildModule("RouterModule", (m) => {
  const routerLogic = m.contract("Router", [], {
    id: "routerLogic",
  });
  const routerProxy = m.contract("ERC1967Proxy", [routerLogic, "0x"], {
    id: "routerProxy",
  });
  const router = m.contractAt("Router", routerProxy);
  return { router };
});

const CarbonCredit20Module = buildModule("CarbonCredit20Module", (m) => {
  const { router } = m.useModule(RouterModule);
  const carbonCredit20 = m.contract("CarbonCredit20", [
    CARBON_CREDIT_20_INITIAL_AMOUNT,
    router,
  ]);
  return { carbonCredit20 };
});

const CarbonCredit721Module = buildModule("CarbonCredit721Module", (m) => {
  const carbonCredit721Logic = m.contract("CarbonCredit721", [], {
    id: "carbonCredit721Logic",
  });
  const carbonCredit721Proxy = m.contract(
    "ERC1967Proxy",
    [carbonCredit721Logic, "0x"],
    { id: "carbonCredit721Proxy" }
  );
  const carbonCredit721 = m.contractAt("CarbonCredit721", carbonCredit721Proxy);
  return { carbonCredit721 };
});

const UserStorageModule = buildModule("UserStorageModule", (m) => {
  const userStorageLogic = m.contract("UserStorage", [], {
    id: "userStorageLogic",
  });
  const UserStorageProxy = m.contract(
    "ERC1967Proxy",
    [userStorageLogic, "0x"],
    {
      id: "UserStorageProxy",
    }
  );
  const userStorage = m.contractAt("UserStorage", UserStorageProxy);
  return { userStorage };
});

const CarbonCredit20VaultModule = buildModule(
  "CarbonCredit20VaultModule",
  (m) => {
    const carbonCredit20VaultLogic = m.contract("CarbonCredit20Vault", [], {
      id: "carbonCredit20VaultLogic",
    });
    const carbonCredit20VaultProxy = m.contract(
      "ERC1967Proxy",
      [carbonCredit20VaultLogic, "0x"],
      {
        id: "carbonCredit20VaultProxy",
      }
    );
    const carbonCredit20Vault = m.contractAt(
      "CarbonCredit20Vault",
      carbonCredit20VaultProxy
    );
    return { carbonCredit20Vault };
  }
);

const RouterVaultModule = buildModule("RouterVaultModule", (m) => {
  const routerVaultLogic = m.contract("RouterVault", [], {
    id: "routerVaultLogic",
  });
  const routerVaultProxy = m.contract(
    "ERC1967Proxy",
    [routerVaultLogic, "0x"],
    {
      id: "routerVaultProxy",
    }
  );
  const routerVault = m.contractAt("RouterVault", routerVaultProxy);
  return { routerVault };
});

const DeployModule = buildModule("DeployModule", (m) => {
  const { carbonCredit20 } = m.useModule(CarbonCredit20Module);
  const { carbonCredit721 } = m.useModule(CarbonCredit721Module);
  const { router } = m.useModule(RouterModule);
  const { userStorage } = m.useModule(UserStorageModule);
  const { carbonCredit20Vault } = m.useModule(CarbonCredit20VaultModule);
  const { routerVault } = m.useModule(RouterVaultModule);

  try {
    // Inits
    m.call(carbonCredit721, "init", [
      carbonCredit20,
      carbonCredit20Vault,
      router,
      CARBON_CREDIT_721_NAME,
      CARBON_CREDIT_721_SYMBOL,
    ]);
    m.call(router, "init", [
      carbonCredit20,
      carbonCredit721,
      userStorage,
      routerVault,
      INITIAL_PRICE_PER_TOKEN,
    ]);
    m.call(carbonCredit20Vault, "init", [carbonCredit20, carbonCredit721]);
    m.call(routerVault, "init", []);
    m.call(userStorage, "init", [router, SPEED]);
  } catch (error) {
    console.log(error);
  }

  return {
    carbonCredit20,
    carbonCredit721,
    router,
    userStorage,
    carbonCredit20Vault,
    routerVault,
  };
});

module.exports = {
  DeployModule,
};
