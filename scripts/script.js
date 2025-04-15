//local storage
localStorage = window.localStorage;

//Load values from existing local storage or make a new array
//projectName stores
let projectNameArr = JSON.parse(
  localStorage.getItem("projectName") || '["TODOs"]'
);
let masterArr = JSON.parse(localStorage.getItem("master") || "[[]]");
let dailyArr = JSON.parse(localStorage.getItem("daily") || "[]");
let trivialArr = JSON.parse(localStorage.getItem("trivial") || "[]");
let targetIndex = [];

const storageMap = {
  projectName: projectNameArr,
  master: masterArr,
  daily: dailyArr,
  trivial: trivialArr,
};

function updateStorage(key) {
  if (storageMap[key]) {
    localStorage.setItem(key, JSON.stringify(storageMap[key]));
  } else {
    console.warn(`Unknown key: ${key}`);
  }
}

function updateAllStorage() {
  Object.keys(storageMap).forEach(updateStorage);
}

//Utility function that changes targetIndex
//Used in the function: eliminate
function findIndexInMaster(todoName) {
  for (let i = 0; i < masterArr.length; i++) {
    const j = masterArr[i].indexOf(todoName);
    if (j !== -1) return [i, j];
  }
  return [-1, -1];
}

function changeTargetIndex(btn) {
  const projectName = btn
    .closest(".todo-box")
    .querySelector(".todo-box__name")
    .innerText.trim();
  const todoItem = btn.closest(".todo-box__item");

  if (["Today's TODO's", "Today's Trivia"].includes(projectName)) {
    const todoName = todoItem.querySelector("span").innerText.trim();
    targetIndex = findIndexInMaster(todoName);
  } else {
    const projectIndex = projectNameArr.indexOf(projectName);
    if (!todoItem) {
      targetIndex = [projectIndex, 0];
    } else {
      const todoName = todoItem.querySelector("span").innerText.trim();
      const todoIndex = masterArr[projectIndex].indexOf(todoName);
      targetIndex = [projectIndex, todoIndex];
    }
  }
}

function addDeleteHandler(type) {
  const screenClass = `.${type}-screen`;
  const storageArr = type === "daily" ? dailyArr : trivialArr;
  document.querySelector(screenClass).addEventListener("click", function (e) {
    if (e.target.classList.contains("todo-box__delete-item")) {
      e.preventDefault();

      const target = e.target.closest(".todo-box__item");
      if (!target) return;

      const todoName = target.querySelector("span").innerText.trim();
      const index = storageArr.indexOf(todoName);
      if (index !== -1) {
        storageArr.splice(index, 1);
        target.remove();
        updateStorage(type);
      }
    }
  });
}

function eliminate(deleteBtn) {
  let target = null;
  const todoItem = deleteBtn.closest(".todo-box__item");
  const todoName = todoItem?.querySelector("span")?.innerText.trim();
  const projectBox = deleteBtn.closest(".todo-box");
  const projectName = projectBox
    ?.querySelector(".todo-box__name")
    ?.innerText.trim();

  if (["Today's TODO's", "Today's Trivia"].includes(projectName)) {
    targetIndex = findIndexInMaster(todoName);
  } else {
    changeTargetIndex(deleteBtn);
  }
  if (deleteBtn.classList.contains("todo-box__delete-project")) {
    target = projectBox;
    masterArr.splice(targetIndex[0], 1);
    projectNameArr.splice(targetIndex[0], 1);
  } else if (deleteBtn.classList.contains("todo-box__delete-item")) {
    target = todoItem;
    [dailyArr, trivialArr].forEach((arr) => {
      const idx = arr.indexOf(masterArr[targetIndex[0]][targetIndex[1]]);
      if (idx !== -1) arr.splice(idx, 1);
    });
    masterArr[targetIndex[0]].splice(targetIndex[1], 1);
  }
  updateAllStorage();
  if (target) target.remove();
}

function handleCheckBoxClick(e) {
  if (e.target.matches("input[type=checkbox]")) {
    const target = e.target
      .closest(".todo-box__item")
      .querySelector(".todo-box__delete-item");
    const item = target.closest(".todo-box__item");
    item.classList.add("fade-out");
    item.addEventListener(
      "transitionend",
      function () {
        eliminate(target);
      },
      { once: true }
    );
  }
}

document.addEventListener("click", handleCheckBoxClick);

function loadList(arr, targetSelector) {
  const targetLocation = document.querySelector(targetSelector);
  if (!targetLocation) return;
  targetLocation.innerHTML = "";
  for (var i = 0; i < arr.length; i++) {
    const newItem = document.createElement("li");
    newItem.className = "todo-box__item";
    newItem.innerHTML = `<div class="todo-box__list-column">
                        <label><input type="checkbox" /><span>${arr[i]}</span></label>
                      </div>
                      <div class="todo-box__list-column">
                        <i class="fa-solid fa-trash todo-box__delete-item"></i>
                      </div>`;
    targetLocation.appendChild(newItem);
  }
}
