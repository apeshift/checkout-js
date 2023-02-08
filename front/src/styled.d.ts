import "theme-ui"
import { MyTheme } from '@src/theme'


declare module "theme-ui" {
  export interface Theme extends MyTheme {

  }
}

declare module '@emotion/react' {
  export interface Theme extends MyTheme {
  }
}
