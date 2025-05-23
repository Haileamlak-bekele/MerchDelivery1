const PaymentAccount = require("../src/config/model/PaymentAccount.model");
const PaymentTransaction = require("../src/config/model/PaymentTransaction.model");

// Create a payment account for a user
const createPaymentAccount = async (userId, accountType) => {
  const existing = await PaymentAccount.findOne({ userId, accountType });
  if (existing) return existing;
  const account = new PaymentAccount({ userId, accountType });
  await account.save();
  return account;
};

// Get payment account by user ID
const getPaymentAccountByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await PaymentAccount.findOne({ userId });
    if (!account) return res.status(404).json({ message: "Payment account not found" });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment account", error });
  }
};

// Create a payment transaction and update account balance
const createTransaction = async ({ accountId, amount, type, reason, from, to, reference, referenceModel }) => {
  const account = await PaymentAccount.findById(accountId);
  if (!account) throw new Error('Payment account not found');
  if (type === 'credit') {
    account.balance += amount;
  } else if (type === 'debit') {
    account.balance -= amount;
  } else {
    throw new Error('Invalid transaction type');
  }
  await account.save();
  console.log('Updating account', accountId, 'old balance:', account.balance, 'type:', type, 'amount:', amount);
  const transaction = new PaymentTransaction({
    accountId,
    amount,
    type,
    reason,
    from,
    to,
    reference,
    referenceModel,
  });
  await transaction.save();
  return transaction;
};

// Get all transactions for a payment account
const getTransactionsByAccountId = async (req, res) => {
  const { accountId } = req.params;
  try {
    const transactions = await PaymentTransaction.find({ accountId })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

// (Optional) Add more CRUD functions as needed

module.exports = {
  createPaymentAccount,
  getPaymentAccountByUserId,
  createTransaction,
  getTransactionsByAccountId,
}; 