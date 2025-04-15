const express = require('express');
const http = require('http');
const app = express();
const port = 3000;

app.use(express.json());

let users = [];


// GET /users list users
app.get('/users', (req, res) => {
  res.json(users);
});

// POST /users
app.post('/users', (req, res) => {
  const { id, name, interests } = req.body;

  if (!id || !name || !Array.isArray(interests)) {
    return res.status(400).json({ error: 'id, name, and interests[] are required' });
  }

  if (users.some(u => u.id === id)) {
    return res.status(409).json({ error: 'User with this ID already exists' });
  }

  users.push({ id, name, interests });
  res.status(201).json({ message: 'User created successfully' });
});

// get return users with common interesting
app.get('/matches/:id', (req, res) => {
  const id = req.params.id;
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userInterests = new Set(user.interests);

  const matches = users
    .filter(u => u.id !== id)
    .filter(u => u.interests.some(i => userInterests.has(i)));

  res.json({ matches });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });

  setTimeout(testListUsers, 1000);
  setTimeout(testAddUsers1, 2000);
  setTimeout(testAddUsers2, 2000);
  setTimeout(testListUsers, 3000);
  setTimeout(() => testUserMatch(0), 3000);
}

function testListUsers() {
  const options = {
    hostname: 'localhost',
    port,
    path: '/users',
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result GET /users:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}

function testAddUsers1() {
  const userData = JSON.stringify({ id: '0', name: 'John Wick', interests: ['soccer', 'golf'] },
  { id: '1', name: 'John White', interests: ['tenis', 'golf'] });

  const options = {
    hostname: 'localhost',
    port,
    path: '/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result POST /users:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.write(userData);
  req.end();
}

function testAddUsers2() {
  const userData = JSON.stringify({ id: '1', name: 'John White', interests: ['tenis', 'golf'] });

  const options = {
    hostname: 'localhost',
    port,
    path: '/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result POST /users:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.write(userData);
  req.end();
}

function testUserMatch(id) {
  const options = {
    hostname: 'localhost',
    port,
    path: `/matches/${id}`,
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log(`\n🧪 Test result PUT /matches/${id}:`);
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}
