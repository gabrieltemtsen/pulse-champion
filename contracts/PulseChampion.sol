// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/// @title PulseChampion - Minimal points ledger for cross-chain deployments
/// @notice Owner can award or set points for addresses; intended to be deployed on Base and Celo
contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract PulseChampion is Ownable {
    mapping(address => uint256) public points;

    event PointsAwarded(address indexed to, uint256 amount, uint256 newTotal);
    event PointsSet(address indexed to, uint256 value);

    /// @notice Award points to an address (additive)
    function awardPoints(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        points[to] += amount;
        emit PointsAwarded(to, amount, points[to]);
    }

    /// @notice Set absolute points for an address (admin override)
    function setPoints(address to, uint256 value) external onlyOwner {
        require(to != address(0), "Invalid address");
        points[to] = value;
        emit PointsSet(to, value);
    }
}

