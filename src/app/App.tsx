import { Route, Routes } from 'react-router'

import { AppShell } from '../ui/AppShell'
import { DecksPage } from '../features/decks/DecksPage'
import { DeckPage } from '../features/decks/DeckPage'
import { CardEditorPage } from '../features/editor/CardEditorPage'
import { ImportPage } from '../features/import/ImportPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { StatsPage } from '../features/stats/StatsPage'
import { StudyPage } from '../features/study/StudyPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DecksPage />} />
        {/* Sin mazo: sesión con las cartas vencidas de todos */}
        <Route path="estudiar" element={<StudyPage />} />
        <Route path="mazo/:deckId" element={<DeckPage />} />
        <Route path="mazo/:deckId/estudiar" element={<StudyPage />} />
        {/* Sin mazo: el importador pregunta el destino y puede crearlo */}
        <Route path="importar" element={<ImportPage />} />
        {/* Práctica libre: el mazo entero, sin escribir nada */}
        <Route path="mazo/:deckId/practicar" element={<StudyPage mode="practice" />} />
        {/* La ruta estática gana a la dinámica, así que «nueva» no se confunde con un id */}
        <Route path="mazo/:deckId/importar" element={<ImportPage />} />
        <Route path="mazo/:deckId/carta/nueva" element={<CardEditorPage />} />
        <Route path="mazo/:deckId/carta/:cardId" element={<CardEditorPage />} />
        <Route path="estadisticas" element={<StatsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="*" element={<DecksPage />} />
      </Route>
    </Routes>
  )
}
