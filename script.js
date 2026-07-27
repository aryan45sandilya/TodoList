// In-memory storage (data persists only during the session)
let tasks = {};
let currentDate = new Date();
let currentFilter = 'all';

function getMonthKey() {
    return `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
}

function getMonthName() {
    const options = { month: 'long', year: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
}

function updateMonthDisplay() {
    document.getElementById('currentMonth').textContent = getMonthName();
    renderTasks();
}

function getCurrentTasks() {
    const key = getMonthKey();
    return tasks[key] || [];
}

function saveCurrentTasks(taskList) {
    const key = getMonthKey();
    tasks[key] = taskList;
}

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();

    if (taskText) {
        const currentTasks = getCurrentTasks();
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            date: new Date().toISOString()
        };

        currentTasks.push(newTask);
        saveCurrentTasks(currentTasks);
        input.value = '';
        renderTasks();
    }
}

function toggleTask(taskId) {
    const currentTasks = getCurrentTasks();
    const task = currentTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveCurrentTasks(currentTasks);
        renderTasks();
    }
}

function deleteTask(taskId) {
    const currentTasks = getCurrentTasks();
    const filteredTasks = currentTasks.filter(t => t.id !== taskId);
    saveCurrentTasks(filteredTasks);
    renderTasks();
}

function updateStats() {
    const currentTasks = getCurrentTasks();
    const completed = currentTasks.filter(t => t.completed).length;
    const total = currentTasks.length;
    const pending = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    let currentTasks = getCurrentTasks();

    // Apply filter
    if (currentFilter === 'completed') {
        currentTasks = currentTasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        currentTasks = currentTasks.filter(t => !t.completed);
    }

    updateStats();

    if (currentTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>${currentFilter === 'all' ? 'No tasks yet. Add your first task to get started!' : `No ${currentFilter} tasks.`}</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = currentTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${task.text}</span>
            <span class="task-date">${new Date(task.date).toLocaleDateString()}</span>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </li>
    `).join('');
}

// Event Listeners
document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMonthDisplay();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMonthDisplay();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Initialize
updateMonthDisplay();