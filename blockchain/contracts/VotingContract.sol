// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VotingContract {
    address public admin;
    uint256 public startTime;
    uint256 public endTime;

    struct Candidate {
        string name;
        string details;
        uint256 voteCount;
    }

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;

    constructor(address _admin, uint256 _startTime, uint256 _endTime, string[] memory _candidates) {
        admin = _admin;
        startTime = _startTime;
        endTime = _endTime;
        for (uint i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({name: _candidates[i], details: "", voteCount: 0}));
        }
    }

    function vote(uint256 candidateId) external {
        require(block.timestamp >= startTime, "Voting has not started");
        require(block.timestamp <= endTime, "Voting has ended");
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId < candidates.length, "Invalid candidate");

        candidates[candidateId].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function getCandidate(uint256 id) external view returns (string memory, string memory, uint256) {
        Candidate memory c = candidates[id];
        return (c.name, c.details, c.voteCount);
    }

    function getResults() external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            results[i] = candidates[i].voteCount;
        }
        return results;
    }

    function isVotingActive() public view returns (bool) {
        return (block.timestamp >= startTime && block.timestamp <= endTime);
    }
}
