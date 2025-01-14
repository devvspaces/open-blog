import { extendTheme } from '@chakra-ui/react'
import '@fontsource/lato'

const theme = extendTheme({
  fonts: {
    heading: `'Lato', sans-serif`,
    body: `'Lato', sans-serif`,
  },
})

export default theme