import { Card, get } from 'theme-ui'
import styled from '@emotion/styled/macro'

export const PaymentCard = styled(Card)`
  background-color: ${({ theme }) => theme.colors?.white};

  box-shadow: ${({ theme }) => get(theme, 'shadows.large')};
  display: flex;
  flex-direction: column;
  padding: 0px;
  width: 300px;
  height: 600px;
`
