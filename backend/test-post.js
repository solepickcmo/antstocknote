const http = require('http');

const postData = JSON.stringify({
  ticker: '005930',
  name: '삼성전자',
  type: 'buy',
  price: 70000,
  quantity: 10,
  tradedAt: new Date().toISOString(),
  strategyTag: '#테스트',
  isPublic: false
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/trades',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  },
  (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', rawData);
    });
  }
);

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
