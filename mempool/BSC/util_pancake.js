require("dotenv").config();
const ethers = require("ethers");
const ERC20 = require("../../contracts/erc20");

const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_HTTP, 56);

const addLiquidityETH = "0xf305d719";
const addLiquidity = "0xe8e33700";

// busd, wbnb
const busd = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const wbnb = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

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
      if (amount >= 60) {
        //60
        return {
          chain: 56,
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

      let isBusdPair = checkBusdPair(tokenA, tokenB);
      if (isBusdPair > 0) {
        let amount = isBusdPair == 1 ? amountADesired : amountBDesired;
        if (amount >= 40000)
          //40000
          return {
            chain: 56,
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
      let isWbnbPair = checkWbnbPair(tokenA, tokenB);
      if (isWbnbPair > 0) {
        let amount = isWbnbPair == 1 ? amountADesired : amountBDesired;
        if (amount > 60)
          //60
          return {
            chain: 56,
            hash,
            tokenA,
            nameA: tokenAInfo.name,
            symbolA: tokenAInfo.symbol,
            tokenB,
            nameB: tokenBInfo.name,
            symbolB: tokenBInfo.symbol,
            amount,
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
