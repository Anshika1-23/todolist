document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const noTasksMsg = document.getElementById('no-tasks-msg');
    const searchBar = document.getElementById('search-bar');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const renderTasks = (filteredTasks = tasks) => {
        taskList.innerHTML = '';
        if (filteredTasks.length === 0) {
            noTasksMsg.style.display = 'block';
        } else {
            noTasksMsg.style.display = 'none';
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.setAttribute('draggable', 'true');
                li.dataset.id = task.id;
                li.classList.add('task-item');
                li.innerHTML = `
                    <input type="text" value="${task.name}" readonly class="task-name ${task.completed ? 'task-completed' : ''}">
                    <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                `;
                taskList.appendChild(li);
                addEventListeners(li, task);
            });
        }
    };

    const addEventListeners = (li, task) => {
        const completeBtn = li.querySelector('.complete-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const editBtn = li.querySelector('.edit-btn');
        const taskName = li.querySelector('.task-name');

        completeBtn.addEventListener('click', () => toggleCompletion(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        editBtn.addEventListener('click', () => editTask(task.id, taskName, editBtn));
        
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
    };

    const addTask = () => {
        const taskName = taskInput.value.trim();
        if (taskName === '') return alert('Task name cannot be empty');
        const task = {
            id: Date.now().toString(),
            name: taskName,
            completed: false
        };
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';
        renderTasks();
    };

    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    const toggleCompletion = (id) => {
        tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    const editTask = (id, taskNameElem, editBtn) => {
        if (editBtn.textContent === 'Edit') {
            taskNameElem.removeAttribute('readonly');
            taskNameElem.focus();
            editBtn.textContent = 'Save';
        } else {
            const updatedName = taskNameElem.value.trim();
            if (updatedName === '') return alert('Task name cannot be empty');
            tasks = tasks.map(task => task.id === id ? { ...task, name: updatedName } : task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskNameElem.setAttribute('readonly', true);
            editBtn.textContent = 'Edit';
            renderTasks();
        }
    };

    const filterTasks = (criteria) => {
        if (criteria === 'completed') {
            renderTasks(tasks.filter(task => task.completed));
        } else if (criteria === 'incomplete') {
            renderTasks(tasks.filter(task => !task.completed));
        } else {
            renderTasks();
        }
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        const draggedTaskId = e.dataTransfer.getData('text/plain');
        const droppedOnTaskId = e.target.closest('li').dataset.id;

        const draggedTaskIndex = tasks.findIndex(task => task.id === draggedTaskId);
        const droppedOnTaskIndex = tasks.findIndex(task => task.id === droppedOnTaskId);

        const [draggedTask] = tasks.splice(draggedTaskIndex, 1);
        tasks.splice(droppedOnTaskIndex, 0, draggedTask);

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    const searchTasks = (searchTerm) => {
        renderTasks(tasks.filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase())));
    };

    document.getElementById('add-task-btn').addEventListener('click', addTask);
    document.getElementById('show-all-btn').addEventListener('click', () => filterTasks('all'));
    document.getElementById('show-completed-btn').addEventListener('click', () => filterTasks('completed'));
    document.getElementById('show-incomplete-btn').addEventListener('click', () => filterTasks('incomplete'));
    searchBar.addEventListener('input', () => searchTasks(searchBar.value));

    renderTasks();
});
