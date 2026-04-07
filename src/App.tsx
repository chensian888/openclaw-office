import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import StarOfficePage from '@/pages/StarOffice'
import NotesPage from '@/pages/OpenClawNotes'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StarOfficePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/ops" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
