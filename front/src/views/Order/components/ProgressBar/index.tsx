import { Box, Progress, Text, Spinner, Flex } from 'theme-ui'
import styled from '@emotion/styled/macro'
import { variant } from 'styled-system'
import React from 'react'
import { ProgressBarProps, variants } from './types'

const TextContainer = styled(Box)`
  height: 100%;
  display: flex;
`

const Container = styled(Box)`
  position: relative;

  ${TextContainer} {
    height: 100%;
    width: 100%;
    position: absolute;
    align-items: center;
    display: flex;
    justify-content: space-between;
    top: 0;
  }
` 

const ProgressSpinner = styled(Spinner)`
  color: ${({ theme }) => theme.colors?.white};
  height: 100%;
  width: 20px;
`

const Description = styled(Text)`
  color: ${({ theme }) => theme.colors?.white};
`

const StyledProgress = styled(Progress)`
  height: 100%;
  border-radius: 0px;
  color: ${({ theme }) => theme?.colors?.green};
  background-color: ${({ theme }) => theme?.colors?.greens?.[1]};
  
  ${({ theme }) => variant({
    variants: {
      [variants.EXPIRED]: {
        bg: theme?.colors?.warning,
      },
      [variants.DEFAULT]: {

      },
      [variants.COMPLETED]: {
        bg: theme?.colors?.success,
      },
      [variants.ERROR]: {
        bg: theme?.colors?.failure,
        color: theme?.colors?.failure
      }
    }
  })}
`

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, max = 100, desc, counter, height = "40px", variant = "default"  
}) => {
  return (
    <Container sx={{ height }}>
      
      <StyledProgress variant={variant} value={value} max={max} />
      
      <TextContainer px={2}>
        <Flex sx={{ height: '100%', alignItems: 'center' }}>
          {variant === variants.DEFAULT && <ProgressSpinner  />} 
          <Description pl={2}>
            {desc}
          </Description>
        </Flex>

        <Description>
          {counter || `${Math.floor((value / max) * 100)} %`}  
        </Description>
      </TextContainer>

    </Container>
  )
}