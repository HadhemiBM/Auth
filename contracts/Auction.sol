// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
contract Auction {
address public owner ; 
address public winner;
address[] public biders ;  
uint public highestBid ; 
uint public endTime ; 
bool public ended ;

constructor(){
    owner = msg.sender ; 
}

modifier onlyOwner (){
    require(msg.sender == owner , "Only owner can call this function");
    _;

}
uint index = (biders.length) -1;

function bid() public payable {
   
    require(msg.value > highestBid , "Bid not enough");
    require(msg.sender != owner , "Owner can't bid");
    require(block.timestamp < endTime , "Auction has ended");
    // 
    if(highestBid != 0){
        payable(winner).transfer(highestBid);
    }
    winner = msg.sender ;
    highestBid = msg.value ;
    biders.push(msg.sender);
}
function endAuction() public onlyOwner {
    require(block.timestamp >= endTime , "Auction has not ended yet");
    require(!ended , "Auction already ended");
    require(biders.length > 0, "No one participated!");
    ended = true ;
     payable(owner).transfer(address(this).balance);

}
 function getWinner() public view returns (address) {
        return winner;
    }


}
