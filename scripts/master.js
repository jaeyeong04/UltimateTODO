const titlePopUp = document.querySelector(".name-change-input");
const movePopUp = document.querySelector(".move-popUp");
const overlay = document.querySelector(".overlay");
let activeTitle = null;
let selectedProjectName = null;

function togglePopUp(popupElement, show = true) {
  if (show) {
    popupElement.classList.remove("hidden");
    popupElement.classList.add("show");
    overlay.classList.remove("hidden");
  } else {
    popupElement.classList.remove("show");
    popupElement.classList.add("hidden");
    overlay.classList.add("hidden");
  }
}

//Show/Hide Title Pop UP
function showTitlePopUp() {
  togglePopUp(titlePopUp, true);
}

function closeTitlePopUp() {
  togglePopUp(titlePopUp, false);
}

function showMovePopUp(moveBtn) {
  togglePopUp(movePopUp, true);
  changeTargetIndex(moveBtn);
}

function closeMovePopUp() {
  togglePopUp(movePopUp, false);
}

function moveToDaily(projectIndex, todoIndex) {
  dailyArr.push(masterArr[projectIndex][todoIndex]);
  updateStorage("daily");
  closeMovePopUp();
}

function moveToTrivial(projectIndex, todoIndex) {
  trivialArr.push(masterArr[projectIndex][todoIndex]);
  updateStorage("trivial");
  closeMovePopUp();
}

function rename(e) {
  e.preventDefault();
  var input = document.querySelector(".new-title");
  const newTitle = input.value.trim();
  const oldTitle = activeTitle.innerText.trim();
  if (newTitle == "") {
    alert("You must choose a name!");
    return;
  }
  if (activeTitle) {
    //Check if the form is for a "NEW PROJECT"
    if (oldTitle == "New Project") {
      projectNameArr.push(newTitle);
      masterArr.push([]);
      updateStorage("projectName");
      updateStorage("master");
    } else if (oldTitle == "New TODO") {
      //Check if the form is for a "NEW TODO"
      const projectIndex = projectNameArr.indexOf(selectedProjectName);
      masterArr[projectIndex].push(newTitle);
      updateStorage("master");
    } else {
      //Check if the form is for "RENAME"
      if (projectNameArr.indexOf(oldTitle) != -1) {
        //RENAME a project
        projectNameArr[projectNameArr.indexOf(oldTitle)] = newTitle;
        updateStorage("projectName");
      } else {
        //RENAME a TODO
        const projectIndex = projectNameArr.indexOf(selectedProjectName);
        const todoIndex = masterArr[projectIndex].indexOf(oldTitle);
        dailyArr.forEach((todo) => {
          if (masterArr[targetIndex[0]][targetIndex[1]] == todo) {
            const index = dailyArr.indexOf(todo);
            dailyArr[index] = newTitle;
          }
        });
        trivialArr.forEach((todo) => {
          if (masterArr[targetIndex[0]][targetIndex[1]] == todo) {
            const index = trivialArr.indexOf(todo);
            trivialArr[index] = newTitle;
          }
        });
        masterArr[projectIndex][todoIndex] = newTitle;
        updateStorage("master");
        updateStorage("daily");
        updateStorage("trivial");
      }
    }
    activeTitle.innerText = newTitle;
  }
  closeTitlePopUp();
  input.value = "";
}

