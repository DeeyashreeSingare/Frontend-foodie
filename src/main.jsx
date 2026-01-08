import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Main.jsx loaded');
console.log('React version:', React.version);

// Add visible indicator that JS is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('Root element found');
  } else {
    console.error('Root element not found!');
    document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found!</h1></div>';
    return;
  }
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  console.log('Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering App...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  console.error('Error stack:', error.stack);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1>Error Rendering App</h1>
        <p><strong>Message:</strong> ${error.message}</p>
        <p><strong>Check browser console for details</strong></p>
        <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; overflow: auto;">${error.stack}</pre>
      </div>
    `;
  }
}