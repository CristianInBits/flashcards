import { Route, Routes } from 'react-router'

import { AppShell } from '../ui/AppShell'
import { DecksPage } from '../features/decks/DecksPage'
import { DeckPage } from '../features/decks/DeckPage'
import { CardEditorPage } from '../features/editor/CardEditorPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DecksPage />} />
        <Route path="mazo/:deckId" element={<DeckPage />} />
        {/* La ruta estática gana a la dinámica, así que «nueva» no se confunde con un id */}
        <Route path="mazo/:deckId/carta/nueva" element={<CardEditorPage />} />
        <Route path="mazo/:deckId/carta/:cardId" element={<CardEditorPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="*" element={<DecksPage />} />
      </Route>
    </Routes>
  )
}
