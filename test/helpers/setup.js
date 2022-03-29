

// // Balancer imports
// const ConfigurableRightsPool = artifacts.require('ConfigurableRightsPool');
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');




// const { smock } = require('@defi-wonderland/smock');

const balancerPool = async () => {
    // deploy balancer infrastructure
    const bfactory = await BFactory.new();
    const bpool = await bfactory.newBPool();

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
    token2
};
