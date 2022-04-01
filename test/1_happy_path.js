const { expect } = require('chai');
const { ethers } = require('hardhat');

const BigNumber = require('bignumber.js');
const { toWei, fromWei } = web3.utils;
const { AddressZero, MaxUint256 } = ethers.constants;

const helpers = require('./helpers/setup');
const { AddressOne } = require('@gnosis.pm/safe-contracts');


describe("a happy path starts here", function() {

    let M; // Majoritarian
    let t1; // Token1
    let t2; // Token2
    let pool; // Balancer Pool
    let accounts; // Accounts list
    let defaultA; // Default account

    let a1; //staker1
    let a2;
    let a3;
    let a4;
    let a5;
    let a6;
    let a7;
    let a8;
    let a9;
    let a10;

    let member1; //multisig owner
    let member2;
    let member3;
    let member4;
    let member5;

    before( async function() {
        t1 = await helpers.token1();
        t2 = await helpers.token2();
        pool = await helpers.balancerPool();
        accounts = await helpers.activeAddresses();
        defaultA = await helpers.defaultAddr();

        //signers = await ethers.getSigners();
        [ skip, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10 ] = await ethers.getSigners();

        [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10].forEach(async (i) => {
            await t1.connect(i).approve(pool.address, MaxUint256);
            await t2.connect(i).approve(pool.address, MaxUint256);
        });
        
        const MajoritarianContract = await ethers.getContractFactory("Majoritarian");
        M = await MajoritarianContract.deploy(pool.address, t1.address, t2.address);

        for (let i = 1; i < accounts.length; i++) {
            await t1.mint(accounts[i], toWei(String(i), 'ether'));
            await t2.mint(accounts[i], toWei(String(i), 'ether'));
        }
    });



    describe("components are present",  function() {
        it("gets the default address", async function() {
            const defaultAddr = await helpers.defaultAddr();
            const defaultSigner = await helpers.activeAddresses();
            expect(defaultAddr).to.equal(defaultSigner[0]);
        });
        
        it("gets the token1", async function() {
            const token1 = await helpers.token1();
            expect(token1).to.be.an.instanceOf(ethers.Contract);
        });
        
        it("gets the token2", async function() {
            const token2 = await helpers.token2();
            expect(token2).to.be.an.instanceOf(ethers.Contract);
        });    
    
        it("Default address is owner", async function () {
            owner1 = await t1.owner();
            owner2 = await t2.owner();
            owner3 = await M.owner();
    
            compare = owner1 === owner2 && owner3 === defaultA && owner1 === owner3;
            expect(compare).to.be.true;
        });
    });

    describe("finalizes balancer pool", function() { 
        it("initializes Majoritarian contract", async function() {
            await pool.setController(M.address);
            await t1.mint(M.address, '100000000000000000000');
            await t2.mint(M.address, '100000000000000000000');
            await M.initBPool();
            const isFinalized = await pool.isFinalized();
            
            expect(isFinalized).to.be.true; 
          });
        
        it("renounces ownership of Majoritarian", async function() {
            const renounced = await M.renounceOwnership();
            const owner = await M.owner();
            const isZero = owner === AddressZero;
            expect(isZero).to.be.true;
        });

        it("checks that all users have 0 pool balance", async function() {

            let b1 = await pool.balanceOf(a1.address);
            let b2 = await pool.balanceOf(a2.address);
            let b3 = await pool.balanceOf(a3.address);
            let b4 = await pool.balanceOf(a4.address);
            let b5 = await pool.balanceOf(a5.address);
            let b6 = await pool.balanceOf(a6.address);
            let b7 = await pool.balanceOf(a7.address);
            let b8 = await pool.balanceOf(a8.address);
            let b9 = await pool.balanceOf(a9.address);
            let b10 = await pool.balanceOf(a10.address);

            expect([b1, b2, b3, b4, b5, b6, b7, b8, b9, b10].map(s => s.toNumber() )).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
});
describe("safe membership is dependent on majorarian dynamic",  function() { 
    it("deposits funds in pool", async function() {
        listAccounts =  [skip, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10] =  await ethers.getSigners();

        for ( let i = 10; i >=1 ;i--) {
            totalSupply = await pool.totalSupply();

            //pool.connect(listAccounts[i]);
            // await pool.deposit(toWei(listAccounts.indexOf(i), 'ether'), {from: i});
            tx = await pool.connect(listAccounts[i]).joinPool(String( i * (10**17)), [String( i * (10 **18) ),String( i * (10 **18) )]);
            // console.log("total supply of pool--- ZZZZZ ----", String(totalSupply), "--tS -|", i, " -- balanceof i --", String(await pool.balanceOf(listAccounts[i].address)) ," -- ","|- balance of addr0-- ", String( await pool.balanceOf(M.address))," - diff- ", String( totalSupply - ( await pool.balanceOf(M.address))));
        }
    });

    it("checks that balancer pool token distribution is incremental", async function() {
        b1 = await pool.balanceOf(a1.address);
        b2 = await pool.balanceOf(a2.address);
        b3 = await pool.balanceOf(a3.address);
        b4 = await pool.balanceOf(a4.address);
        b5 = await pool.balanceOf(a5.address);
        b6 = await pool.balanceOf(a6.address);
        b7 = await pool.balanceOf(a7.address);
        b8 = await pool.balanceOf(a8.address);
        b9 = await pool.balanceOf(a9.address);
        b10 = await pool.balanceOf(a10.address);

        balances = [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10];
        balances.forEach(async (x) => {
        expect(parseInt(b3)).to.be.equal(parseInt(b1) + parseInt(b2));
            
        });
        for(b =2; b < balances.length; b++){
            expect(parseInt(balances[b])).to.be.equal(parseInt(balances[b-1]) + parseInt(balances[0]));
        }
    })

});


});