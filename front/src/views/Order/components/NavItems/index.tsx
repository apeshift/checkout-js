import { NavLink } from 'theme-ui'
import { Flex, get } from 'theme-ui'
import styled from '@emotion/styled/macro'

export const NavItem = styled(NavLink)<{ active?: boolean }>`
  width: 100%;
  text-align: center;
  color: ${({ theme }) => theme.colors?.text};

  &:hover {
    border-bottom: 3px solid green;
    cursor: pointer;
    color: ${({ theme }) => theme.colors?.text};
  }

  &:visited, &:link {
  }

  ${({ active, theme }) => {
    return active? `
      background-color: ${theme.colors?.grey};
      border-bottom: 3px solid ${get(theme, 'colors.greens.1')};
    ` : ''
  }}
`

export const NavItems = styled(Flex)`
  position: relative;
  width: 100%;
  justify-content: space-between;
` 
