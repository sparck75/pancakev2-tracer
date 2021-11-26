require("dotenv").config();
const ethers = require("ethers");
const ERC20 = require("../../contracts/erc20");

const provider = new ethers.providers.JsonRpcProvider(
  process.env.OPERA_HTTP,
  250
);

const addLiquidityETH = "0xf305d719";
const addLiquidity = "0xe8e33700";

// usdc, wftm
const busd = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
const wbnb = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

const loadContract = async (token) => {
  return new ethers.Contract(token, ERC20.ABI, provider);
};

const isLegitToken = (name, symbol) => {
  let isName = /^[a-zA-Z]+$/.test(name);
  let isSymbol = /^[a-zA-Z]+$/.test(symbol);
  return isName && isSymbol;
};

const getTokenInfo = async (token) => {
  let tokenContract = await loadContract(token);
  let name = await tokenContract.name();
  let symbol = await tokenContract.symbol();
  if (isLegitToken(name, symbol)) return { name, symbol };
  else return false;
};

const parseToDigit = (bn) => {
  let value = ethers.utils.formatEther(bn.toString());
  value = parseFloat(value.toString());
  return value;
};

const checkBusdPair = (tokenA, tokenB) => {
  if (tokenA == busd) return 1;
  if (tokenB == busd) return 2;
  return 0;
};

const checkWbnbPair = (tokenA, tokenB) => {
  if (tokenA == wbnb) return 1;
  if (tokenB == wbnb) return 2;
  return 0;
};

const parseTx = async (tx) => {
  const { hash, input, value, gasPrice, from } = tx;
  const method = input.substring(0, 10);
  //   addLiquidityETH
  if (method == addLiquidityETH) {
    let token = "0x" + input.substring(34, 74);
    let tokenInfo = await getTokenInfo(token);
    if (!tokenInfo) return 0;
    let amountETHMin = parseToDigit(
      ethers.BigNumber.from("0x" + input.substring(202, 266))
    );
    if (amountETHMin >= 2000) {
      return {
        chain: 250,
        hash,
        token,
        amountETHMin,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        tokenType: "bnb",
      };
    } else return 0;
  } else if (method == addLiquidity) {
    let tokenA = "0x" + input.substring(34, 74);
    let tokenAInfo = await getTokenInfo(tokenA);
    if (!tokenAInfo) return 0;
    let tokenB = "0x" + input.substring(74, 138).substring(24);
    let tokenBInfo = await getTokenInfo(tokenB);
    if (!tokenBInfo) return 0;
    let amountADesired = parseToDigit(
      ethers.BigNumber.from("0x" + input.substring(138, 202))
    );
    let amountBDesired = parseToDigit(
      ethers.BigNumber.from("0x" + input.substring(202, 266))
    );

    let isBusdPair = checkBusdPair(tokenA, tokenB);
    if (isBusdPair > 0) {
      let busdAmount = isBusdPair == 1 ? amountADesired : amountBDesired;
      if (busdAmount >= 5000)
        return {
          chain: 250,
          hash,
          tokenA,
          nameA: tokenAInfo.name,
          symbolA: tokenAInfo.symbol,
          tokenB,
          nameB: tokenBInfo.name,
          symbolB: tokenBInfo.symbol,
          busdAmount,
          tokenType: "busd",
        };
      else return 0;
    }
    let isWbnbPair = checkWbnbPair(tokenA, tokenB);
    if (isWbnbPair > 2000) {
      let wBnbAmount = isWbnbPair == 1 ? amountADesired : amountBDesired;
      if (wBnbAmount > 0)
        return {
          chain: 250,
          hash,
          tokenA,
          nameA: tokenAInfo.name,
          symbolA: tokenAInfo.symbol,
          tokenB,
          nameB: tokenBInfo.name,
          symbolB: tokenBInfo.symbol,
          wBnbAmount,
          tokenType: "wbnb",
        };
      else return 0;
    }
    return 0;
  } else return 0;
};

module.exports = parseTx;
