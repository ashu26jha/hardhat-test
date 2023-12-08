import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    await deploy("Incentive", {
        from: deployer,
        args: [],
        log: true,
    });

    await deploy("Verifier", {
        from: deployer,
        args: [],
        log: true,
    });

    await deploy("Token", {
        from: deployer,
        args: ["",""],
        log: true,
    });

};

deploy.tags = ["plugins"];
export default deploy;
