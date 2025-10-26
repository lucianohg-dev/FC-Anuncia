import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import App from './App'
import { AudioManagerProvider } from "./components/AudioManagerContext";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AudioManagerProvider>
    <App/>   
    </AudioManagerProvider> 
=======
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
>>>>>>> 62a59e325edfe376931a8777da984985a91909aa
  </StrictMode>,
)
