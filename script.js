document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    setDefaultDate();
    addFormSubmitListener();
    addColumnListeners();
});

const TASK_DATE_SELECTOR = '#task-date';
const TASK_PARTICIPANTS_SELECTOR = '#task-participants';
const TASK_DESCRIPTION_SELECTOR = '#task-description';
const ADD_TASK_FORM_SELECTOR = '#add-task-form';

function setDefaultDate() {
    document.querySelector(TASK_DATE_SELECTOR).valueAsDate = new Date();
}

function addFormSubmitListener() {
    document.querySelector(ADD_TASK_FORM_SELECTOR).addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const taskDate = document.querySelector(TASK_DATE_SELECTOR).value;
    const taskParticipants = document.querySelector(TASK_PARTICIPANTS_SELECTOR).value;
    const taskName = document.querySelector(TASK_DESCRIPTION_SELECTOR).value;
    addTask(taskName, taskDate, taskParticipants);
    clearFormFields();
}

function clearFormFields() {
    document.querySelector(TASK_DATE_SELECTOR).value = '';
    document.querySelector(TASK_PARTICIPANTS_SELECTOR).value = '';
    document.querySelector(TASK_DESCRIPTION_SELECTOR).value = '';
}

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTask(task.name, task.date, task.participants, task.id, task.column));
}

function addTask(taskName, taskDate, taskParticipants, taskId = `task-${Date.now()}`, columnId = 'todo-column') {
    if (document.getElementById(taskId)) return;

    const task = document.createElement('div');
    task.classList.add('task');
    task.id = taskId;
    task.draggable = true;
    task.innerHTML = `
        <div class="date"><b>Date:</b> ${taskDate}</div>
        <div class="participants"><b>Participants:</b> ${taskParticipants}</div>
        <div class="description"><b>Description:</b></div>
        ${taskName}
        <hr />
        <div class="task-buttons">
            <button class="remove-btn">Remove</button>
            <button class="edit-btn">Edit</button>
        </div>
    `;
    task.dataset.name = taskName;
    task.dataset.date = taskDate;
    task.dataset.participants = taskParticipants;
    addTaskEventListeners(task);
    document.getElementById(columnId).appendChild(task);

    if (!localStorage.getItem(taskId)) {
        debounceSaveTaskToLocalStorage(taskId, taskName, taskDate, taskParticipants, columnId);
    }
}


function createTaskElement(taskName, taskDate, taskParticipants, taskId) {
    const task = document.createElement('div');
    task.classList.add('task');
    task.id = taskId;
    task.draggable = true;
    task.innerHTML = `
        <div class="date"><b>Date:</b> ${taskDate}</div>
        <div class="participants"><b>Participants:</b> ${taskParticipants}</div>
        <div class="description"><b>Description:</b></div>
        ${taskName}
        <hr />
        <button class="remove-btn">Remove</button>
        <button class="edit-btn">Edit</button>
    `;
    task.dataset.name = taskName;
    task.dataset.date = taskDate;
    task.dataset.participants = taskParticipants;
    addTaskEventListeners(task);
    return task;
}

function addTaskEventListeners(task) {
    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
        removeTask(e);
    } else if (e.target.classList.contains('edit-btn')) {
        editTask(e);
    }
});

function removeTask(e) {
    const task = e.target.closest('.task');
    const taskId = task.id;
    task.remove();
    removeTaskFromLocalStorage(taskId);
}

function editTask(e) {
    const task = e.target.closest('.task');
    const taskId = task.id;

    const currentName = task.dataset.name;
    const currentDate = task.dataset.date;
    const currentParticipants = task.dataset.participants;

    const editForm = createEditForm(currentName, currentDate, currentParticipants);
    task.innerHTML = '';
    task.appendChild(editForm);

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newDate = document.getElementById('edit-task-date').value;
        const newParticipants = document.getElementById('edit-task-participants').value;
        const newName = document.getElementById('edit-task-description').value;

        task.innerHTML = `
            <div class="date"><b>Date:</b> ${newDate}</div>
            <div class="participants"><b>Participants:</b> ${newParticipants}</div>
            <div class="description"><b>Description:</b></div>
            ${newName}
            <hr />
            <button class="remove-btn">Remove</button>
            <button class="edit-btn">Edit</button>
        `;
        task.dataset.name = newName;
        task.dataset.date = newDate;
        task.dataset.participants = newParticipants;
        addTaskEventListeners(task);
        debounceUpdateTaskInLocalStorage(taskId, newName, newDate, newParticipants);
    });

    document.getElementById('cancel-edit').addEventListener('click', function() {
        task.innerHTML = `
            <div class="date"><b>Date:</b> ${currentDate}</div>
            <div class="participants"><b>Participants:</b> ${currentParticipants}</div>
            <div class="description"><b>Description:</b></div>
            ${currentName}
            <hr />
            <button class="remove-btn">Remove</button>
            <button class="edit-btn">Edit</button>
        `;
        addTaskEventListeners(task);
    });
}

function createEditForm(currentName, currentDate, currentParticipants) {
    const editForm = document.createElement('form');
    editForm.innerHTML = `
        <label for="edit-task-date">Date:</label>
        <input type="date" id="edit-task-date" value="${currentDate}" required><br>
        <label for="edit-task-participants">Participants:</label>
        <input type="text" id="edit-task-participants" value="${currentParticipants}" required><br>
        <label for="edit-task-description">Description:</label>
        <textarea id="edit-task-description" required>${currentName}</textarea><br>
        <button type="submit">Save</button>
        <button type="button" id="cancel-edit">Cancel</button>
    `;
    return editForm;
}

function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debounceSaveTaskToLocalStorage = debounce(saveTaskToLocalStorage);
const debounceUpdateTaskInLocalStorage = debounce(updateTaskInLocalStorage);

function saveTaskToLocalStorage(taskId, taskName, taskDate, taskParticipants, columnId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ id: taskId, name: taskName, date: taskDate, participants: taskParticipants, column: columnId });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add('hide'), 0);
}

function dragEnd(e) {
    e.target.classList.remove('hide');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    const column = e.target.closest('.column');
    if (column) {
        column.appendChild(draggable);

        const taskDate = draggable.querySelector('.date').textContent.replace('Date:', '').trim();
        const taskParticipants = draggable.querySelector('.participants').textContent.replace('Participants:', '').trim();
        const taskDescription = draggable.querySelector('.description').nextSibling.textContent.trim();

        debounceUpdateTaskInLocalStorage(id, taskDescription, taskDate, taskParticipants, column.id);
    }
}

function updateTaskInLocalStorage(taskId, taskName, taskDate, taskParticipants, columnId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, name: taskName, date: taskDate, participants: taskParticipants, column: columnId };
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function addColumnListeners() {
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
    });
}