import CarbonCREDIT20Json from "../../../abis/carbonCredit20.json";
import CarbonCREDIT721Json from "../../../abis/carbonCredit721.json";
import RouterJson from "../../../abis/router.json";
import UserStorageJson from "../../../abis/userStorage.json";
import CarbonCredit20VaultJson from "../../../abis/carbonCredit20Vault.json";
import RouterVaultJson from "../../../abis/routerVault.json";
import { ethers } from "hardhat";
import {
  CarbonCredit20,
  CarbonCredit721,
  Router,
  RouterVault,
  UserStorage,
  CarbonCredit20Vault,
} from "../../../typechain-types";

export async function setUp(): Promise<{
  cc20: CarbonCredit20;
  cc721: CarbonCredit721;
  router: Router;
  carbonCredit20Vault: CarbonCredit20Vault;
  routerVault: RouterVault;
  userStorage: UserStorage;
}> {
  const cc20 = await ethers.getContractAt(
    "CarbonCredit20",
    CarbonCREDIT20Json.address
  );
  const cc721 = await ethers.getContractAt(
    "CarbonCredit721",
    CarbonCREDIT721Json.address
  );
  const router = await ethers.getContractAt("Router", RouterJson.address);
  const carbonCredit20Vault = await ethers.getContractAt(
    "CarbonCredit20Vault",
    CarbonCredit20VaultJson.address
  );
  const routerVault = await ethers.getContractAt(
    "RouterVault",
    RouterVaultJson.address
  );
  const userStorage = await ethers.getContractAt(
    "UserStorage",
    UserStorageJson.address
  );
  return {
    cc20,
    cc721,
    router,
    carbonCredit20Vault,
    routerVault,
    userStorage,
  };
}
