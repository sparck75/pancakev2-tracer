const ethers = require("ethers");

const addLiquidityETH = "0xf305d719";
const addLiquidity = "0xe8e33700";

const busd = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const wbnb = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

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
    let amountETHMin = parseToDigit(
      ethers.BigNumber.from("0x" + input.substring(202, 266))
    );
    if (amountETHMin >= 60) {
      return {
        hash,
        token,
        amountETHMin,
        tokenType: "bnb",
      };
    } else return 0;
  } else if (method == addLiquidity) {
    let tokenA = "0x" + input.substring(34, 74);
    let tokenB = "0x" + input.substring(74, 138).substring(24);
    let amountADesired = parseToDigit(
      ethers.BigNumber.from("0x" + input.substring(138, 202))
    );
    let amountBDesired = parseToDigit(
      ethers.BigNumber.from("0x" + input.substring(202, 266))
    );

    let isBusdPair = checkBusdPair(tokenA, tokenB);
    if (isBusdPair > 0) {
      let busdAmount = isBusdPair == 1 ? amountADesired : amountBDesired;
      if (busdAmount >= 40000)
        return {
          hash,
          tokenA,
          tokenB,
          busdAmount,
          tokenType: "busd",
        };
      else return 0;
    }
    let isWbnbPair = checkWbnbPair(tokenA, tokenB);
    if (isWbnbPair > 0) {
      let wBnbAmount = isWbnbPair == 1 ? amountADesired : amountBDesired;
      if (wBnbAmount > 60)
        return {
          hash,
          tokenA,
          tokenB,
          wBnbAmount,
          tokenType: "wbnb",
        };
      else return 0;
    }
    return 0;
  } else return 0;
};

module.exports = parseTx;
