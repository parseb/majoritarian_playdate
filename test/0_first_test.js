const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Majoritarian", function () {
  it("Should return owner address", async function () {
    const Majoritarian = await ethers.getContractFactory("Majoritarian");
    const majo = await Majoritarian.deploy();
    await majo.deployed();

    const deployedFromAddress = await ethers.getSigners();
    const ownerFirst = await majo.owner();
    console.log({deployedFromAddress, ownerFirst });
    expect(ownerFirst).to.equal(deployedFromAddress[0].address);

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
