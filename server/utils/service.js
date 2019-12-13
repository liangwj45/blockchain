const {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  getPrivateKey,
  sendRawTransactionUsingCustomCredentials
} = require("./utils");

const sendTransaction = async (publicKey, privateKey, func, params) => {
  try {
    const ret = await sendRawTransactionUsingCustomCredentials(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      publicKey,
      getPrivateKey(privateKey),
      func,
      params
    );
    return ret;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendTransaction };
