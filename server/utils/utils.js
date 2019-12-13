const { Web3jService } = require("./packages/api");
const { Configuration } = require("./packages/api/common/configuration");
const utils = require("./packages/api/common/utils");
const web3Utils = require("./packages/api/common/web3lib/utils");
const PEM = require("pem-file");

const fs = require("fs");
const path = require("path");

// 设置 FISCO-BCOS 相关证书。
Configuration.setConfig(path.join(__dirname, "./config/config.json"));
// 创建 Web3j 服务。
const web3jService = new Web3jService();

// 智能合约部署地址。
const CONTRACT_ADDRESS = "0x2fc2d00121fa4210948fbefa913e4de5a8c54797";
// 智能合约 ABI 定义。
const CONTRACT_ABI = [
  {
    constant: true,
    inputs: [],
    name: "getAsset",
    outputs: [{ name: "asset", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "addAsset",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getDebtorReceipts",
    outputs: [
      { name: "debtor", type: "string" },
      { name: "creditors", type: "string" },
      { name: "amounts", type: "uint256[]" },
      { name: "deadlines", type: "uint256[]" }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getCreditorReceipts",
    outputs: [
      { name: "creditor", type: "string" },
      { name: "debtors", type: "string" },
      { name: "amounts", type: "uint256[]" },
      { name: "deadlines", type: "uint256[]" }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "creditor", type: "address" }],
    name: "payback",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "bank", type: "address" },
      { name: "debtor", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
    name: "finance",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "creditor", type: "address" },
      { name: "debtor", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "transfer",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "debtor", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
    name: "signature",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "creditor", type: "address" },
      { indexed: false, name: "debtor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "deadline", type: "uint256" }
    ],
    name: "SignatureEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: false, name: "creditor", type: "address" },
      { indexed: false, name: "debtor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "TransferEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: false, name: "bank", type: "address" },
      { indexed: false, name: "debtor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "deadline", type: "uint256" }
    ],
    name: "FinanceEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "creditor", type: "address" },
      { indexed: false, name: "debtor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "PaybackEvent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "AddAssetEvent",
    type: "event"
  }
];

// 前缀：-----BEGIN EC PRIVATE KEY-----。
const EC_PRIVATE_KEY_PREFIX = "30740201010420";
// 前缀：-----BEGIN PRIVATE KEY-----
const PRIVATE_KEY_PREFIX =
  "308184020100301006072a8648ce3d020106052b8104000a046d306b0201010420";

/**
 * 从 PEM 证书中解析出私钥字符串内容。
 * @param pem 证书
 */
function decodePem(pem) {
  let privateKey = "";
  if (pem.startsWith(EC_PRIVATE_KEY_PREFIX)) {
    // -----BEGIN EC PRIVATE KEY-----
    privateKey = pem.substring(
      EC_PRIVATE_KEY_PREFIX.length,
      EC_PRIVATE_KEY_PREFIX.length + 64
    );
  } else if (pem.startsWith(PRIVATE_KEY_PREFIX)) {
    // -----BEGIN PRIVATE KEY-----
    privateKey = pem.substring(
      PRIVATE_KEY_PREFIX.length,
      PRIVATE_KEY_PREFIX.length + 64
    );
  } else {
    throw new Error("expected `EC PRIVATE KEY` or `PRIVATE KEY`");
  }
  return privateKey;
}

/**
 * 根据 PEM 文本内容计算私钥。
 * @param raw PEM 文件文本内容
 */
function getPrivateKey(raw) {
  const encodedPem = Buffer.from(raw);
  const decodedPem = PEM.decode(encodedPem).toString("hex");
  return decodePem(decodedPem);
}

/**
 * 根据私钥生成公钥地址。
 * @param privateKey 私钥
 */
function privateKeyToPublicKey(privateKey) {
  return `0x${web3Utils.privateKeyToAddress(privateKey).toString("hex")}`;
}

/**
 * 根据传入的公钥和私钥构建和发起智能合约交易。
 * @param address 合约部署地址
 * @param abi 合约 ABI 说明
 * @param publicKey 发送方公钥
 * @param privateKey 发送方私钥
 * @param func 函数名称
 * @param params 函数参数
 */
function sendRawTransactionUsingCustomCredentials(
  address,
  abi,
  publicKey,
  privateKey,
  func,
  params
) {
  let item;
  // 函数签名。
  let funcSignature = "";

  for (const iter of abi) {
    if (iter.name === func && iter.type === "function") {
      if (iter.inputs.length !== params.length) {
        throw new Error("wrong number of parameters for function");
      }
      item = iter;
      funcSignature = utils.spliceFunctionSignature(iter);
      break;
    }
  }

  return new Promise((resolve, reject) => {
    web3jService
      .sendRawTransactionUsingCustomCredentials(
        publicKey,
        privateKey,
        address,
        funcSignature,
        params
      )
      .then(result => {
        const transactionHash = result.transactionHash;
        const status = result.status;
        const output = result.output;
        const ret = {
          transactionHash,
          status,
          output: ""
        };
        if (output !== "0x") {
          ret.output = utils.decodeMethod(item, output);
        }
        resolve(ret);
      })
      .catch(reject);
  });
}

module.exports = {
  sendRawTransactionUsingCustomCredentials,
  privateKeyToPublicKey,
  getPrivateKey,
  CONTRACT_ABI,
  CONTRACT_ADDRESS
};
