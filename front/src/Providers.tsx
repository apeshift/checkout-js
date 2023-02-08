import React from "react";
import { ThemeProvider } from "theme-ui";
import { RefreshContextProvider } from '@src/contexts/RefreshContext'
import { theme } from '@src/theme'

const Providers:React.FC<any> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <RefreshContextProvider>
        {children}
      </RefreshContextProvider>
    </ThemeProvider>
  )
}

export default Providers