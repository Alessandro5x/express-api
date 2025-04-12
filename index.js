const express = require('express');
const app = express();
const port = 3000;

let visitCount = 0;
// Visits counter and reset
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.get('/visits', (req, res) => {
  visitCount++;
  res.json({ visits: visitCount });
});

app.post('/reset', (req, res) => {
  visitCount = 0;
  res.json({ message: 'Counter reset successfully.', visitCount });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API running inside http://localhost:${port}`);
  });
}

async function testHello() {
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port,
    path: '/hello',
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result /hello:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', error => {
    console.error('Test error:', error);
  });

  req.end();
}

async function testVisits() {
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port,
    path: '/visits',
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result /visits:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', error => {
    console.error('Test error:', error);
  });

  req.end();
}


async function testReset() {
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port,
    path: '/reset',
    method: 'POST'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      console.log('\n🧪 Test result /visits:');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', error => {
    console.error('Test error:', error);
  });

  req.end();
}

setTimeout(testHello, 1000);
setTimeout(testVisits, 2000);
setTimeout(testReset, 3000);
