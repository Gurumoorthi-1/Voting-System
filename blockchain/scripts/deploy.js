async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with address:", deployer.address);

  const VotingContract = await ethers.getContractFactory("VotingContract");
  const contract = await VotingContract.deploy(
    deployer.address,
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000) + 3600,
    ["Alice", "Bob", "Charlie"]
  );

  await contract.waitForDeployment();
  console.log("VotingContract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
