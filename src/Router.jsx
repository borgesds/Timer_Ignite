// importar as rotas
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { DefaultLayout } from './layouts/DefaultLayout'

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
