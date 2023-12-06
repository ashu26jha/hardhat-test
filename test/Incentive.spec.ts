// import hre, { deployments, ethers } from "hardhat";
// import { expect } from "chai";
// import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
// import { getIncentivePlugin, getInstance } from "./utils/contracts";
// import { loadPluginMetadata } from "../src/utils/metadata";
// import { buildSingleTx } from "../src/utils/builder";
// import { ISafeProtocolManager__factory, MockContract } from "../typechain-types";
// import { MaxUint256, ZeroHash } from "ethers";
// import { getProtocolManagerAddress } from "../src/utils/protocol";

// describe("Incentive", async () => {
//     let user1: SignerWithAddress, user2: SignerWithAddress;

//     before(async () => {
//         [user1, user2] = await hre.ethers.getSigners();
//     });

//     const setup = deployments.createFixture(async ({ deployments }) => {
//         await deployments.fixture();
        
//         const manager = await ethers.getContractAt("MockContract", await getProtocolManagerAddress(hre));

//         const account = await (await ethers.getContractFactory("ExecutableMockContract")).deploy();
//         const plugin = await getIncentivePlugin(hre);
//         return {
//             account,
//             plugin,
//             manager,
//         };
//     });

//     it("Returns Token Address", async function () {
        
//         const { plugin } = await setup();
//         let pluginAddress = await plugin.connect(user1).getAddress();
//         let tokenOwner = await plugin.connect(user1).getTokenOwner();

//         expect( tokenOwner ).to.be.equal( pluginAddress );

        
//     })

// })
