

// Artifacts Truffle
const { artifacts } = require('hardhat');

// Balancer 
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');

// Mocking 
// const { smock } = require('@defi-wonderland/smock');


// Exported Functionality

// Address of primary account[0] and owner() / minter
const defaultAddr = async () => { 
    const signers = await ethers.getSigners();
    return signers[0].address;
}

// Active accounts list
const activeAddresses = async () => {
    const signers = await ethers.getSigners();
    accounts = [];
    signers.map(s => accounts.push(s.address));
    return accounts;
 }

const balancerPool = async () => {
    // creates new balancer pool and returns address
    const bfactory = await BFactory.new();
    const pooltx =  await bfactory.newBPool();
    const balancerPoolAddress = await pooltx.logs[0].args.pool;
    const pool = await BPool.at(balancerPoolAddress);

    return pool;
};

const token1 = async () => {
    token1Factory = await ethers.getContractFactory("Mock1");
    t1 = await token1Factory.deploy(); 
    return  t1 ;
}
const token2 = async () => {
    token2Factory = await ethers.getContractFactory("Mock2");
    t2 = await token2Factory.deploy(); 
    return  t2 ;
}

const deployMajoritarian = async (a, b, c) => {
    const MajoritarianContract = await ethers.getContractFactory("Majoritarian");
    const Majoritarian = await MajoritarianContract.deploy(a, b, c);
    
    return Majoritarian;
}



const TokenRandDistribute = async () => {}

module.exports = {
    balancerPool,
    token1,
    token2,
    activeAddresses,
    defaultAddr,
    deployMajoritarian
};
