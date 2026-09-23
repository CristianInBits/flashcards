import { Route, Routes } from 'react-router'

import { AppShell } from '../ui/AppShell'
import { DecksPage } from '../features/decks/DecksPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DecksPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="*" element={<DecksPage />} />
      </Route>
    </Routes>
  )
}
