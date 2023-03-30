import axios from 'axios';
import header from './HeaderType';

/* 
您可以如下声明一个通用的调用函数来查看每个NFT的Sale合约地址。
-调用销售信息查询API，返回存储在DB中的值。
-参数 id 接收 tokenID 信息，结果输出销售数据。
-在从销售数据返回的信息中使用 sale_contract_address。
*/
export default async function getByTokenId(id) {
  try {
    return await axios
      .get('/sales?token_id=' + id, {
        headers: {
          header
        }
      })
      .catch((err) => {
        throw err;
      });
  } catch (e) {
    console.log(e);
  }
}
