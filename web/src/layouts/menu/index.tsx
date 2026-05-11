import { AppShell, Box, createStyles, Transition } from '@mantine/core'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Route, Routes } from 'react-router-dom'
import { useNuiValidatedEvent } from '../../hooks/useNuiValidatedEvent'
import { menuVisibilityAtom, menuVisiblePayloadSchema } from '../../atoms/visibility'
import { versionAtom } from '../../atoms/version'
import { interiorAtom, interiorDataSchema, timecycleAtom, timecycleListAtom, timecycleOptionSchema } from '../../atoms/interior'
import { lastLocationsAtom, locationSchema } from '../../atoms/location'
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
import { debugData } from '../../utils/debugData'
import { useExitListener } from '../../hooks/useExitListener'

debugData([
  {
    action: 'setMenuVisible',
    data: {
      version: "5.0.0",
      lastLocation: {
        name: "Custom Location test 1",
        x: 12,
        y: 11,
        z: 10
      },
      position: "10, 20, 30"
    }
  },
  {
    action: 'setLastLocation',
    data: {
      name: "Custom Location test 2",
      x: 12,
      y: 11,
      z: 10,
      heading: 150,
      custom: true,
      isLastLocationUsed: true
    }
  },
  {
    action: 'setIntData',
    data: {
      interiorId: 123456,
      roomCount: 3,
      portalCount: 3,
      rooms: [
          {
            index: 1,
            name: 'Room_1',
            timecycle: '0',
            flags: {
                list: ['32', '64'],
                total: 96
            }
          },
          {
            index: 2,
            name: 'Room_2',
            timecycle: '0',
            isCurrent: true,
            flags: {
              list: ['32', '64'],
              total: 96
            }
          },
          {
            index: 3,
            name: 'Room_3',
            timecycle: '0',
            flags: {
                list: ['32', '64'],
                total: 96
            }
          }
        ],
      portals: [
          {
            index: 0,
            roomFrom: 1,
            roomTo: 0,
            flags: {
                list: [32, 64],
                total: 96
            }
          },
          {
            index: 1,
            roomFrom: 2,
            roomTo: 1,
            flags: {
                list: [32, 64],
                total: 96
            }
          },
          {
            index: 2,
            roomFrom: 3,
            roomTo: 2,
            flags: {
                list: [32, 64],
                total: 96
            }
          }
      ],
      currentRoom: {
          index: 2,
          name: 'Room_2',
          timecycle: '0',
          flags: {
              list: [32, 64],
              total: 96
          }
      }
    }
  }
])

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

  useNuiValidatedEvent('setMenuVisible', menuVisiblePayloadSchema, (data) => {
    setVersion(data.version)
    setLastLocation(data.lastLocation)
    setPosition(data.position)
    setVisible(true)
  })

  useNuiValidatedEvent('setLastLocation', locationSchema, (data) => {
    setLastLocation(data)
  })

  useNuiValidatedEvent('setIntData', interiorDataSchema, (data) => {
    setInteriorData(data)
    if (data.currentRoom !== undefined) setTimecycle(data.currentRoom.timecycle)
  })

  useNuiValidatedEvent('setTimecycleList', timecycleOptionSchema.array(), (data) => {
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
