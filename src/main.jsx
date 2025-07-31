
import { createRoot } from 'react-dom/client'
import { extendTheme, ChakraProvider } from '@chakra-ui/react'
import App from './App.jsx'

const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const theme = extendTheme({ colors })

createRoot(document.getElementById('root')).render(
 
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
 
)
