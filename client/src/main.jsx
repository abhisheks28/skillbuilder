import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './globals.css' // We will ensure this exists/moves

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
