import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Tabs } from './components/tabs/Tabs.jsx'
import { appRoutes } from './routes.jsx'

function App() {
  return (
    <>
      <Tabs />

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          {appRoutes.map((route) => (
            <Route
              path={route.path}
              element={<h1>{route.title}</h1>}
              key={route.path}
            />
          ))}
        </Routes>
      </main>
    </>
  )
}

export default App
