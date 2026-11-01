import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import AuthProvider from './context/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
	<BrowserRouter>
		{/* Makes the logged-in user (or visitor) available to every page */}
		<AuthProvider>
			<App />
		</AuthProvider>
	</BrowserRouter>
  </StrictMode>,
)
