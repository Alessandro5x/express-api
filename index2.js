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

//  POST /users - Register a new user
app.post('/users', (req, res) => {
  const { id, name, interests } = req.body;
  // Basic input validation
  if (!id || !name || !Array.isArray(interests)) {
    return res.status(400).json({ error: 'id, name, and interests[] are required' });
  }
  // Prevent duplicate user ID
  if (users.some(u => u.id === id)) {
    return res.status(409).json({ error: 'User with this ID already exists' });
  }

  users.push({ id, name, interests });
  res.status(201).json({ message: 'User created successfully' });
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
  setTimeout(testAddUser1, 2000);
  setTimeout(testAddUser2, 2500);
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

function testAddUser1() {
  const userData = JSON.stringify({ id: '0', name: 'Francis Coppola', interests: ['soccer', 'golf'] });

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
      console.log('\n🧪 POST /users (User 0)');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.write(userData);
  req.end();
}

function testAddUser2() {
  const userData = JSON.stringify({ id: '1', name: 'Sarah Connor', interests: ['tenis', 'golf'] });

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
      console.log('\n🧪 POST /users (User 1)');
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
