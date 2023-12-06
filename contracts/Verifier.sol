// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./ERC___20.sol";

import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";

error ALREADY_CLAIMED();
error ALREADY_CANCELLED();
error INCORRECT_PASSWORD(bytes32 incorrect );
error INSUFFICIENT_BALANCE();

contract Verifier {

    struct Deposit {
        address caller;
        uint8 tokens;
        bool claimed;
        bool canceled;
        bytes32 password;
    }

    uint8 totalTransactions = 0;
    uint8 totalRefered = 0;

    mapping (bytes32 => Deposit) deposit;
    mapping (address => uint8) refered_count; 
    mapping (address => uint8) transactions; // MOVE TO INCENTIVE
    mapping (address => bool) is_Refered;

    address immutable private i_token;

    event TokenCreated(address indexed tokenAddress); 
    event DepositCreated(address indexed creator, bytes32 indexed password, uint8 indexed tokenAmount);
    event DepositClaimed(address indexed creator, bytes32 indexed password, address indexed claimer);

    constructor () {
        Token newToken = new Token ("Tokens","TKS");
        i_token = address(newToken);
        emit TokenCreated(i_token);
    }

    function createDeposit (bytes32 password, uint8 tokens, address caller) public {
        
        if(Token(i_token).balanceOf(caller) < tokens){
            revert INSUFFICIENT_BALANCE();
        }
        Token(i_token).transferFrom(caller, address(this), tokens);

        Deposit memory new_deposit;

        new_deposit.caller = caller;
        new_deposit.canceled = false;
        new_deposit.tokens = tokens;
        new_deposit.password = password;

        deposit[password] = new_deposit;
        emit DepositCreated(caller, password, tokens);
    }

    function claimDeposit(bytes32 _password, address reciever) public {

        if(
            
            deposit[_password].password != keccak256(abi.encodePacked(_password))
        ){
            revert INCORRECT_PASSWORD(keccak256(abi.encodePacked(_password)));
        }
        if(
            deposit[_password].claimed == true
        ){
            revert ALREADY_CLAIMED();
        }
        if(
            deposit[_password].canceled == true
        ){
            revert ALREADY_CANCELLED();
        }

        Token(i_token).transferFrom(address(this), reciever, deposit[_password].tokens);
        deposit[_password].claimed = true;
        is_Refered[reciever] = true;
        refered_count[deposit[_password].caller] += 1;
    }

    function cancelDeposit (address caller, bytes32 _password) public {

        if(
            deposit[_password].password != keccak256(abi.encodePacked(_password))
        ){
            revert INCORRECT_PASSWORD(keccak256(abi.encodePacked(_password)));
        }
        if(
            deposit[_password].claimed == true
        ){
            revert ALREADY_CLAIMED();
        }
        if(
            deposit[_password].canceled == true
        ){
            revert ALREADY_CANCELLED();
        }

        Token(i_token).transferFrom(address(this), caller, deposit[_password].tokens);
        deposit[_password].canceled = true; 
    }

    function mintToken (uint256 amount, address caller) public {
        Token(i_token).mint(caller,amount);
    }

    // Getter Functions


    function getTokenAmount (bytes32 _password) public view returns (uint8) {
        return deposit[_password].tokens;
    }
    function isCancelled (bytes32 _password) public view returns (bool) {
        return deposit[_password].canceled;
    }
    function isClaimed (bytes32 _password) public view returns (bool) {
        return deposit[_password].claimed;
    }
    function isVerified (address sender) public view returns (bool){
        return is_Refered[sender];
    }
    function getTokenBalance(address sender) public view returns (uint256){
        return Token(i_token).balanceOf(sender);
    }
    function tokenAddress() public view returns (address){
        return address(Token(i_token));
    }
    function contractAddress() public view returns (address){
        return address(this);
    }
}
