class Transaction {
  constructor(transaction) {
    const { id, type, description, value } = transaction;
    this.id = id;
    this.type = type;
    this.description = description;
    this.value = value;
    this.date = Date.now();
  }
}

export class Expense extends Transaction {
  constructor(transaction) {
    super(transaction);
  }
}

export class Income extends Transaction {
  constructor(transaction) {
    super(transaction);
  }
}
