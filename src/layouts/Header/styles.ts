import styled from 'styled-components'

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    color: ${(props) => props.theme['green-500']};
    display: flex;
    align-items: center;
    font-size: 2rem;
    font-weight: bold;

    span {
      color: ${(props) => props.theme['green-500']};
      text-shadow: 1px 2px 5px ${(props) => props.theme['gray-900']};
    }
  }

  nav {
    display: flex;
    gap: 0.5rem;

    a {
      height: 3rem;
      width: 3rem;

      display: flex;
      justify-content: center;
      align-items: center;

      color: ${(props) => props.theme['gray-100']};

      border-top: 3px solid transparent;
      border-bottom: 3px solid transparent;

      &:hover {
        border-bottom: 3px solid ${(props) => props.theme['green-500']};
      }

      /* se tiver ativo o link ele fica verde */
      &.active {
        color: ${(props) => props.theme['green-500']};
      }
    }
  }
`
