'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './theme';

// Todo - test color mode

/** The providers for the app. */
const Providers = ({ children }: { children: React.ReactNode }) => (
  <CacheProvider>
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  </CacheProvider>
); 

export { Providers };