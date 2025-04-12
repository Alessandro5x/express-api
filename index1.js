const express = require('express');
const http = require('http');
const app = express();
const port = 3000;

let tasks = [];
let taskid = 0;
//Manage tasks
app.use(express.json());

// GET /tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = { id: taskid++, title, done: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.done = true;
  res.json(task);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });

  setTimeout(testListTasks, 1000);
  setTimeout(testAddTask, 2000);
  setTimeout(() => testChangeTaskStatus(0), 3000);
  setTimeout(testAddTask, 2000);
  setTimeout(testListTasks, 4000);
}

function testListTasks() {
  const options = {
    hostname: 'localhost',
    port,
    path: '/tasks',
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result GET /tasks:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}

function testAddTask() {
  const taskData = JSON.stringify({ title: 'Nova Tarefa' });

  const options = {
    hostname: 'localhost',
    port,
    path: '/tasks',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(taskData)
    }
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result POST /tasks:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.write(taskData);
  req.end();
}

function testChangeTaskStatus(id) {
  const options = {
    hostname: 'localhost',
    port,
    path: `/tasks/${id}`,
    method: 'PUT'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log(`\n🧪 Test result PUT /tasks/${id}:`);
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}
