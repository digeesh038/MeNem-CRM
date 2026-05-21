// App entry point — mounts the React app onto the <div id="root"> in index.html
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// BrowserRouter enables URL-based routing (e.g. /customers, /settings)
// StrictMode helps catch bugs in development by double-rendering components
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