//Add a new Project
function addNewProject(projectName) {
  const newItem = document.createElement("div");
  newItem.className = "todo-box";
  newItem.innerHTML = `<div class="todo-box__header"><div class="todo-box__column"><div class="todo-box__name todo-box__name--changeable">${projectName}</div></div><div class="todo-box__column"><i class="fa-solid fa-plus todo-box__add-button"></i><i class="fa-solid fa-trash todo-box__delete-project"></i></div></div><div class="todo-box__list"><div class="todo-box__scroll"><ul></ul></div></div>`;
  var projectSide = document.querySelector(".project-side__scroll");
  projectSide.appendChild(newItem);
  activeTitle = newItem.querySelector(".todo-box__name--changeable");
}
//Add a new TODO
function addNewTODO(addTodoBtn, todoName) {
  const newItem = document.createElement("li");
  newItem.className = "todo-box__item";
  newItem.innerHTML = `<div class="todo-box__list-column"><label><input type="checkbox" /><span>${todoName}</span></label></div><div class="todo-box__list-column"><div class="todo-box__rename-button">Rename</div><i class="fa-solid fa-arrow-right todo-box__move-item"></i><i class="fa-solid fa-trash todo-box__delete-item"></i></div>`;
  var selectedProject = addTodoBtn.closest(".todo-box");
  selectedProjectName = selectedProject
    .querySelector(".todo-box__name")
    .innerText.trim();
  selectedProject.querySelector("ul").appendChild(newItem);
  activeTitle = newItem.querySelector("span");
}

//All the functions required in master-screen
document
  .querySelector(".master-screen")
  .addEventListener("click", function (e) {
    //When e.target == todo-box__name--changeable; project rename
    if (e.target.classList.contains("todo-box__name--changeable")) {
      activeTitle = e.target;
      showTitlePopUp();
    }
    //When e.target == .todo-box__add-button; add TODO
    if (e.target.classList.contains("todo-box__add-button")) {
      addNewTODO(e.target, "New TODO");
      showTitlePopUp();
    }
    //When e.target == .todo-box__rename-button; todo rename
    if (e.target.classList.contains("todo-box__rename-button")) {
      activeTitle = e.target.closest(".todo-box__item").querySelector("span");
      selectedProjectName = e.target
        .closest(".todo-box")
        .querySelector(".todo-box__name")
        .innerText.trim();
      changeTargetIndex(e.target);
      showTitlePopUp();
    }
    //When e.target == .todo-box__delete-item or .todo-box__delete-project
    if (
      e.target.classList.contains("todo-box__delete-item") ||
      e.target.classList.contains("todo-box__delete-project")
    ) {
      eliminate(e.target);
    }
    //When e.target == .todo-box__move-item
    if (e.target.classList.contains("todo-box__move-item")) {
      const targetTodo = e.target
        .closest(".todo-box__item")
        .querySelector("span").innerText;
      console.log(targetTodo);
      if (dailyArr.includes(targetTodo)) {
        alert("This has already been moved to your Daily TODO");
      } else if (trivialArr.includes(targetTodo)) {
        alert("This has already been moved to your Trivial TODO");
      } else {
        showMovePopUp(e.target);
      }
    }
  });

//(Re)naming projects or TODOs
document.querySelector("form").onsubmit = rename;

//Make add-project-function showPopUp and add a new project-side todo-box
document
  .querySelector(".add-project-button")
  .addEventListener("click", function () {
    addNewProject("New Project");
    showTitlePopUp();
  });

document
  .querySelector(".move-popUp__toDaily")
  .addEventListener("click", function () {
    moveToDaily(targetIndex[0], targetIndex[1]);
  });

document
  .querySelector(".move-popUp__toTrivial")
  .addEventListener("click", function () {
    moveToTrivial(targetIndex[0], targetIndex[1]);
  });

//Load project side
for (var i = 1; i < projectNameArr.length; i++) {
  addNewProject(projectNameArr[i]);
  for (var j = 0; j < masterArr[i].length; j++) {
    const targetProject = document
      .querySelector(".project-side__scroll")
      .querySelectorAll(".todo-box")[i - 1];
    addNewTODO(
      targetProject.querySelector(".todo-box__add-button"),
      masterArr[i][j]
    );
  }
}

//Load todo side
for (var j = 0; j < masterArr[0].length; j++) {
  const targetProject = document
    .querySelector(".todo-side")
    .querySelector(".todo-box");
  addNewTODO(
    targetProject.querySelector(".todo-box__add-button"),
    masterArr[0][j]
  );
}
