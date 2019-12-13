const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db/db");
const { sendTransaction } = require("./utils/service");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.post("/api/user/login", async (req, res, next) => {
  try {
    const sql = "select username from user where username=? and passwd=?";
    const args = [req.body.username, req.body.passwd];
    const data = await db.query(sql, args);
    res.end(
      JSON.stringify({
        code: data.length > 0 ? 0 : 1,
        username: req.body.username
      })
    );
  } catch (err) {
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.get("/api/publicKey/:username", async (req, res) => {
  try {
    const sql = "select publicKey from publicKey where username=?";
    const args = [req.params.username];
    const rows = await db.query(sql, args);
    const keys = rows.map(x => x.publicKey);
    res.end(JSON.stringify({ code: 0, data: keys }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.post("/api/publicKey/:username", async (req, res) => {
  try {
    const sql = "insert into publicKey (username, publicKey) values (?,?)";
    const args = [req.params.username, req.body.publicKey];
    const ret = await db.query(sql, args);
    res.end(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.post("/api/publicKey/delete/:username", async (req, res) => {
  try {
    const sql = "delete from publicKey where username=? and publicKey=?";
    const args = [req.params.username, req.body.publicKey];
    await db.query(sql, args);
    res.end(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

const getPrivateKey = async pub => {
  try {
    const sql = "select pri from pri_keys where pub=?";
    const args = [pub];
    const data = await db.query(sql, args);
    return data[0].pri;
  } catch (err) {
    console.log(err);
  }
};

app.post("/api/debt", async (req, res) => {
  try {
    const func = "signature";
    const { creditor, debtor, amount, date } = req.body;
    const params = [debtor, amount, date];
    const pri = await getPrivateKey(creditor);
    const ret = await sendTransaction(creditor, pri, func, params);
    if (ret.status != 0) throw "transaction error";
    res.send(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.get("/api/debts/:username", async (req, res) => {
  try {
    const sql = "select publicKey from publicKey where username=?";
    const args = [req.params.username];
    const rows = await db.query(sql, args);
    const keys = rows.map(x => x.publicKey);
    let debtors = [];
    let creditors = [];
    let amounts = [];
    let dates = [];
    for (let pub of keys) {
      const func = "getDebtorReceipts";
      const params = [];
      const pri = await getPrivateKey(pub);
      const ret = await sendTransaction(pub, pri, func, params);
      if (ret.status != 0) throw "transaction error";
      if (ret.output.creditors.length == 0) continue;
      creditors = creditors.concat(
        ret.output.creditors
          .substr(0, ret.output.creditors.length - 1)
          .split(",")
      );
      amounts = amounts.concat(ret.output.amounts.map(x => parseInt(x)));
      dates = dates.concat(ret.output.deadlines.map(x => parseInt(x)));
      for (let i = 0; i < ret.output.amounts.length; i++) {
        debtors.push(pub);
      }
    }
    let data = [];
    for (let i = 0; i < debtors.length; i++) {
      data.push({
        debtor: debtors[i],
        creditor: creditors[i],
        amount: amounts[i],
        date: dates[i]
      });
    }
    res.send(JSON.stringify({ code: 0, data: data }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.get("/api/receipt/:username", async (req, res) => {
  try {
    const sql = "select publicKey from publicKey where username=?";
    const args = [req.params.username];
    const rows = await db.query(sql, args);
    const keys = rows.map(x => x.publicKey);
    let debtors = [];
    let creditors = [];
    let amounts = [];
    let dates = [];
    for (let pub of keys) {
      const func = "getCreditorReceipts";
      const params = [];
      const pri = await getPrivateKey(pub);
      const ret = await sendTransaction(pub, pri, func, params);
      if (ret.status != 0) throw "transaction error";
      if (ret.output.debtors.length == 0) continue;
      debtors = debtors.concat(
        ret.output.debtors.substr(0, ret.output.debtors.length - 1).split(",")
      );
      amounts = amounts.concat(ret.output.amounts.map(x => parseInt(x)));
      dates = dates.concat(ret.output.deadlines.map(x => parseInt(x)));
      for (let i = 0; i < ret.output.amounts.length; i++) {
        creditors.push(pub);
      }
    }
    let data = [];
    for (let i = 0; i < debtors.length; i++) {
      data.push({
        debtor: debtors[i],
        creditor: creditors[i],
        amount: amounts[i],
        date: dates[i]
      });
    }
    res.send(JSON.stringify({ code: 0, data: data }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.post("/api/transfer", async (req, res) => {
  try {
    const { sender, creditor, debtor, amount } = req.body;
    const func = "transfer";
    const params = [creditor, debtor, amount];
    const pri = await getPrivateKey(sender);
    const ret = await sendTransaction(sender, pri, func, params);
    if (ret.status != 0) throw "transaction error";
    res.send(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.post("/api/finance", async (req, res) => {
  try {
    const { creditor, bank, debtor, amount, deadline } = req.body;
    const func = "finance";
    const params = [bank, debtor, amount, deadline];
    const pri = await getPrivateKey(creditor);
    const ret = await sendTransaction(creditor, pri, func, params);
    if (ret.status != 0) throw "transaction error";
    res.send(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.post("/api/payback", async (req, res) => {
  try {
    const { debtor, creditor } = req.body;
    const func = "payback";
    const params = [creditor];
    const pri = await getPrivateKey(debtor);
    const ret = await sendTransaction(debtor, pri, func, params);
    if (ret.status != 0) throw "transaction error";
    res.send(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.post("/api/account", async (req, res) => {
  try {
    const { address, amount } = req.body;
    const func = "addAsset";
    const params = [amount];
    const pri = await getPrivateKey(address);
    const ret = await sendTransaction(address, pri, func, params);
    if (ret.status != 0) throw "transaction error";
    res.send(JSON.stringify({ code: 0 }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.get("/api/account/:username", async (req, res) => {
  try {
    const sql = "select publicKey from publicKey where username=?";
    const args = [req.params.username];
    const rows = await db.query(sql, args);
    const keys = rows.map(x => x.publicKey);
    let data = [];
    for (let pub of keys) {
      const func = "getAsset";
      const params = [];
      const pri = await getPrivateKey(pub);
      const ret = await sendTransaction(pub, pri, func, params);
      if (ret.status != 0) throw "transaction error";
      data.push({ address: pub, amount: parseInt(ret.output.asset) });
    }
    res.send(JSON.stringify({ code: 0, data: data }));
  } catch (err) {
    console.log(err);
    res.end(JSON.stringify({ code: -1, msg: err }));
  }
});

app.listen(8888);
console.log("http://localhost:8888");
