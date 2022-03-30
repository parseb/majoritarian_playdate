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

    let a1;
    let a2;
    let a3;
    let a4;
    let a5;
    let a6;
    let a7;
    let a8;
    let a9;
    let a10;

    before( async function() {
        t1 = await helpers.token1();
        t2 = await helpers.token2();
        pool = await helpers.balancerPool();
        accounts = await helpers.activeAddresses();
        defaultA = await helpers.defaultAddr();

        signers = await ethers.getSigners();

        a1 = signers[1];
        a2 = signers[2];
        a3 = signers[3];
        a4 = signers[4];
        a5 = signers[5];
        a6 = signers[6];
        a7 = signers[7];
        a8 = signers[8];
        a9 = signers[9];
        a10 = signers[10];

        for (i in [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10]) {
            t1.connect(i).approve(pool.address, MaxUint256);
            t2.connect(i).approve(pool.address, MaxUint256);
        }
        
        const MajoritarianContract = await ethers.getContractFactory("Majoritarian");
        M = await MajoritarianContract.deploy(pool.address, t1.address, t2.address);

        for (let i = 1; i < accounts.length; i++) {
            t1.transfer(accounts[i], toWei(String(i)));
            t2.transfer(accounts[i], toWei(String(i)));
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
            await t1.mint(M.address, '1000000000');
            await t2.mint(M.address, '1000000000');
            await M.initBPool();
            const isFinalized = await pool.isFinalized();
            
            expect(isFinalized).to.be.true; 
          });
        
        it("renounces ownership of Majoritarian", async function() {
            const renounced = await M.renounceOwnership();
            const owner = await M.owner();
            const isZero = owner === AddressZero;
            console.log("renounced----", renounced);
            expect(isZero).to.be.true;
        });
    });

});










