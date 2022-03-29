const { expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require('./helpers/setup');

describe("Majoritarian has default owner", function () {
  it("Should return owner address", async function () {
    const Majoritarian = await ethers.getContractFactory("Majoritarian");
    const majo = await Majoritarian.deploy(ethers.constants.AddressZero); //bal pool address , token1 address , token2 address
    const ownerFirst = await majo.owner();
    expect(ownerFirst).to.equal(await helpers.defaultAddr());


  });
});
