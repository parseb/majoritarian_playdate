

// Balancer imports
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');

// Mocking Imports
const { smock } = require('@defi-wonderland/smock');


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
    // deploy balancer infrastructure
    const bfactory = await BFactory.new();
    const bpool =  await BPool.new(await bfactory.newBPool());

    console.log({bfactory, bpool});
 


    return { balancerPool };

};

const token1 = async () => {

    return { token1 };
}
const token2 = async () => {

    return { token2 };

}



const TokenRandDistribute = async () => {}

module.exports = {
    balancerPool,
    token1,
    token2,
    activeAddresses,
    defaultAddr,

};
