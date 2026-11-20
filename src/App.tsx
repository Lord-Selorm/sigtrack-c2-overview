import { Routes, Route, Navigate } from 'react-router-dom'
import Overview from '@/pages/Overview'

export default function App() {
  return (
    <Routes>
      <Route path="/overview" element={<Overview />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}
