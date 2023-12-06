import hre, { deployments, ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {getInstance, getIncentivePlugin, getVerifierPlugin, getERC20Plugin } from "./utils/contracts";
import { loadPluginMetadata } from "../src/utils/metadata";
import { buildSingleTx } from "../src/utils/builder";
import { ISafeProtocolManager__factory, MockContract } from "../typechain-types";
import { MaxUint256, Typed, ZeroHash } from "ethers";
import { getProtocolManagerAddress } from "../src/utils/protocol";
import {
    keccak256,
    toHex,
} from "viem";
import { BytesLike, HexString } from "ethers/lib.commonjs/utils/data";

describe("Verifier", async () => {

    let user1: SignerWithAddress, user2: SignerWithAddress;

    before(async () => {
        [user1, user2] = await hre.ethers.getSigners();
    });

    let passwords = [
        "ashutosh",
        "anuj",
        "mahim"
    ]

    let hashedPasswords: BytesLike = '0x6cc81b563b46cb63ce79c6d8f78576848bdfcd7cb0d47761dcce8549363c742c' ;
    // hashedPasswords = passwords.map((password) =>
        // keccak256(toHex(password, { size: 32 }))
    // );
    const setup = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();
        
        const managerVerifier = await ethers.getContractAt("MockContract", await getProtocolManagerAddress(hre));

        const accountVerifier = await (await ethers.getContractFactory("ExecutableMockContract")).deploy();
        const pluginVerifier = await getVerifierPlugin(hre);

        return {
            accountVerifier,
            pluginVerifier,
            managerVerifier,
        };
    });

    const setupERC20 = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();
        
        const managerERC20 = await ethers.getContractAt("MockContract", await getProtocolManagerAddress(hre));

        const accountERC20 = await (await ethers.getContractFactory("ExecutableMockContract")).deploy();
        const pluginERC20 = await getERC20Plugin(hre);

        return {
            accountERC20,
            pluginERC20,
            managerERC20,
        };
    });
    
    it("Cannot create without minting", async () => {
        
        const {pluginVerifier} = await setup();
        console.log(typeof(hashedPasswords[0].toString()) )
        await expect(
            pluginVerifier
                .connect(user1)
                .createDeposit(
                    hashedPasswords,
                    100,
                    user1.address
                ),
        ).to.be.revertedWithCustomError(pluginVerifier, "INSUFFICIENT_BALANCE");
    });

    it("Cannot create order without approving", async () => {
        const {pluginVerifier} = await setup();
        // Minting tokens
        await pluginVerifier.connect(user1).mintToken(100,user1.address);
        await expect(
            pluginVerifier.connect(user1).createDeposit(
                hashedPasswords,
                10,
                user1.address
            ),
        ).to.be.revertedWith("ERC20: insufficient allowance")
    });

    it("Creates order, and checks variables", async ()=> {
        const {pluginVerifier} = await setup();
        const {pluginERC20} = await setupERC20();

        // Minting tokens
        await pluginVerifier.connect(user1).mintToken(100,user1.address);
        expect(
            pluginVerifier.connect(user1).getTokenBalance(
                user1.address,
            ),
            '100'
        )
        // const myContract = await hre.ethers.getContractAt("Token",await pluginVerifier.connect(user1).tokenAddress());
        // console.log(myContract)
        await pluginERC20.connect(user1).approve(await pluginVerifier.connect(user1).getAddress(),100);
        await (
            pluginVerifier.connect(user1).createDeposit(
                hashedPasswords,
                10,
                user1.address
            )
        )

    })
    
    
})
