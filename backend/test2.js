async function test() {
  try {
    const email = "curl" + Date.now() + "@test.com"; // new registration
    const pwd = "pwd";
    
    // Register
    const regRes = await fetch('http://localhost:4000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email, password: pwd, nickname: "k"})
    });
    
    // Login
    const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email, password: pwd})
    });
    const { accessToken } = await loginRes.json();
    
    // Get Tags
    const res = await fetch('http://localhost:4000/api/v1/tags', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log("Status:", res.status);
    console.log("Tags:", await res.json());
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
