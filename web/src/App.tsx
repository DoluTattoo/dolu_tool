import { Box } from '@mantine/core'
import { ThreeComponent } from './layouts/gizmo/ThreeComponent'
import ImgPreview from './layouts/imgPreview'
import Menu from './layouts/menu'
import { useGameControlListener } from './hooks/useGameControlListener'

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const App: React.FC = () => {
  useGameControlListener()

  return (
    <>
      <Box style={containerStyle}>
        <Menu />
        <ThreeComponent />
      </Box>
      <ImgPreview />
    </>
  )
}

export default App
