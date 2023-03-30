## Guide for Testing Smart Contracts
<br/>

### Prerequisites

```bash
$ npm install -g truffle
$ npm i
```

<br/>

### ```truffle-config.js``` 설정

<br/>
更改以下部分以适合您的测试环境
```js
module.exports = {
  networks: {
     development: {
      host: "127.0.0.1",    
      port: 7545,           
      network_id: "*",    
     },
     ...
  }
}
```

在未指定上述 --network 选项的情况下运行 truffle test 时，“development”被指定为默认值。

```bash
$ truffle test --network <network-name>
```
<br/>

### 基本用法

```bash
$ truffle compile # 合同编制
$ truffle migrate # 部署合约
$ truffle test # 合同测试
```


#### 运行测试代码示例

```bash
$ truffle test ./test/NFTCreateorTest.js
$ truffle test ./test/SaleTest.js
```

<br/>
<br/>
