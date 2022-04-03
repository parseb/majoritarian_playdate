const { expect } = require('chai');
const { ethers } = require('hardhat');
const BigNumber = require('bignumber.js');
const { AddressZero, MaxUint256 } = ethers.constants;
const { toWei, fromWei } = web3.utils;
const helpers = require('./helpers/setup');


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

    let randAddress1 = ethers.Wallet.createRandom().address;
    let randAddress2 = ethers.Wallet.createRandom().address;
    let randAddress3 = ethers.Wallet.createRandom().address;

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

            expect(owner1 === owner2).to.be.true;
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
        
        // it("renounces ownership of Majoritarian", async function() {
        //     const renounced = await M.renounceOwnership();
        //     const owner = await M.owner();
        //     const isZero = owner === AddressZero;
        //     expect(isZero).to.be.true;
        // });

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
            tx = await pool.connect(listAccounts[i]).joinPool(String( i * (10**17)), [String( i * (10 **18) ),String( i * (10 **18) )]);
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

    it("checks that address state does not flip on minority increment", async function() {
        
        expect(await M.isOwner(randAddress1)).to.be.false; 
        await M.connect(a2).vote(randAddress1);
        votes1 = String(await M.getVotesOf(randAddress1));
        expect(votes1).to.be.equal(await pool.balanceOf(a2.address));
        expect(await M.isMajority(randAddress1)).to.be.false;
        expect(await M.isOwner(randAddress1)).to.be.false; 

        await M.connect(a3).vote(randAddress1);
        votes2 = String(await M.getVotesOf(randAddress1));
        expect(await M.isMajority(randAddress1)).to.be.false;
        expect(await M.isOwner(randAddress1)).to.be.false;
        expect(votes2).to.be.equal(String((parseInt( await pool.balanceOf(a2.address))) +  parseInt(await pool.balanceOf(a3.address)) ));
        
        await M.connect(a10).vote(randAddress1);
        await M.connect(a9).vote(randAddress1);
        x = await M.connect(a8).vote(randAddress1);
        isMajority = await M.isMajority(randAddress1);
        z = await x.wait();
        expect(await M.isMajority(randAddress1)).to.be.false;
        expect(await M.connect(a3).isOwner(randAddress1)).to.be.true;
    });

    it("checks owner role is flipped on and off by same majority", async function() {
        expect(await M.isOwner(randAddress2)).to.be.false; 
        await M.connect(a2).vote(randAddress2);
        votes1 = String(await M.getVotesOf(randAddress2));
        expect(votes1).to.be.equal(await pool.balanceOf(a2.address));
        expect(await M.isMajority(randAddress2)).to.be.false;
        expect(await M.isOwner(randAddress2)).to.be.false; 
        
        await M.connect(a3).vote(randAddress2);
        votes2 = String(await M.getVotesOf(randAddress2));
        expect(await M.isMajority(randAddress2)).to.be.false;
        expect(await M.isOwner(randAddress2)).to.be.false;
        expect(votes2).to.be.equal(String((parseInt( await pool.balanceOf(a2.address))) +  parseInt(await pool.balanceOf(a3.address)) ));
        
        await M.connect(a10).vote(randAddress2);
        await M.connect(a9).vote(randAddress2);
        x = await M.connect(a8).vote(randAddress2);
        await hre.network.provider.send("hardhat_mine", ["0x100"]);
        isMajority = await M.isMajority(randAddress2);
        z = await x.wait();
        expect(await M.isMajority(randAddress2)).to.be.false;
        expect(await M.connect(a3).isOwner(randAddress2)).to.be.true;

        await M.connect(a2).vote(randAddress2);
        await M.connect(a3).vote(randAddress2);
        await M.connect(a10).vote(randAddress2);
        await M.connect(a9).vote(randAddress2);
        await M.connect(a8).vote(randAddress2);
        expect(await M.connect(a3).isOwner(randAddress2)).to.be.false;

    });

    it("cannot double vote", async function() {

        expect(await M.connect(a3).isOwner(randAddress3)).to.be.false; // not Owner
        await M.connect(a2).vote(randAddress3);
        await M.connect(a3).vote(randAddress3);
        await M.connect(a10).vote(randAddress3);
        await expect( M.connect(a2).vote(randAddress3)).to.be.revertedWith("Voted. Cannot Actualize");
        expect(await M.connect(a3).isOwner(randAddress3)).to.be.false;
        await M.connect(a9).vote(randAddress3);
        await M.connect(a8).vote(randAddress3);
        expect(await M.connect(a3).isOwner(randAddress3)).to.be.true; // Owner
        ///
        await M.connect(a2).vote(randAddress3);
        await M.connect(a3).vote(randAddress3);
        await M.connect(a10).vote(randAddress3);
        await expect( M.connect(a2).vote(randAddress3)).to.be.revertedWith("Voted. Cannot Actualize");
        expect(await M.connect(a3).isOwner(randAddress3)).to.be.true;
        await M.connect(a9).vote(randAddress3);
        await M.connect(a8).vote(randAddress3);
        expect(await M.connect(a3).isOwner(randAddress3)).to.be.false; // not Owner
        ///
        await M.connect(a2).vote(randAddress3);
        await M.connect(a3).vote(randAddress3);
        await M.connect(a10).vote(randAddress3);
        await expect( M.connect(a2).vote(randAddress3)).to.be.revertedWith("Voted. Cannot Actualize");
        expect(await M.connect(a3).isOwner(randAddress3)).to.be.false;
        await M.connect(a9).vote(randAddress3);
        await M.connect(a8).vote(randAddress3);
        expect(await M.connect(a3).isOwner(randAddress3)).to.be.true; // Owner

    });
});


});