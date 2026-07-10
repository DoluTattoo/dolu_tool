import { MantineProvider } from '@mantine/core'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { customTheme } from './theme'
import { HashRouter } from 'react-router-dom'
import { ModalsProvider } from '@mantine/modals'
import { RecoilRoot } from 'recoil'
import LocaleProvider from './providers/LocaleProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <HashRouter>
        <MantineProvider withNormalizeCSS withGlobalStyles theme={customTheme}>
          <RecoilRoot>
            <ModalsProvider
              modalProps={{
                size: 'xs',
                transition: 'slide-up',
                // Modals would overflow the page with slide-up transition
                styles: { inner: { overflow: 'hidden' } },
              }}
            >
              <App />
            </ModalsProvider>
          </RecoilRoot>
        </MantineProvider>
      </HashRouter>
    </LocaleProvider>
  </React.StrictMode>
)
