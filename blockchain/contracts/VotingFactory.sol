// Optional factory contract (not used in this setup)
pragma solidity ^0.8.17;

import "./VotingContract.sol";

contract VotingFactory {
    address[] public deployedContracts;

    function createVoting(uint256 startTime, uint256 endTime, string[] memory candidates) public {
        VotingContract vc = new VotingContract(msg.sender, startTime, endTime, candidates);
        deployedContracts.push(address(vc));
    }

    function getDeployedContracts() public view returns (address[] memory) {
        return deployedContracts;
    }
}
