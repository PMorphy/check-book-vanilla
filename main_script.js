const DOMSelectors = {
  container: '.container',
  submitButton: '.submit--button',
  logList: '.log-list',
  reportMonthlyGains: '.monthly-gains--text',
  reportMonthlyLosses: '.monthly-losses--text',
  reportMonthlySum: '.monthly-sum--text'
};

const entrySelectors = {
  description: '.entry--description',
  category: '.category',
  amount: '.entry--input'
};

const APPLICATION_STARTED = 'APPLICATION_STARTED';
const EMPTY_STRING = '';
const ZERO = 0;
const NEXT = 1;
const ENTER = 13;
const EXPENSE = 'expense';
const INCOME = 'income';
const KEY_PRESS = 'keypress';
const CLICK = 'click';
const BEFORE_END = 'beforeend';

const ModelController = (() => {
  const position = {
    transactions: {
      income: [],
      expense: []
    },
    totals: {
      income: ZERO,
      expense: ZERO
    },
    report: {
      monthlyGains: ZERO,
      monthlyLosses: ZERO,
      monthlySum: ZERO
    }
  };

  const addTransaction = (transaction) => {
    const {
      amountEntry: amount,
      categoryEntry: category,
      descriptionEntry: description
    } = transaction;

    const date = new Date();
    const stamp = `${date.getMonth() + 1}/${date.getDate()}`;

    const newTransaction = {
      amount,
      category,
      description,
      type: category === 'Income' ? INCOME : EXPENSE,
      date: stamp
    };

    let index = position.transactions[newTransaction.type].length;
    newTransaction.id = `${index}-${newTransaction.type}`;

    position.transactions[newTransaction.type].push(newTransaction);
    return newTransaction;
  };

  const getReport = () => {
    const { report, totals } = position;
    return {
      report,
      incomeTotals: totals[INCOME],
      expenseTotals: totals[EXPENSE]
    };
  };

  const calculateReport = (transaction) => {
    const { amount } = transaction;
    if (transaction.type === INCOME) {
      position.totals.income += parseFloat(amount);
      position.report.monthlyGains += parseFloat(amount);
    } else {
      position.totals.expense += parseFloat(amount);
      position.report.monthlyLosses += parseFloat(amount);
    }

    position.report.monthlySum =
      position.report.monthlyGains - position.report.monthlyLosses;
  };

  return { addTransaction, getReport, calculateReport };
})();

const UIController = (() => {
  const { category, description, amount } = entrySelectors;

  const getInput = () => {
    const categoryEntry = document.querySelector(category).value;
    const descriptionEntry = document.querySelector(description).value;
    const amountEntry = document.querySelector(amount).value;

    if (validateForm(categoryEntry, descriptionEntry, amountEntry)) {
      return {
        categoryEntry,
        descriptionEntry,
        amountEntry
      };
    }
  };

  const validateForm = (category, description, amount) => {
    if (description !== EMPTY_STRING && !isNaN(amount) && amount > 0)
      return true;
    else return false;
  };

  const addTransactionToList = (transaction) => {
    let html;

    const logList = document.querySelector(`${DOMSelectors.logList} tbody`);
    if (transaction.type === INCOME) {
      html = `
      <tr class="income">
        <td><h5 class="log-item--date">${transaction.date}</h5></td>
        <td><p class="log-item--description">${transaction.description}</p></td>
        <td><p class="log-item--category">${transaction.category}</p></td>
        <td><h4 class="log-item--amount">$${transaction.amount}</h4></td>
      </tr>
    `;
    } else {
      html = `
      <tr class="expense">
        <td><h5 class="log-item--date">${transaction.date}</h5></td>
        <td><p class="log-item--description">${transaction.description}</p></td>
        <td><p class="log-item--category">${transaction.category}</p></td>
        <td><h4 class="log-item--amount">$-${transaction.amount}</h4></td>
      </tr>
      `;
    }

    logList.insertAdjacentHTML(BEFORE_END, html);
  };

  const writeToScreen = (selector, text) => {
    document.querySelector(selector).textContent = text;
  };

  const clearInputs = () => {
    Object.values(entrySelectors).forEach((selector) => {
      document.querySelector(selector).value = EMPTY_STRING;
    });

    document.querySelector(entrySelectors.amount).focus();
  };

  const updateDisplay = (report) => {
    const { reportMonthlyGains, reportMonthlyLosses, reportMonthlySum } =
      DOMSelectors;
    writeToScreen(reportMonthlyGains, report.monthlyGains);
    writeToScreen(reportMonthlyLosses, report.monthlyLosses);
    writeToScreen(reportMonthlySum, report.monthlySum);
  };

  return {
    getInput,
    addTransactionToList,
    clearInputs,
    updateDisplay
  };
})();

((modelController, uiController) => {
  const { container, submitButton } = DOMSelectors;

  const handleEnter = (event) => {
    if (event.keyCode === ENTER && event.which === ENTER) {
      handleAddTransaction();
    }
  };

  const handleAddTransaction = () => {
    const transaction = uiController.getInput();

    if (transaction) {
      const newTransaction = modelController.addTransaction(transaction);
      uiController.addTransactionToList(newTransaction);
      uiController.clearInputs();
      updateReport(newTransaction);
    }
  };

  const updateReport = (transaction) => {
    [calculateTransaction, updateDisplay].forEach((func) => func(transaction));
  };

  const calculateTransaction = (transaction) => {
    modelController.calculateReport(transaction);
  };

  const updateDisplay = () => {
    uiController.updateDisplay(modelController.getReport().report);
  };

  const setupEventListeners = () => {
    document.querySelector(container).addEventListener(CLICK, () => {});

    document.addEventListener(KEY_PRESS, handleEnter);

    document
      .querySelector(submitButton)
      .addEventListener(CLICK, handleAddTransaction);
  };

  return {
    init: () => {
      console.log(APPLICATION_STARTED);
      setupEventListeners();
    }
  };
})(ModelController, UIController).init();
