// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";

import "./Verifier.sol";

contract Incentive is BasePluginWithEventMetadata {

    address verifierAddress;

    constructor()
        BasePluginWithEventMetadata(
            PluginMetadata({name: "NEWPlugin", version: "1.0.0", requiresRootAccess: false, iconUrl: "", appUrl: ""})
        )
    {}

    function setVerifier (address setter) public {
        verifierAddress = setter;
    }
    uint256 random = 0;
    
    function executeFromPlugin(
        ISafeProtocolManager manager,
        ISafe safe,
        SafeTransaction calldata safetx
    ) external returns (bytes[] memory data) {
        random +=1;
        address safeAddress = address(safe);
        if(Verifier(verifierAddress).isVerified(safeAddress)){
            random +=1;
        }
        (data) = manager.executeTransaction(safe, safetx);
    }

    function randomReturn () public view returns (uint256){
        return random;
    }

    function contractAddress() public view returns (address) {
        return address(this);
    }

    function getVerifierAddress () public view returns (address){
        return verifierAddress;
    }
}
// APPROACH ADD TOKEN ADDRESS, APPROVE IT AND MINT IT
