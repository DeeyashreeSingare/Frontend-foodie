import React from 'react';

function AppSimple() {
  return (
    <div style={{ padding: '50px', fontSize: '24px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>✅ React is Working!</h1>
      <p style={{ color: '#666', marginTop: '20px' }}>If you see this, React is rendering correctly.</p>
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Next Steps:</h2>
        <ul style={{ marginTop: '10px' }}>
          <li>Go to <a href="/test" style={{ color: '#1976d2' }}>/test</a> for test page</li>
          <li>Go to <a href="/login" style={{ color: '#1976d2' }}>/login</a> for login page</li>
        </ul>
      </div>
    </div>
  );
}

export default AppSimple;