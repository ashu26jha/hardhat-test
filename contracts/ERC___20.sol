// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(string memory  name, string memory id)
        ERC20(name, id)
        Ownable()
    {}

    function mint(address to, uint256 amount) public  {
        _mint(to, amount);
    }

    function get_owner() public  view returns (address){
        return owner();
    }
}
