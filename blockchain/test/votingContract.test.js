const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingContract", function () {
  let voting, admin, voter1, voter2;

  beforeEach(async function () {
    [admin, voter1, voter2] = await ethers.getSigners();
    const VotingContract = await ethers.getContractFactory("VotingContract");
    const now = Math.floor(Date.now() / 1000) - 10;
    voting = await VotingContract.deploy(admin.address, now, now + 60, ["Alice", "Bob"]);
    await voting.waitForDeployment();
  });

  it("allows voting and counts votes", async function () {
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(1);
    const results = await voting.getResults();
    expect(results[0]).to.equal(1);
    expect(results[1]).to.equal(1);
  });

  it("prevents double voting", async function () {
    await voting.connect(voter1).vote(0);
    await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Already voted");
  });

  it("enforces voting time", async function () {
    // fast-forward past endTime
    await ethers.provider.send("evm_increaseTime", [120]);
    await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("Voting has ended");
  });
});
