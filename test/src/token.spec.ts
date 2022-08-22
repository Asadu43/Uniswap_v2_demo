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
    console.log("Hash", await factoryContract.INIT_CODE_PAIR_HASH());
   
    await expect( router.addLiquidity(token20.address, token20.address, amount0, amount1, 0, 0, owner.address, 1661214721)).to.be.revertedWith("UniswapV2: IDENTICAL_ADDRESSES")

    await expect( router.addLiquidity(token20.address, factoryContract.address, amount0, amount1, 0, 0, owner.address, 1661214721)).to.be.revertedWith("TransferHelper::transferFrom: transferFrom failed")

    await expect( router.addLiquidity("0x0000000000000000000000000000000000000000", factoryContract.address, amount0, amount1, 0, 0, owner.address, 1661214721)).to.be.revertedWith("UniswapV2: ZERO_ADDRESS")
   
   
    await expect( router.addLiquidity(token20.address, token2.address, 0, amount1, 0, 0, owner.address, 1661214721)).to.be.revertedWith("ds-math-sub-underflow")
   
   
    await expect( router.addLiquidity(token20.address, token2.address, 0, 0, 1000, 1000, owner.address, 1661214721)).to.be.revertedWith("ds-math-sub-underflow")

    await expect( router.addLiquidity(token20.address, token2.address, amount0, amount1, 0, 0, owner.address, 166103392)).to.be.revertedWith("UniswapV2Router: EXPIRED")

   await router.addLiquidity(token20.address, token2.address, amount0, amount1, 0, 0, owner.address, 1661214721);
  });

  it("Remove removeLiquidity", async function () {
    var getPairAddress = await factoryContract.getPair(token20.address, token2.address);

    console.log("get pair", getPairAddress);

    pair = UniswapV2Pair__factory.connect(getPairAddress, owner);



    await expect(router.removeLiquidity(token20.address, token2.address, parseEther("9.99"), 0, 0, owner.address, 1661214721)).to.be.revertedWith("ds-math-sub-underflow");
    
    await expect(router.removeLiquidity(token20.address, token20.address, parseEther("9.99"), 0, 0, owner.address, 1661214721)).to.be.revertedWith("UniswapV2Library: IDENTICAL_ADDRESSES");

    await expect(router.removeLiquidity(token20.address, factoryContract.address, parseEther("9.99"), 0, 0, owner.address, 1661214721)).to.be.reverted;

    await expect(router.removeLiquidity(token20.address, token2.address, parseEther("9.99"), 100, 100, owner.address, 1661214721)).to.be.revertedWith("ds-math-sub-underflow");
    
    await expect(router.removeLiquidity(token20.address, token2.address, parseEther("9.99"), 100, 100, owner.address, 166104392)).to.be.revertedWith("UniswapV2Router: EXPIRED");

    await pair.approve(router.address, parseEther("10"));

    await router.removeLiquidity(token20.address, token2.address, parseEther("9.99"), 0, 0, owner.address, 1661214721);

    console.log(await pair.totalSupply());
  });


  it("Add addLiquidity With Eth", async function () {
    expect(await router.factory()).to.be.equal(factoryContract.address);
    expect(await router.WETH()).to.be.equal(weth.address);

    var amount0 = parseEther("10");
    

    await expect(router.addLiquidityETH(token20.address, amount0,0 ,10, owner.address, 1661214721,({ value: parseEther("10") }))).to.be.revertedWith("TransferHelper::transferFrom: transferFrom failed");
    
    await token20.approve(router.address, amount0);

    await expect(router.addLiquidityETH(token20.address, 0,0 ,10, owner.address, 1661214721,({ value: parseEther("10") }))).to.be.revertedWith("ds-math-sub-underflow");

    await expect(router.addLiquidityETH(token20.address, 0,0 ,10, owner.address, 1661214721)).to.be.revertedWith("ds-math-sub-underflow");

    await expect(router.addLiquidityETH(token20.address, amount0,0 ,10, owner.address, 166104392,({ value: parseEther("10") }))).to.be.revertedWith("UniswapV2Router: EXPIRED");

    await router.addLiquidityETH(token20.address, amount0,0 ,10, owner.address, 1661214721,({ value: parseEther("10") }))

  
  });



  it("SwapEthFor Tokens",async () => {
    await expect(router.swapETHForExactTokens(parseEther("1"),[weth.address,token20.address],user.address,1661214721,({value:parseEther("1")}))).to.be.revertedWith("UniswapV2Router: EXCESSIVE_INPUT_AMOUNT")

    await expect(router.swapETHForExactTokens(parseEther("1"),[token20.address,token20.address],user.address,1661214721,({value:parseEther("2")}))).to.be.revertedWith("UniswapV2Router: INVALID_PATH")

    await expect(router.swapETHForExactTokens(parseEther("1"),[token20.address,weth.address],user.address,1661214721,({value:parseEther("2")}))).to.be.revertedWith("UniswapV2Router: INVALID_PATH")

    await expect(router.swapETHForExactTokens(parseEther("1"),[weth.address,token20.address],user.address,166104392,({value:parseEther("2")}))).to.be.revertedWith("UniswapV2Router: EXPIRED")

    await router.swapETHForExactTokens(parseEther("0.1"),[weth.address,token20.address],user.address,1661214721,({value:parseEther("1")}))
    
    await router.swapExactETHForTokens(parseEther("0.1"),[weth.address,token20.address],user.address,1661214721,({value:parseEther("1")}))
    
  })

  it("swapExactTokensForETH",async () => {

    await expect(router.swapExactTokensForETH(parseEther("1"),parseEther("2"),[token20.address,weth.address],user.address,1661214721)).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT")

    await expect(router.swapExactTokensForETH(parseEther("2"),parseEther("0.5"),[token20.address,token20.address],user.address,1661214721)).to.be.revertedWith("UniswapV2Router: INVALID_PATH")

    await expect(router.swapExactTokensForETH(parseEther("2"),parseEther("0.5"),[weth.address,token20.address],user.address,1661214721)).to.be.revertedWith("UniswapV2Router: INVALID_PATH")

    await expect(router.swapExactTokensForETH(parseEther("2"),parseEther("0.5"),[token20.address,weth.address],user.address,166121721)).to.be.revertedWith("UniswapV2Router: EXPIRED")
    
    var amount0 = parseEther("10"); 

    await token20.approve(router.address, amount0);
    await router.swapExactTokensForETH(parseEther("2"),parseEther("1"),[token20.address,weth.address],user.address,1661214721)

    
  })





  it("swapExactTokensForTokens",async () => {
    await expect(router.swapExactTokensForTokens(parseEther("1"),parseEther("2"),[token20.address,weth.address],user.address,1661214721)).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT")

    await expect(router.swapExactTokensForTokens(parseEther("2"),parseEther("0.5"),[token20.address,token20.address],user.address,1661214721)).to.be.revertedWith("UniswapV2Library: IDENTICAL_ADDRESSES")

    await expect(router.swapExactTokensForTokens(parseEther("2"),parseEther("0.5"),[weth.address,token20.address],user.address,1661214721)).to.be.revertedWith("TransferHelper::transferFrom: transferFrom failed")

    await expect(router.swapExactTokensForTokens(parseEther("2"),parseEther("0.5"),[token20.address,weth.address],user.address,166124721)).to.be.revertedWith("UniswapV2Router: EXPIRED")
    
    var amount0 = parseEther("10"); 

    await token20.approve(router.address, amount0);

    await router.swapExactTokensForTokens(parseEther("2"),parseEther("0.5"),[token20.address,weth.address],user.address,1661214721)

    await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(parseEther("2"),parseEther("0.5"),[token20.address,weth.address],user.address,1661214721)


    await router.swapTokensForExactTokens(parseEther("0.3"),parseEther("1"),[token20.address,weth.address],user.address,1661214721)

    
  })



  it("Remove removeLiquidity With Eth && removeLiquidityETHSupportingFeeOnTransferTokens ", async function () {

    console.log("get pair", await factoryContract.allPairs(1));


    var ethPair = UniswapV2Pair__factory.connect(await factoryContract.allPairs(1), owner)


    console.log(await ethPair.totalSupply());

    await ethPair.approve(router.address, parseEther("10"));

    var amount0 = parseEther("10"); 

    await token20.approve(router.address, amount0);



    await router.removeLiquidityETH(token20.address, parseEther("3"),0 ,10, owner.address, 1661214721);
    await router.removeLiquidityETHSupportingFeeOnTransferTokens(token20.address, parseEther("2"),0 ,10, owner.address, 1661214721);

    console.log(await ethPair.totalSupply());


    console.log(router.functions)
  });


});
