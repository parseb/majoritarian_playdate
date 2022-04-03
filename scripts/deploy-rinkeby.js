//const hre = require("hardhat");

const readline = require('readline');
const { toWei, fromWei } = web3.utils;
const helpers = require('../test/helpers/setup');


(async () => {
    console.log("######## Deployment to RINKEBY stated. ##########");
    let t1 = await helpers.token1();
    console.log( `Token1 deployed at:#########| ${t1.address} |#########`);
    let t2 = await helpers.token2();

    console.log( `Token2 deployed at:#########| ${t2.address} |#########`);
    let pool = await helpers.balancerPool();

    let MajoritarianContract = await ethers.getContractFactory("Majoritarian");
    let M = await MajoritarianContract.deploy(pool.address, t1.address, t2.address);
    console.log( `***Majoritarian*** deployed at:#########| ${M.address} |#########`);
    console.log("######## END ##########");
})();

