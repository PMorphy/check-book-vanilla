import { Income, Expense } from './transaction.js';

const DOMSelectors = {
  container: '.container',
  submitButton: '.submit--button',
  logList: '.log-list',
  reportMonthlyGains: '.report-monthly-gains',
  reportMonthlyLosses: '.report-monthly-losses',
  reportMonthlySum: '.report-monthly-sum'
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
const EXPENSES = 'EXPENSES';
const INCOME = 'INCOME';
const KEY_PRESS = 'keypress';
const CLICK = 'click';
const BEFORE_END = 'beforeend';

const ModelController = (() => {
  const position = {
    transactions: {
      INCOME: [],
      EXPENSES: []
    },
    totals: {
      INCOME: ZERO,
      EXPENSES: ZERO
    },
    report: {
      monthlyGains: ZERO,
      monthlyLosses: ZERO,
      monthlySum: ZERO
    }
  };

  const addTransaction = (transaction) => {
    const { transactions } = position;
    const { type } = transaction;
    let newTransaction;

    console.log(transaction);

    if (transactions[type]?.length > ZERO) {
      transaction.id =
        transactions[type][transactions[type].length - NEXT].id + NEXT;
    } else transaction.id = ZERO;

    if (type === INCOME) {
      newTransaction = new Income(transaction);
    } else newTransaction = new Expense(transaction);

    transactions[type].push(newTransaction);
    return newTransaction;
  };

  const getReport = () => {
    const {
      report: { monthlyGains, monthlyLosses, monthlySum },
      totals: { INCOME, EXPENSES }
    } = position;
    return {
      monthlyGains,
      monthlyLosses,
      monthlySum,
      incomeTotals: INCOME,
      expenseTotals: EXPENSES
    };
  };

  const calculateReport = (transaction) => {
    console.log(transaction);
  };

  return { addTransaction, getReport, calculateReport };
})();

const UIController = (() => {
  const { category, description, amount } = entrySelectors;
  const getInput = () => {
    const categoryEntry = document.querySelector(category).value;
    const descriptionEntry = document.querySelector(description).value;
    const amountEntry = document.querySelector(amount).value;

    console.log(categoryEntry, descriptionEntry, amountEntry);

    if (validateForm(categoryEntry, descriptionEntry, amountEntry)) {
      return {
        categoryEntry,
        descriptionEntry,
        amountEntry
      };
    }
  };

  const validateForm = (category, description, amount) => {
    console.log(category, amount, description);
    if (description !== EMPTY_STRING && !isNaN(amount) && amount > 0)
      return true;
    else return false;
  };

  const addTransactionToList = (transaction) => {
    let html;
    const logList = document.querySelector(DOMSelectors.logList);
    if (transaction.type === INCOME) {
      html = `
      <tr class="income">
        <td><h5 class="log-item--date">${transaction.data}</h5></td>
        <td><p class="log-item--description">${transaction.description}</p></td>
        <td><p class="log-item--category">${transaction.category}</p></td>
        <td><h4 class="log-item--amount">$${transaction.amount}</h4></td>
      </tr>
    `;
    } else {
      html = `
      <tr class="expense">
        <td><h5 class="log-item--date">${transaction.data}</h5></td>
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

  const updateDisplay = (model) => {
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
      updateReport();
    }
  };

  const updateReport = (transaction) => {
    [calculateTransaction, updateDisplay].forEach((func) => func(transaction));
  };

  const calculateTransaction = (transaction) => {
    modelController.calculateReport(transaction);
  };

  const updateDisplay = () => {
    uiController.updateDisplay(modelController.getReport());
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
