import { Routes, Route, Navigate } from 'react-router-dom'
import { LensProvider } from './context/LensContext'
import AppShell from './components/layout/AppShell'
import BriefPage from './pages/BriefPage'
import InsightsPage from './pages/InsightsPage'
import DeliveryPage from './pages/DeliveryPage'

export default function App() {
  return (
    <LensProvider>
      <AppShell>
        <Routes>
          <Route path="/brief" element={<BriefPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="*" element={<Navigate to="/brief" replace />} />
        </Routes>
      </AppShell>
    </LensProvider>
  )
}
