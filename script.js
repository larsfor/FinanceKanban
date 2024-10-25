document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();

    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const taskId = task.id;
        const completionTime = localStorage.getItem(taskId);
        if (completionTime) {
            const currentTime = new Date().getTime();
            const timeElapsed = currentTime - completionTime;
            if (timeElapsed >= 7 * 24 * 60 * 60 * 1000) {
                task.remove();
            } else {
                task.classList.add('completed');
                setTimeout(() => {
                    task.remove();
                }, 7 * 24 * 60 * 60 * 1000 - timeElapsed);
            }
        }
    });
});

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTask(task.name, task.id, task.column);
    });
}

document.getElementById('add-task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const taskName = document.getElementById('task-name').value;
    addTask(taskName);
    document.getElementById('task-name').value = ''; // Clear the input field
});

function addTask(taskName, taskId = 'task-' + new Date().getTime(), columnId = 'todo-column') {
    if (document.getElementById(taskId)) return; // Prevent duplicate tasks

    const task = document.createElement('div');
    task.className = 'task';
    task.id = taskId;
    task.draggable = true;
    task.innerHTML = `
        ${taskName}
        <hr />
        <button class="complete-btn">Complete</button>
        <button class="remove-btn">Remove</button>
    `;
    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);
    task.querySelector('.complete-btn').addEventListener('click', markComplete);
    task.querySelector('.remove-btn').addEventListener('click', removeTask);

    document.getElementById(columnId).appendChild(task);

    if (!localStorage.getItem(taskId)) {
        saveTaskToLocalStorage(taskId, taskName, columnId);
    }
}

function removeTask(e) {
    const task = e.target.closest('.task');
    const taskId = task.id;
    task.remove();
    removeTaskFromLocalStorage(taskId);
}

function saveTaskToLocalStorage(taskId, taskName, columnId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ id: taskId, name: taskName, column: columnId });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hide');
    }, 0);
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
        updateTaskColumnInLocalStorage(id, column.id);
    }
}

function updateTaskColumnInLocalStorage(taskId, columnId) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, column: columnId };
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function markComplete(e) {
    const task = e.target.closest('.task');
    const taskId = task.id;
    const completionTime = new Date().getTime();
    localStorage.setItem(taskId, completionTime);
    task.classList.add('completed');
    setTimeout(() => {
        task.remove();
        removeTaskFromLocalStorage(taskId);
    }, 7 * 24 * 60 * 60 * 1000); // 1 week in milliseconds
}

// Add event listeners for existing tasks and columns
document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('dragstart', dragStart);
    task.addEventListener('dragend', dragEnd);
    task.querySelector('.complete-btn').addEventListener('click', markComplete);
    task.querySelector('.remove-btn').addEventListener('click', removeTask);
});

document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('drop', drop);
});
