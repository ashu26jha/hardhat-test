import hre, { deployments, ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { getInstance, getIncentivePlugin, getVerifierPlugin, getERC20Plugin } from "./utils/contracts";
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

    let deployer: SignerWithAddress,
        recoverer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress,
        user3: SignerWithAddress;

    const validityDuration = 60 * 60 * 24 * 100; // 100 days

    before(async () => {
        [deployer, recoverer, user1, user2, user3] = await hre.ethers.getSigners();
    });

    before(async () => {
        [deployer, user1, user2] = await hre.ethers.getSigners();
    });

    let passwords = [
        "ashutosh",
        "anuj",
        "mahim"
    ]

    let hashedPasswords: BytesLike = '0x6cc81b563b46cb63ce79c6d8f78576848bdfcd7cb0d47761dcce8549363c742c';
    hashedPasswords = (toHex(passwords[0], { size: 32 }))
    console.log('HASHED PASS',hashedPasswords);

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

    const setupIncentive = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();

        const managerIncentive = await ethers.getContractAt("MockContract", await getProtocolManagerAddress(hre));
        const accountIncentive = await (await ethers.getContractFactory("ExecutableMockContract")).deploy();
        const pluginIncentive = await getIncentivePlugin(hre);

        return {
            managerIncentive,
            accountIncentive,
            pluginIncentive,
        };
    });

    let ERC20address: any;
    let VerifierAddress: any;

    it("Cannot create without minting", async () => {

        const { pluginVerifier } = await setup();
        const {pluginERC20} = await setupERC20 ();
        ERC20address = await pluginERC20.connect(deployer).getAddress();
        VerifierAddress = await pluginVerifier.connect(deployer).getAddress();
        
        console.log("ERC20 owner",await pluginERC20.connect(deployer).owner())
        console.log(typeof (hashedPasswords[0].toString()))
        await expect(
            pluginVerifier
                .connect(user1)
                .createDeposit(
                    hashedPasswords,
                    100,
                    user1.address,
                    ERC20address
                ),
        ).to.be.revertedWithCustomError(pluginVerifier, "INSUFFICIENT_BALANCE");
    });

    it("Cannot create order without approving", async () => {
        const { pluginVerifier } = await setup();
        const {pluginERC20} = await setupERC20 ();
        // Minting tokens
        await pluginERC20.connect(deployer).mint(user1.address, 100);
        await expect(
            pluginVerifier.connect(user1).createDeposit(
                hashedPasswords,
                10,
                user1.address,
                ERC20address
            ),
        ).to.be.revertedWith("ERC20: insufficient allowance")
    });

    it("Creates order", async () => {
        const { pluginVerifier } = await setup();
        const { pluginERC20 } = await setupERC20();

        // Minting tokens
        await pluginERC20.connect(deployer).mint(user1.address, 100);
        expect(
            await pluginERC20.connect(user1).balanceOf(
                user1.address,
            ),
        ).to.be.equal(100)
 
        await pluginERC20.connect(user1).approve(VerifierAddress,100 )

        await (
            pluginVerifier.connect(user1).createDeposit(
                hashedPasswords,
                '10',
                user1.address,
                ERC20address
            )
        )

        expect(
            await pluginVerifier.connect(user1).getTokenAmount(
                hashedPasswords,
            ),
        ).to.be.equal(10);

        expect(
            await pluginVerifier.connect(deployer).getTokenBalance(VerifierAddress, ERC20address),
        ).to.be.equal(10)

    });

    it("Claims the token", async () => {

        const { pluginVerifier } = await setup();
        const { pluginERC20 } = await setupERC20();

        await pluginERC20.connect(deployer).mint(user1.address, 100);
        await pluginERC20.connect(user1).approve(VerifierAddress,10 );

        await (
            pluginVerifier.connect(user1).createDeposit(
                hashedPasswords,
                10,
                user1.address,
                ERC20address
            )
        );

        await(
            pluginVerifier.connect(deployer).claimDeposit(
                (toHex(passwords[0], { size: 32 })),
                user2.address,
                ERC20address
            )
        )

        expect(
            await pluginVerifier.connect(deployer).getTokenBalance(user2.address, ERC20address),
        ).to.be.equal(10)

        expect(
            await pluginVerifier.connect(user2).isClaimed(
                (toHex(passwords[0], { size: 32 })),
            ),
        ).to.be.equal(true);

    });

    it("Creates, Claims and tries to create a tx", async () => {
        
        // Import necessary 

        const { pluginVerifier, accountVerifier, managerVerifier } = await setup();
        const { pluginERC20, accountERC20, managerERC20 } = await setupERC20();
        const { pluginIncentive, accountIncentive, managerIncentive } = await setupIncentive();

        const safeAddress = await accountIncentive.getAddress();


        await pluginERC20.connect(deployer).mint(user1.address, 100);
        await pluginERC20.connect(user1).approve(VerifierAddress,10 );

        await (
            pluginVerifier.connect(user1).createDeposit(
                hashedPasswords,
                10,
                user1.address,
                ERC20address
            )
        );

        await(
            pluginVerifier.connect(deployer).claimDeposit(
                (toHex(passwords[0], { size: 32 })),
                user2.address,
                ERC20address
            )
        );

        // Now the deposit has been claimed 
        // Adding verifier address to 

        const addContractData = pluginIncentive.interface.encodeFunctionData("setVerifier",[VerifierAddress]);
        await accountIncentive.executeCallViaMock(await pluginIncentive.getAddress(), 0, addContractData, MaxUint256);

        // Checking contract address 

        expect (
            await(
                pluginIncentive
                    .connect(deployer)
                    .getVerifierAddress()
                )
            )
        .to.be.equal(VerifierAddress);

        const safeTx = buildSingleTx(user3.address, 0n, "0x", 0n, ZeroHash);
        pluginIncentive.connect(user2).executeFromPlugin(managerIncentive.target, safeAddress, safeTx);


        console.log(await pluginVerifier.connect(user1).returnTest())
        console.log(await pluginIncentive.connect(user1).randomReturn())



    })

    
})
