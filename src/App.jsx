import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Tabs } from './components/tabs/tabs.jsx'

function App() {
  return (
    <>
      <Tabs />

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          <Route path="/banking" element={<h1>Banking</h1>} />
          <Route path="/telephone" element={<h1>Telephone</h1>} />
          <Route path="/accounting" element={<h1>Accounting</h1>} />
          <Route path="/verkout" element={<h1>Verkout</h1>} />
          <Route path="/statistics" element={<h1>Statistics</h1>} />
          <Route path="/administration" element={<h1>Administration</h1>} />
          <Route path="/post_office" element={<h1>Post Office</h1>} />
          <Route path="/help" element={<h1>Help</h1>} />
          <Route path="/warenbestand" element={<h1>Warenbestand</h1>} />
          <Route path="/test" element={<h1>Test</h1>} />
          <Route path="/reports" element={<h1>Reports</h1>} />
          <Route path="/orders" element={<h1>Orders</h1>} />
          <Route path="/customers" element={<h1>Customers</h1>} />
          <Route path="/settings" element={<h1>Settings</h1>} />
          <Route path="/calendar" element={<h1>Calendar</h1>} />
          <Route path="/messages" element={<h1>Messages</h1>} />
          <Route path="/inventory" element={<h1>Inventory</h1>} />
          <Route path="/analytics" element={<h1>Analytics</h1>} />
          <Route path="/profile" element={<h1>Profile</h1>} />
          <Route path="/archive" element={<h1>Archive</h1>} />
          <Route path="/test1" element={<h1>Test1</h1>} />
          <Route path="/test2" element={<h1>Test2</h1>} />
        </Routes>
      </main> 
    </>
  )
}

export default App
