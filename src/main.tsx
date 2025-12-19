import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Error boundary for debugging
const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Error: Root element not found</h1></div>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('App initialization error:', error);
    rootElement.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
      <h1>Error initializing app</h1>
      <pre>${error}</pre>
    </div>`;
  }
}
