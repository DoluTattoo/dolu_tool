import { AppShell, Box, createStyles, Transition } from '@mantine/core'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Route, Routes } from 'react-router-dom'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import { menuVisibilityAtom } from '../../atoms/visibility'
import { Version, versionAtom } from '../../atoms/version'
import { interiorAtom, InteriorData, timecycleAtom, timecycleListAtom, type TimecycleOption } from '../../atoms/interior'
import { lastLocationsAtom, Location } from '../../atoms/location'
import { positionAtom } from '../../atoms/position'
import HeaderGroup from './components/HeaderGroup'
import Nav from './components/Nav'
import Home from './views/home'
import World from './views/world'
import Interior from './views/interior'
import Object from './views/object'
import Locations from './views/locations'
import Ped from './views/ped'
import Vehicle from './views/vehicle'
import Weapon from './views/weapon'
import Audio from './views/audio'
import { useExitListener } from '../../hooks/useExitListener'

const useStyles = createStyles((theme) => ({
  wrapper: {
    width: 600,
    height: 775,
    color: theme.colors.dark[1],
  },
}))

const Menu: React.FC = () => {
  const { classes } = useStyles()
  const [visible, setVisible] = useRecoilState(menuVisibilityAtom)
  const [version, setVersion] = useRecoilState(versionAtom)
  const setInteriorData = useSetRecoilState(interiorAtom)
  const setTimecycle = useSetRecoilState(timecycleAtom)
  const setTimecycleList = useSetRecoilState(timecycleListAtom)
  const setLastLocation = useSetRecoilState(lastLocationsAtom)
  const setPosition = useSetRecoilState(positionAtom)

  useExitListener(setVisible)

  useNuiEvent('setMenuVisible', (data: {version: Version, lastLocation: Location, position: string}) => {
    setVersion(data.version)
    setLastLocation(data.lastLocation)
    setPosition(data.position)
    setVisible(true)
  })

  useNuiEvent('setLastLocation', (data: Location) => {
    setLastLocation(data)
  })

  useNuiEvent('setIntData', (data: InteriorData) => {
    setInteriorData(data)
    if (data.currentRoom !== undefined) setTimecycle(data.currentRoom.timecycle)
  })

  useNuiEvent('setTimecycleList', (data: TimecycleOption[]) => {
    setTimecycleList(data)
  })

  return (
    <Transition duration={100} transition='slide-right' mounted={visible}>
      {(style) => (
        <Box sx={{ position: 'absolute', top: '2%', left: '1.5%', zIndex: 3 }} style={style} className={classes.wrapper}>
          <AppShell
            padding='md'
            fixed={false}
            navbar={<Nav />}
            header={<HeaderGroup data={version} />}
            styles={{
              main: {
                height: 775,
                maxHeight: 775,
                overflowY: 'auto',
                overflowX: 'hidden',
                minWidth: 0,
              },
            }}
          >
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/world' element={<World />} />
              <Route path='/interior' element={<Interior />} />
              <Route path='/object' element={<Object />} />
              <Route path='/locations' element={<Locations />} />
              <Route path='/ped' element={<Ped />} />
              <Route path='/vehicle' element={<Vehicle />} />
              <Route path='/weapon' element={<Weapon />} />
              <Route path='/audio' element={<Audio />} />
            </Routes>
          </AppShell>
        </Box>
      )}
    </Transition>
  )
}

export default Menu
