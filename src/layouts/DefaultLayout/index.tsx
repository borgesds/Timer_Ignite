// vamos importa o Outlet, ele que vai buscar os conteudos de Home e History
import { Outlet } from 'react-router-dom'
import { Headers } from '../../components/Header'
import { LayoutContainer } from './styles'

export function DefaultLayout() {
  return (
    <LayoutContainer>
      <Headers />
      {/* Outlet vai entrega tudo que for o Header para as rotas */}
      <Outlet />
    </LayoutContainer>
  )
}
