// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract PulseChampionGame {
    // --- Ownership ---
    address public owner;
    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    constructor() { owner = msg.sender; }

    function transferOwnership(address n) external onlyOwner { require(n != address(0), "zero"); owner = n; }

    // --- Types ---
    struct Round {
        uint256 id;
        uint64 startTime;
        uint64 endTime;
        uint256 prizePool; // native token
        address[3] topPlayers;
        uint256[3] topScores;
        bool settled;
        uint256 totalPlayers;
    }

    // --- Config ---
    uint256 public constant ROUND_DURATION = 5 days;
    uint256 public constant HOUR = 1 hours;

    // --- State ---
    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => uint256)) public totalScores; // roundId => player => score
    mapping(uint256 => mapping(address => uint32)) public lastWorkedHour; // roundId => player => hourIndex

    // --- Events ---
    event RoundStarted(uint256 indexed id, uint64 startTime, uint64 endTime);
    event RoundFunded(uint256 indexed id, address indexed from, uint256 amount, uint256 newPool);
    event Worked(uint256 indexed id, address indexed player, uint32 hourIndex, uint256 points, uint256 newTotal);
    event RoundSettled(uint256 indexed id, address[3] winners, uint256[3] amounts);

    // --- Views ---
    function roundActive() public view returns (bool) {
        if (currentRoundId == 0) return false;
        Round storage r = rounds[currentRoundId];
        return block.timestamp < r.endTime && !r.settled;
    }

    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    function getRound(uint256 id) external view returns (Round memory) {
        return rounds[id];
    }

    function getTop3(uint256 id) external view returns (address[3] memory players, uint256[3] memory scores_) {
        Round storage r = rounds[id];
        return (r.topPlayers, r.topScores);
    }

    // --- Round lifecycle ---
    function startRound() external onlyOwner {
        require(!roundActive(), "active");
        uint256 id = currentRoundId + 1;
        currentRoundId = id;
        Round storage r = rounds[id];
        r.id = id;
        r.startTime = uint64(block.timestamp);
        r.endTime = uint64(block.timestamp + ROUND_DURATION);
        emit RoundStarted(id, r.startTime, r.endTime);
    }

    function fundCurrentRound() external payable {
        require(roundActive(), "no active round");
        Round storage r = rounds[currentRoundId];
        r.prizePool += msg.value;
        emit RoundFunded(r.id, msg.sender, msg.value, r.prizePool);
    }

    // Work once per hour: earlier in the hour => higher points.
    function work() external {
        require(roundActive(), "no active");
        Round storage r = rounds[currentRoundId];
        uint256 elapsed = block.timestamp - uint256(r.startTime);
        uint32 hourIndex = uint32(elapsed / HOUR);
        require(lastWorkedHour[r.id][msg.sender] != hourIndex, "already worked");
        lastWorkedHour[r.id][msg.sender] = hourIndex;

        uint256 secIntoHour = elapsed % HOUR;
        uint256 points = HOUR - secIntoHour; // [1..3600]

        uint256 newTotal = totalScores[r.id][msg.sender] + points;
        totalScores[r.id][msg.sender] = newTotal;

        // first time participant count
        if (newTotal == points) {
            r.totalPlayers += 1;
        }

        // update top3
        _updateTop3(r, msg.sender, newTotal);
        emit Worked(r.id, msg.sender, hourIndex, points, newTotal);
    }

    function _updateTop3(Round storage r, address player, uint256 score) internal {
        // if already top, update and reorder
        for (uint256 i = 0; i < 3; i++) {
            if (r.topPlayers[i] == player) {
                r.topScores[i] = score;
                _reorderTop3(r);
                return;
            }
        }
        // try insert if better than lowest
        // find idx of lowest
        uint256 minIdx = 0;
        for (uint256 i = 1; i < 3; i++) {
            if (r.topScores[i] < r.topScores[minIdx]) minIdx = i;
        }
        if (score > r.topScores[minIdx]) {
            r.topPlayers[minIdx] = player;
            r.topScores[minIdx] = score;
            _reorderTop3(r);
        }
    }

    function _reorderTop3(Round storage r) internal {
        // simple bubble pass for 3 elements to ensure descending order
        for (uint256 i = 0; i < 2; i++) {
            for (uint256 j = 0; j < 2 - i; j++) {
                if (r.topScores[j] < r.topScores[j+1]) {
                    (r.topScores[j], r.topScores[j+1]) = (r.topScores[j+1], r.topScores[j]);
                    (r.topPlayers[j], r.topPlayers[j+1]) = (r.topPlayers[j+1], r.topPlayers[j]);
                }
            }
        }
    }

    function settleRound(uint256 id) external {
        Round storage r = rounds[id];
        require(r.id == id && !r.settled, "invalid");
        require(block.timestamp >= r.endTime, "not ended");

        r.settled = true;
        uint256 pool = r.prizePool;
        if (pool == 0) {
            emit RoundSettled(id, r.topPlayers, [uint256(0), uint256(0), uint256(0)]);
            return;
        }
        uint256 a1 = (pool * 50) / 100;
        uint256 a2 = (pool * 30) / 100;
        uint256 a3 = pool - a1 - a2;
        uint256[3] memory amounts = [a1, a2, a3];
        for (uint256 i = 0; i < 3; i++) {
            address to = r.topPlayers[i];
            if (to != address(0) && amounts[i] > 0) {
                (bool ok, ) = to.call{value: amounts[i]}("");
                require(ok, "payout failed");
            }
        }
        emit RoundSettled(id, r.topPlayers, amounts);
    }
}

