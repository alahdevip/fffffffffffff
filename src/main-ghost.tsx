import React from 'react'
import ReactDOM from 'react-dom/client'
import { CreativeGhost } from './components/CreativeGhost.tsx'

ReactDOM.createRoot(document.getElementById('ghost-root')!).render(
    <React.StrictMode>
        <CreativeGhost />
    </React.StrictMode>,
)
