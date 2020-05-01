//budget controller
var bugetContoller = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalsIncome) {
    if (totalsIncome > 0) {
      this.percentage = Math.round((this.value / totalsIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 1;
      }

      if (type == "inc") {
        newItem = new Income(ID, des, val);
      } else if (type == "exp") {
        newItem = new Expense(ID, des, val);
      }
      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);
      console.log("IDS ", ids, "INDEX", index);
      if (id !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      calculateTotal("inc");
      calculateTotal("exp");

      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function () {
      return data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalsInc: data.totals.inc,
        totalsExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log("data ", data);
    },
  };
})();

//UI controller
var uiController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec, sign;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      if (type == "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type == "exp") {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      }
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalsInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalsExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

//Global Controller
var globalController = (function (bgCtl, uiCtl) {
  var updateBudget = function () {
    bgCtl.calculateBudget();

    var budget = bgCtl.getBudget();
    uiCtl.displayBudget(budget);

    console.log(budget);
  };

  var ctrlAddItem = function () {
    var input = uiCtl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      var val = bgCtl.addItem(input.type, input.description, input.value);

      console.log("VAL " + val);
      uiCtl.addListItem(val, input.type);
      uiCtl.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, ID, type;
    console.log("EVENT ", event.target);
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      console.log("SPLIT ", splitID, type, ID);

      bgCtl.deleteItem(type, ID);

      uiCtl.deleteListItem(itemID);
      updateBudget();
      updatePercentages();
    }
  };

  var updatePercentages = function () {
    bgCtl.calculatePercentages();
    var percentages = bgCtl.getPercentage();
    uiCtl.displayPercentages(percentages);
  };

  var setupEventListener = function () {
    var DOM = uiCtl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      //enter keyevent
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  return {
    init: function () {
      console.log("APPLICATION START >>>>>>>");
      var startBudget = {
        budget: 0,
        totalsInc: 0,
        totalsExp: 0,
        percentage: -1,
      };
      uiCtl.displayBudget(startBudget);
      setupEventListener();
    },
  };
})(bugetContoller, uiController);

globalController.init();
