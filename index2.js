const express = require('express');
const http = require('http');
const app = express();
const port = 3000;

app.use(express.json());

// In-memory user storage
let users = [];

// GET /users - List all users
app.get('/users', (req, res) => {
  res.json(users);
});

// POST /users - Register a new user
app.post('/users', (req, res) => {
  let data = req.body;

  // Allow single object or array of objects
  if (!Array.isArray(data)) {
    data = [data];
  }

  const addedUsers = [];
  const errors = [];

  for (const user of data) {
    const { id, name, interests } = user;

    if (!id || !name || !Array.isArray(interests)) {
      errors.push({ id, error: 'Invalid user format: id, name, and interests[] are required' });
      continue;
    }

    if (users.some(u => u.id === id)) {
      errors.push({ id, error: 'User with this ID already exists' });
      continue;
    }

    users.push({ id, name, interests });
    addedUsers.push({ id, name });
  }

  res.status(201).json({
    message: 'Processed user creation',
    addedUsers,
    errors
  });
});


// GET /matches/:id - Return users with at least one common interest
app.get('/matches/:id', (req, res) => {
  const id = req.params.id;
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userInterests = new Set(user.interests);

  const matches = users
    .filter(u => u.id !== id)
    .map(u => {
      const commonInterests = u.interests.filter(i => userInterests.has(i));
      if (commonInterests.length > 0) {
        return {
          name: u.name,
          matchedInterests: commonInterests
        };
      }
      return null;
    })
    .filter(Boolean);

  res.json({ matches });
});


// Start the server and trigger tests
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });

  setTimeout(testListUsers, 1000);
  setTimeout(testAddUsers, 2000);
  setTimeout(testListUsers, 3000);
  setTimeout(() => testUserMatch('0'), 3500);
}

// ---------- MANUAL TEST FUNCTIONS ----------

function testListUsers() {
  const options = {
    hostname: 'localhost',
    port,
    path: '/users',
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\n🧪 GET /users');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}

function testAddUsers() {
  const userData = JSON.stringify([
    { id: '0', name: 'Francis Coppola', interests: ['soccer', 'golf'] },
    { id: '1', name: 'Sarah Connor', interests: ['tennis', 'golf'] }
  ]);

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
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\n🧪 POST /users (Batch Add)');
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
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n🧪 GET /matches/${id}`);
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}
