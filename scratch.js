async function test() {
  try {
    let response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'votranngocanh293@gmail.com', password: '1' })
    });
    
    if (!response.ok) {
        response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'votranngocanh293@gmail.com', password: '123456' })
        });
    }

    if (!response.ok) {
        console.log('Login failed', response.status);
        return;
    }
    
    const data = await response.json();
    const token = data.accessToken;
    console.log('Token:', token.substring(0, 20) + '...');

    const profileRes = await fetch('http://localhost:8080/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.log('Profile error 400. Text:', errorText);
    } else {
        const profileData = await profileRes.json();
        console.log('Profile success:', profileData);
    }
  } catch(e) {
      console.log('Exception:', e);
  }
}
test();
