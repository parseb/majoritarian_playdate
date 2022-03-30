


const { artifacts } = require('hardhat');
// Balancer imports
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');

// Mocking Imports
// const { smock } = require('@defi-wonderland/smock');


// Exported Functionality

const defaultAddr = async () => { 
    const signers = await ethers.getSigners();
    return signers[0].address;
}

const activeAddresses = async () => {
    const signers = await ethers.getSigners();
    accounts = [];
    for (const signer of signers) {
        accounts.push(signer.address);
    }
    return accounts;
 }



const balancerPool = async () => {
    // creates new balancer pool and returns address
    const bfactory = await BFactory.new();
    const pooltx =  await bfactory.newBPool();
    const balancerPoolAddress = await pooltx.logs[0].args.pool;
    const pool = await BPool.at(balancerPoolAddress);

    return { balancerPool }
};

const token1 = async () => {
    token1Factory = await ethers.getContractFactory("Mock1");
    token1 = await token1Factory.deploy(); 
    return { token1 };
}
const token2 = async () => {
    token2Factory = await ethers.getContractFactory("Mock2");
    token2 = await token2Factory.deploy(); 
    return { token2 };
}



const TokenRandDistribute = async () => {}

module.exports = {
    balancerPool,
    token1,
    token2,
    activeAddresses,
    defaultAddr
};
