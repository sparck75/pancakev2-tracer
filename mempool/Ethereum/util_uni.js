require("dotenv").config();
const ethers = require("ethers");
const ERC20 = require("../../contracts/erc20");

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_HTTP, 1);

const addLiquidityETH = "0xf305d719";
const addLiquidity = "0xe8e33700";

// busd, wbnb
const wEth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";

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

const checkStableCoinPair = (tokenA, tokenB) => {
  if (tokenA == usdt || tokenA == usdc || tokenA == dai) return 1;
  if (tokenB == usdt || tokenB == usdc || tokenB == dai) return 2;
  return 0;
};

const checkwEthPair = (tokenA, tokenB) => {
  if (tokenA == wEth) return 1;
  if (tokenB == wEth) return 2;
  return 0;
};

const parseTx = async (tx) => {
  try {
    const { hash, input, value, gasPrice, from } = tx;
    const method = input.substring(0, 10);
    //   addLiquidityETH
    if (method == addLiquidityETH) {
      let token = "0x" + input.substring(34, 74);
      let tokenInfo = await getTokenInfo(token);
      if (!tokenInfo) return 0;
      let amount = parseToDigit(
        ethers.BigNumber.from("0x" + input.substring(202, 266))
      );
      if (amount >= 10) {
        //10
        return {
          chain: 1,
          hash,
          token,
          amount,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          tokenType: "native",
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

      let isStableCoinPair = checkStableCoinPair(tokenA, tokenB);
      if (isStableCoinPair > 0) {
        let amount = isStableCoinPair == 1 ? amountADesired : amountBDesired;
        if (amount >= 40000)
          //40000
          return {
            chain: 1,
            hash,
            tokenA,
            nameA: tokenAInfo.name,
            symbolA: tokenAInfo.symbol,
            tokenB,
            nameB: tokenBInfo.name,
            symbolB: tokenBInfo.symbol,
            amount,
            tokenType: "stable",
          };
        else return 0;
      }
      let iswEthPair = checkwEthPair(tokenA, tokenB);
      if (iswEthPair > 0) {
        let wEthAmount = iswEthPair == 1 ? amountADesired : amountBDesired;
        if (wEthAmount > 10)
          //10
          return {
            chain: 1,
            hash,
            tokenA,
            nameA: tokenAInfo.name,
            symbolA: tokenAInfo.symbol,
            tokenB,
            nameB: tokenBInfo.name,
            symbolB: tokenBInfo.symbol,
            wEthAmount,
            tokenType: "wrapped",
          };
        else return 0;
      }
      return 0;
    } else return 0;
  } catch (error) {
    console.log("error in parsing the tx");
    console.log(error);
  }
};

module.exports = parseTx;
