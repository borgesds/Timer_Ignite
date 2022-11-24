// importar as rotas
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { DefaultLayout } from './layouts/DefaultLayout'
import { History } from './pages/History'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* History */}
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  )
}
