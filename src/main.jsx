import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AudioManagerProvider } from "./components/AudioManagerContext";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AudioManagerProvider>
    <App/>   
    </AudioManagerProvider> 
  </StrictMode>,
)
