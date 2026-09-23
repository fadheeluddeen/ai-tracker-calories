import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {installGlassPointer} from './utils/glassPointer';
import {installAutoUpdate} from './utils/autoUpdate';

installGlassPointer();
installAutoUpdate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
