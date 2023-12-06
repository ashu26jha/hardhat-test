import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deployer, recoverer } = await getNamedAccounts();
    console.log("DEPLOYER FROM NAMED", deployer)
    const { deploy } = deployments;

    const relayMethod = "0x6a761202"

    const trustedOrigin = ZeroAddress // hre.network.name === "hardhat" ? ZeroAddress : getGelatoAddress(hre.network.name)
    // await deploy("RelayPlugin", {
    //     from: deployer,
    //     args: [trustedOrigin, relayMethod],
    //     log: true,
    //     deterministicDeployment: true,
    // });

    // await deploy("WhitelistPlugin", {
    //     from: deployer,
    //     args: [],
    //     log: true,
    //     deterministicDeployment: true,
    // });

    // await deploy("RecoveryWithDelayPlugin", {
    //     from: deployer,
    //     args: [recoverer],
    //     log: true,
    //     deterministicDeployment: true,
    // });

    // await deploy("Incentive", {
    //     from: deployer,
    //     args: [],
    //     log: true,
    //     deterministicDeployment: true,
    // });

    await deploy("Verifier", {
        from: deployer,
        args: [],
        log: true,
        // deterministicDeployment: true,
    });

    await deploy("Token", {
        from: deployer,
        args: ["",""],
        log: true,
        // deterministicDeployment: true,
    });
    


};

deploy.tags = ["plugins"];
export default deploy;
