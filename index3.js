const express = require('express');
const https = require('https');
const http = require('http');
const app = express();
const port = 3000;

app.use(express.json());

let activity = [];
let companyList = [];
let counter = 0;
let current 

app.get('/activity', (req, res) => {
  res.json(activity);
});


app.get('/ticker/:ticker', (req, res) => {
  const tickerParam = req.params.ticker.toUpperCase();
  counter++;

  const match = companyList.find(c => c.ticker === tickerParam);

  if (!match) {
    return res.status(404).json({ error: 'Ticker not found' });
  }
  
  activity.push(tickerParam, counter)

  res.json(match);
});

function getResponse() {
  const url = 'https://www.sec.gov/files/company_tickers_exchange.json';
  const options = {
    headers: {
      'User-Agent': 'John Doe (test@example.com)',
    },
  };

  https.get(url, options, (res) => {
    let apiData = '';

    res.on('data', chunk => apiData += chunk);

    res.on('end', () => {
      console.log(`\n🧪 GET gov API`);
      console.log('Status Code:', res.statusCode);

      try {
        const parsed = JSON.parse(apiData);
        const fields = parsed.fields; // ["cik", "name", "ticker", "exchange"]
        const rawData = parsed.data;  // array de arrays

        companyList = rawData.map(entry => {
          const obj = {};
          fields.forEach((field, index) => {
            const value = entry[index];
            if ((field === 'ticker' || field === 'exchange') && typeof value === 'string') {
              obj[field] = value.toUpperCase();
            } else {
              obj[field] = value;
            }
          });
          return obj;
        });


        console.log(`Loaded ${companyList.length} companies from SEC.`);
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    });
  }).on('error', console.error);
}

function testListActivity() {
  const options = {
    hostname: 'localhost',
    port,
    path: '/activity',
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\n🧪 GET /activity');
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}

function testGetCompanyInfo(ticker) {
  const options = {
    hostname: 'localhost',
    port,
    path: `/ticker/${ticker}`,
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n🧪 GET /ticker/${ticker}`);
      console.log('Status Code:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.end();
}

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
  });

  setTimeout(getResponse, 1000);
  setTimeout(testListActivity, 1500);
  setTimeout(() => testGetCompanyInfo('AMZN'), 2000);
  setTimeout(testListActivity, 3000);
}
