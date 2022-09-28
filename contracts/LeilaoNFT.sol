// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC721 {
    function safeTransferFrom(
        address from,
        address to,
        uint tokenId
    ) external;

    function transferFrom(
        address,
        address,
        uint
    ) external;
}

contract LeilaoNFT {
    using SafeMath for uint256;

    event Start();
    event Bid(address indexed sender, uint amount);
    event Withdraw(address indexed bidder, uint amount);
    event End(address winner, uint amount);

    IERC721 public nft;
    uint public nftId;

    address payable public seller;
    uint32 public endAt;
    bool public started;
    bool public ended;

    address public highestBidder;
    uint public highestBid;
    uint32 public timerAuction;
    uint public percentage;

    mapping(address => uint) public bids;

    constructor(
        address _nft,
        uint _nftId,
        uint _startingBid,
        uint32 _timerAuction,
        uint _percentage
    ) {
        nft = IERC721(_nft);
        nftId = _nftId;

        seller = payable(msg.sender);
        highestBid = _startingBid;
        timerAuction = _timerAuction;
        percentage = _percentage;
    }

    function start() external onlyOwner {
        require(!started, "started");

        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        endAt = uint32(block.timestamp + timerAuction);

        emit Start();
    }

    function bid() external payable {
        require(started, "not started");
        require(block.timestamp < endAt, "ended");
        require(msg.value > highestBid, "value < highest");

        if (highestBidder != address(0)) {
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = (msg.value);

        emit Bid(msg.sender, msg.value);
    }

    function withdraw() external {
        require(bids[msg.sender] != 0, "not bidder");
        
        uint bal = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(bal.sub(percentage));

        emit Withdraw(msg.sender, bal);
    }

    function end() external onlyOwner {
        require(started, "not started");
        //require(block.timestamp >= endAt, "not ended");
        require(!ended, "ended");


        ended = true;
        if (highestBidder != address(0)) {
            nft.safeTransferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        } else {
            nft.safeTransferFrom(address(this), seller, nftId);
        }

        emit End(highestBidder, highestBid);
    }

    //MODIFIERS

    modifier onlyOwner() {
    require(msg.sender == seller, "not owner");
    _;
  }

}