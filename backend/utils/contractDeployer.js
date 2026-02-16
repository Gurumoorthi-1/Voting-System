const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const { hardhatEndpoint } = require("../config/blockchain");

const provider = new ethers.providers.JsonRpcProvider(hardhatEndpoint);

const artifactPath = path.join(
  __dirname,
  "../../blockchain/artifacts/contracts/VotingContract.sol/VotingContract.json"
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

async function deployVotingContract(adminAddress, startTime, endTime, candidates) {
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  // Ensure we use a valid Ethereum address for the contract admin
  const finalAdminAddress = ethers.utils.isAddress(adminAddress) ? adminAddress : wallet.address;

  console.log('Deploying with admin:', finalAdminAddress);

  const VotingContractFactory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await VotingContractFactory.deploy(
    finalAdminAddress,
    startTime,
    endTime,
    candidates
  );

  await contract.deployed();
  return contract.address;
}

module.exports = { deployVotingContract };
