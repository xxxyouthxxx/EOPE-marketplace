/* 
[合约ABI]
-复制并粘贴从已编译的智能合约中获取的 ABI（JSON 格式）。
-NFT_ABI：SSAFY NFT 合约 ABI
-SALE_FACTORY_ABI：销售工厂合同 ABI
-SALE_ABI：销售合约ABI
*/
import SsafyNFT from "../../smart-contracts/build/contracts/SsafyNFT.json";
import SsafyToken from "../../smart-contracts/build/contracts/SsafyToken.json";
import SaleFactory from "../../smart-contracts/build/contracts/SaleFactory.json";
import Sale from "../../smart-contracts/build/contracts/Sale.json";

const ABI = {
  CONTRACT_ABI: {
    NFT_ABI: SsafyNFT.abi,
    SALE_FACTORY_ABI: SaleFactory.abi,
    SALE_ABI: Sale.abi,
    SsafyToken_ABI: SsafyToken.abi,
  },
};

export default ABI;
