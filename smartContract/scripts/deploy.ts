const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { DeployModule } = require("../ignition/modules/deploy");

async function createAbi(
  contract: any,
  abiFileName: string,
  contractName: string
) {
  const chainId = hre.network.config.chainId;
  const abiPath = path.join(__dirname, "../abis/");

  if (!fs.existsSync(abiPath)) {
    fs.mkdirSync(abiPath, { recursive: true });
  }

  const artifacts = await hre.artifacts.readArtifact(contractName);
  artifacts.networkId = chainId;
  artifacts.address = contract.target;

  fs.writeFileSync(
    abiPath + `/${abiFileName}.json`,
    JSON.stringify(artifacts, null, 2)
  );

  console.log(`${abiFileName} : ${contract.target}`);
}

async function main() {
  const {
    carbonCredit20,
    carbonCredit721,
    router,
    userStorage,
    carbonCredit20Vault,
    routerVault,
  } = await hre.ignition.deploy(DeployModule);
  createAbi(carbonCredit20, "carbonCredit20", "CarbonCredit20");
  createAbi(carbonCredit721, "carbonCredit721", "CarbonCredit721");
  createAbi(router, "router", "Router");
  createAbi(userStorage, "userStorage", "UserStorage");
  createAbi(carbonCredit20Vault, "carbonCredit20Vault", "CarbonCredit20Vault");
  createAbi(routerVault, "routerVault", "RouterVault");
}
main().catch(console.error);
