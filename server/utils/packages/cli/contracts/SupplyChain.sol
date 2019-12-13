pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract SupplyChain {
  event SignatureEvent(address creditor, address debtor, uint256 amount, uint256 deadline); // 1.添加账单
  event TransferEvent(address sender, address creditor, address debtor, uint256 amount); // 2.转让
  event FinanceEvent(address sender, address bank, address debtor, uint256 amount, uint256 deadline); // 3.融资
  event PaybackEvent(address creditor, address debtor, uint256 amount); // 4.还款
  event AddAssetEvent(address sender, uint256 amount); // 5.添加资产

  struct Table {
    bool is_valid;
    address[] addrs;
    uint256[] amounts; 
    uint256[] deadlines;
  }

  mapping(address => Table) receipts_creditor;
  mapping(address => Table) receipts_debtor;
  mapping(address => uint256) assets;

  function getAmountAndDeadline(Table storage table, address addr) private returns(bool, uint256, uint256){
    for (uint256 i = 0; i < table.addrs.length; i++) {
      if (table.addrs[i] == addr) {
        return (true, table.amounts[i], table.deadlines[i]);
      }
    }
    return (false, 0, 0);
  }

  function getAmount(Table storage table, address addr) private returns(bool, uint256) {
    for (uint256 i = 0; i < table.addrs.length; i++) {
      if (table.addrs[i] == addr) {
        return (true, table.amounts[i]);
      }
    }
    return (false, 0);
  }

  function checkExist(Table storage table, address addr) private returns(bool) {
    for (uint256 i = 0; i < table.addrs.length; i++) {
      if (table.addrs[i] == addr) {
        return true;
      }
    }
    return false;
  }

  function tableInsert(Table storage table, address addr, uint256 amount, uint256 deadline) private {
    table.is_valid = true;
    table.addrs.push(addr);
    table.amounts.push(amount);
    table.deadlines.push(deadline);
  }

  function tableDelete(Table storage table, address addr) private {
    for (uint256 i = 0; i < table.addrs.length; i++) {
      if (table.addrs[i] == addr) {
        for (uint256 j = i + 1; j < table.addrs.length; j++) {
          table.addrs[j - 1] = table.addrs[j];
          table.amounts[j - 1] = table.amounts[j];
          table.deadlines[j - 1] = table.deadlines[j];
        }
        table.addrs.length--;
        table.amounts.length--;
        table.deadlines.length--;
        break;
      }
    }
  }

  // 签发应收账款单据
  function signature(address debtor, uint256 amount, uint256 deadline) public {
    // insert creditor receipt
    Table storage table_creditor = receipts_creditor[msg.sender];
    tableInsert(table_creditor, debtor, amount, deadline);
    // insert debtor receipt
    Table storage table_debtor = receipts_debtor[debtor];
    tableInsert(table_debtor, msg.sender, amount, deadline);

    emit SignatureEvent(msg.sender, debtor, amount, deadline);
  }

  // 转让应收账款
  // a->c => b->c
  function transfer(address creditor, address debtor, uint256 amount) public {
    Table storage table_sender = receipts_creditor[msg.sender];
    Table storage table_middle = receipts_creditor[creditor];
    Table storage table_debtor = receipts_debtor[debtor];

    bool exist;
    uint256 receipt_amount;
    uint256 deadline;

    (exist, receipt_amount, deadline) = getAmountAndDeadline(table_sender, debtor);

    require(exist, "receipt not exist");
    require(receipt_amount >= amount, "receipt not enough");
    tableDelete(table_sender, debtor);
    tableDelete(table_debtor, msg.sender);
    tableInsert(table_middle, debtor, amount, deadline);
    tableInsert(table_debtor, creditor, amount, deadline);
    if (receipt_amount > amount) {
      tableInsert(table_sender, debtor, receipt_amount - amount, deadline);
      tableInsert(table_debtor, msg.sender, receipt_amount - amount, deadline);
    }

    emit TransferEvent(msg.sender, creditor, debtor, amount);
  }

  // 向银行融资
  function finance(address bank, address debtor, uint256 amount, uint256 deadline) public {
    Table storage table_sender_c = receipts_creditor[msg.sender];
    Table storage table_sender_d = receipts_debtor[msg.sender];
    Table storage table_bank = receipts_creditor[bank];
    Table storage table_debtor = receipts_debtor[debtor];

    bool exist;
    uint256 receipt_amount;
    (exist, receipt_amount) = getAmount(table_sender_c, debtor);
    require(exist, "receipt not exist");
    require(receipt_amount >= amount, "receipt not enough");
    require(assets[bank] >= amount, "bank account not enough");
    tableInsert(table_bank, msg.sender, amount, deadline);
    tableInsert(table_sender_d, bank, amount, deadline);
    assets[msg.sender] += amount;
    assets[bank] -= amount;

    emit FinanceEvent(msg.sender, bank, debtor, amount, deadline);
  }

  // 还款
  function payback(address creditor) public {
    Table storage table_creditor = receipts_creditor[creditor];
    Table storage table_debtor = receipts_debtor[msg.sender];

    bool exist;
    uint256 amount;
    (exist, amount) = getAmount(table_creditor, msg.sender);
    require(exist, "receipt not exist");
    require(assets[msg.sender] > amount, "account not enough");
    tableDelete(table_creditor, msg.sender);
    tableDelete(table_debtor, creditor);
    assets[msg.sender] -= amount;
    assets[creditor] += amount;

    emit PaybackEvent(msg.sender, creditor, amount);
  }

  function strConcat(string _a, string _b) private returns(string){
    bytes memory _ba = bytes(_a);
    bytes memory _bb = bytes(_b);
    string memory ret = new string(_ba.length + _bb.length);
    bytes memory bret = bytes(ret);
    uint256 k = 0;
    for (uint256 i = 0; i < _ba.length; i++)bret[k++] = _ba[i];
    for (i = 0; i < _bb.length; i++) bret[k++] = _bb[i];
    return string(ret);
  }

  // 获取收据列表
  function getCreditorReceipts() public constant returns(string, string, uint256[], uint256[]) {
    Table storage table = receipts_creditor[msg.sender];
    string memory addrs = new string(0);
    uint256[] memory amounts = table.amounts;
    uint256[] memory deadlines = table.deadlines;
    for (uint256 i = 0; i < table.addrs.length; i++) {
      addrs = strConcat(addrs, toString(table.addrs[i]));
      addrs = strConcat(addrs, ",");
    }
    return (toString(msg.sender), addrs, amounts, deadlines);
  }

  // 获取欠据列表
  function getDebtorReceipts() public constant returns(string, string, uint256[], uint256[]) {
    Table storage table = receipts_debtor[msg.sender];
    string memory addrs = new string(0);
    uint256[] memory amounts = table.amounts;
    uint256[] memory deadlines = table.deadlines;
    for (uint256 i = 0; i < table.addrs.length; i++) {
      addrs = strConcat(addrs, toString(table.addrs[i]));
      addrs = strConcat(addrs, ",");
    }
    return (toString(msg.sender), addrs, amounts, deadlines);
  }

  // 获取账户余额
  function getAsset() public constant returns(uint256) {
    return assets[msg.sender];
  }

  // 添加资产
  function addAsset(uint256 amount) public {
    assets[msg.sender] += amount;
    emit AddAssetEvent(msg.sender, amount);
  }

  // 转换地址为字符串。
  function toString(address x) private constant returns (string) {
      bytes32 value = bytes32(uint256(x));
      bytes memory alphabet = "0123456789abcdef";
      bytes memory str = new bytes(42);
      str[0] = '0';
      str[1] = 'x';
      for (uint256 i = 0; i < 20; i++) {
          str[2+i*2] = alphabet[uint256(value[i + 12] >> 4)];
          str[3+i*2] = alphabet[uint256(value[i + 12] & 0x0f)];
      }
      return string(str);
  }
} 