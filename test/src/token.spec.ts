import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use } from "chai";
import { Contract, BigNumber, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import hre, { ethers } from "hardhat";
import { UniswapV2Pair__factory } from "../../typechain";

describe("Asad Factory", function async() {
  let signers: Signer[];

  let factoryContract: Contract;
  let token20: Contract;
  let token2: Contract;
  let weth: Contract;
  let pair: Contract;
  let router: Contract;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  let UniswapV2Factory: any;
  let UniswapV2Router02: any;
  let WETH9: any;
  let ERC20: any;
  let UniswapV2Pair: any;

  before(async () => {
    [owner, user, user2, user3] = await ethers.getSigners();

    hre.tracer.nameTags[owner.address] = "ADMIN";
    hre.tracer.nameTags[user.address] = "USER1";
    hre.tracer.nameTags[user2.address] = "USER2";
    UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    factoryContract = await UniswapV2Factory.deploy(owner.address);

    WETH9 = await ethers.getContractFactory("WETH9");
    weth = await WETH9.deploy();

    UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
    router = await UniswapV2Router02.deploy(factoryContract.address, weth.address);

    ERC20 = await ethers.getContractFactory("ERC20");
    token20 = await ERC20.deploy(parseEther("100"));
    token2 = await ERC20.deploy(parseEther("100"));
  });

  it("Create Pair", async function () {
    await factoryContract.createPair(token20.address, token2.address);
  });

  it("Add addLiquidity", async function () {
    expect(await router.factory()).to.be.equal(factoryContract.address);
    expect(await router.WETH()).to.be.equal(weth.address);

    var amount0 = parseEther("10");
    var amount1 = parseEther("10");

    await token20.approve(router.address, amount0);
    await token2.approve(router.address, amount1);

    var getPairAddress = await factoryContract.getPair(token20.address, token2.address);

    console.log("Pair", getPairAddress);
    console.log("Hash", await factoryContract.INIT_CODE_PAIR_HASH());

    await router.addLiquidity(token20.address, token2.address, amount0, amount1, 0, 0, owner.address, 1660876756);
  });

  it("Remove removeLiquidity", async function () {
    var getPairAddress = await factoryContract.getPair(token20.address, token2.address);

    console.log("get pair", getPairAddress);

    pair = UniswapV2Pair__factory.connect(getPairAddress, owner);

    console.log(pair.functions);

    console.log(await pair.totalSupply());

    await pair.approve(router.address, parseEther("10"));

    await router.removeLiquidity(token20.address, token2.address, parseEther("9.99"), 0, 0, owner.address, 1660876756);

    console.log(await pair.totalSupply());
  });


  it("Add addLiquidity With Eth", async function () {
    expect(await router.factory()).to.be.equal(factoryContract.address);
    expect(await router.WETH()).to.be.equal(weth.address);

    var amount0 = parseEther("10");
    var amount1 = parseEther("10");

    await token20.approve(router.address, amount0);

    await router.addLiquidityETH(token20.address, amount0,0 ,10, owner.address, 1660876756,({ value: parseEther("10") }));
  });


  it("Remove removeLiquidity With Eth", async function () {
    // var getPairAddress = await factoryContract.getPair(token20.address,token2.address);

    console.log("get pair", await factoryContract.allPairs(1));


    var ethPair = UniswapV2Pair__factory.connect(await factoryContract.allPairs(1), owner)


    // console.log("get pair", getPairAddress);

    // pair = UniswapV2Pair__factory.connect(getPairAddress, owner);

    console.log(ethPair.functions);

    // console.log(await pair.totalSupply());

    await ethPair.approve(router.address, parseEther("10"));

    await router.removeLiquidityETH(token20.address, parseEther("9.99"),0 ,10, owner.address, 1660876756);

    console.log(await ethPair.totalSupply());
  });


});
