import { Box, Transition } from '@mantine/core'
import { useAtom, useSetAtom } from 'jotai'
import { Route, Routes } from 'react-router-dom'
import { useNuiEvent } from '../../hooks/useNuiEvent'
import { menuVisibilityAtom } from '../../atoms/visibility'
import { Version, versionAtom } from '../../atoms/version'
import { interiorAtom, InteriorData, timecycleAtom, timecycleListAtom, type TimecycleOption } from '../../atoms/interior'
import { lastLocationsAtom, Location } from '../../atoms/location'
import { positionAtom } from '../../atoms/position'
import { keybindsAtom, Keybind } from '../../atoms/keybinds'
import { fetchNui } from '../../utils/fetchNui'
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
import Settings from './views/settings'
import { useExitListener } from '../../hooks/useExitListener'
import { useMenuKeybinds } from '../../hooks/useMenuKeybinds'

const Menu: React.FC = () => {
  const [visible, setVisible] = useAtom(menuVisibilityAtom)
  const [version, setVersion] = useAtom(versionAtom)
  const setInteriorData = useSetAtom(interiorAtom)
  const setTimecycle = useSetAtom(timecycleAtom)
  const setTimecycleList = useSetAtom(timecycleListAtom)
  const setLastLocation = useSetAtom(lastLocationsAtom)
  const setPosition = useSetAtom(positionAtom)
  const [keybinds, setKeybinds] = useAtom(keybindsAtom)

  useExitListener(setVisible)
  useMenuKeybinds(visible, keybinds)

  useNuiEvent('setMenuVisible', (data: {version: Version, lastLocation: Location, position: string}) => {
    setVersion(data.version)
    setLastLocation(data.lastLocation)
    setPosition(data.position)
    setVisible(true)
    fetchNui<Keybind[]>('dolu_tool:getKeybinds').then((list) => {
      if (Array.isArray(list)) setKeybinds(list)
    })
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
        <Box className='dolu-menu-wrapper' style={style}>
          <HeaderGroup data={version} />
          <Box className='dolu-menu-body'>
            <Nav />
            <Box className='dolu-menu-main'>
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
                <Route path='/settings' element={<Settings />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      )}
    </Transition>
  )
}

export default Menu
