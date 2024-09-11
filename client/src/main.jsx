import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme'
import { RecoilRoot } from 'recoil'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
    <ChakraProvider theme={theme}>
      <App />
      </ChakraProvider>
    </RecoilRoot>
  </StrictMode>,
)
