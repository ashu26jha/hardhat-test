// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";

import "./ERC___20.sol";

contract Incentive {
    
    address immutable private i_token;
    uint8 immutable private i_reward_constant;

    event TokenCreated(address indexed tokenAddress); 

    constructor() {
        Token newToken = new Token ("IncentiveToken","INT");
        i_token = address(newToken);
        i_reward_constant = 100;

        emit TokenCreated(address(newToken));
    }

    function mintTokensFor () public {
        Token token = Token(i_token);
        token.mint(msg.sender, 100);
    }

    function getTokenOwner () public view returns (address) {
        Token token = Token(i_token);
        return token.get_owner();
    }

    function contractAddress () public view returns (address){
        return address(this);
    } 

    function getRewardConstant () public view returns(uint8){
        return i_reward_constant;
    }
}
