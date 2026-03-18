import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import BriefPage from './pages/BriefPage'
import InsightsPage from './pages/InsightsPage'
import DeliveryPage from './pages/DeliveryPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/brief" element={<BriefPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="*" element={<Navigate to="/brief" replace />} />
      </Routes>
    </AppShell>
  )
}
