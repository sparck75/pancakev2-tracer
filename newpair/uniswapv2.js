require("dotenv").config();
const ethers = require("ethers");
const UNIV2_FACTORY = require("../contracts/uni_v2_factory");
const ERC20 = require("../contracts/erc20");

/*
bsc config vars
*/

const ETH_INFURA = {
  url: "https://mainnet.infura.io/v3/ac065238b51445369784061a7e264935",
  chainID: 1,
};
const provider = new ethers.providers.JsonRpcProvider(
  ETH_INFURA.url,
  ETH_INFURA.chainID
);

/*
load pancake factory contract
*/
const factorySC = new ethers.Contract(
  UNIV2_FACTORY.ADDRESS,
  UNIV2_FACTORY.ABI,
  provider
);

const getTokenInfo = async (address, pair) => {
  const contract = new ethers.Contract(address, ERC20.ABI, provider);
  let name = await contract.name();
  let totalSupply = await contract.totalSupply();
  let decimals = await contract.decimals();
  totalSupply = totalSupply.div((10 ** decimals).toString());
  totalSupply = parseFloat(totalSupply.toString());
  let pairBalance = await contract.balanceOf(pair);
  pairBalance = ethers.utils.formatEther(pairBalance.toString());
  pairBalance = parseFloat(pairBalance.toString());
  return {
    name,
    totalSupply,
    decimals,
    pairBalance,
  };
};

const listenFactorySC = async () => {
  console.log("started listening univ2 factory");
  factorySC.on("PairCreated", async (token0, token1, pair, _) => {
    try {
      let token0Info = await getTokenInfo(token0, pair);
      let token1Info = await getTokenInfo(token1, pair);
      console.log(
        "#####################  New Pair on UniV2  ##########################"
      );
      console.log(`pair address is   ${pair}`);
      console.log(
        `${token0}  --  ${token0Info.name} -- ${token0Info.totalSupply}  --  ${token0Info.decimals}  -- ${token0Info.pairBalance}`
      );
      console.log();
      console.log(
        `${token1}  --  ${token1Info.name} -- ${token1Info.totalSupply}  --  ${token1Info.decimals}  -- ${token1Info.pairBalance}`
      );
      console.log();
      console.log();
    } catch (error) {
      console.log(
        "#####################  New Pair on UniV2 -- Error  ##########################"
      );
      console.log(`${token0} --  ${token1} -- ${pair}`);
    }
  });
};

listenFactorySC();
