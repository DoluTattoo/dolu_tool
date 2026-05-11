import { Button, Group, Paper, SimpleGrid, Space, Stack, Text } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { useState } from 'react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { FiFastForward } from 'react-icons/fi'
import { GiTeleport } from 'react-icons/gi'
import { RiHomeGearFill } from 'react-icons/ri'
import { useRecoilState } from 'recoil'
import { getInteriorData } from '../../../../atoms/interior'
import { getLastLocation } from '../../../../atoms/location'
import { playerCoordsSchema, positionAtom } from '../../../../atoms/position'
import { worldFreezeTimeAtom } from '../../../../atoms/world'
import { useNuiValidatedEvent } from '../../../../hooks/useNuiValidatedEvent'
import { useLocales } from '../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../utils/fetchNui'
import { setClipboard } from '../../../../utils/setClipboard'
import CreateLocation from '../locations/components/modals/CreateLocation'
import SetCoords from './modals/SetCoords'

const Home: React.FC = () => {
  const { locale } = useLocales()
  const lastLocation = getLastLocation()
  const interior = getInteriorData()
  const [currentCoords, setCurrentCoords] = useRecoilState(positionAtom)
  const [currentHeading, setCurrentHeading] = useState('0.000')
  const [timeFrozen, setTimeFrozen] = useRecoilState(worldFreezeTimeAtom)
  const [copiedCoords, setCopiedCoords] = useState(false)

  useNuiValidatedEvent('playerCoords', playerCoordsSchema, (data) => {
    setCurrentCoords(data.coords)
    setCurrentHeading(data.heading)
  })

  return (
    <SimpleGrid cols={1}>
      <Stack>
        {/* CURRENT COORDS */}
        <Paper p='md'>

          <Group position='apart'>
            <Text size={20} weight={600}>{locale.ui_current_coords}</Text>
            <FaMapMarkerAlt size={24}/>
          </Group>

          <Space h='sm' />

          <Stack spacing={0}>
            <Group><Text>{locale.ui_coords}:</Text><Text color='blue.4'>{currentCoords}</Text></Group>
            <Group><Text>{locale.ui_heading}:</Text><Text color='blue.4'>{currentHeading}</Text></Group>
          </Stack>

          <Space h='sm' />

          <Group grow spacing='xs'>
            <Button
              color={copiedCoords ? 'teal' : 'blue.4'}
              variant='light'
              size='xs'
              onClick={() => {
                setClipboard(currentCoords + ', ' + currentHeading)

                setCopiedCoords(true)
                setTimeout(() => {
                  setCopiedCoords(false)
                }, 1000)
              }}
            >{copiedCoords ? locale.ui_copied_coords : locale.ui_copy_coords}</Button>

            <Button
              color='blue.4'
              variant='light'
              size='xs'
              onClick={() =>
              openModal({
                  title: locale.ui_set_coords,
                  size: 'xs',
                  children: <SetCoords />,
                })
              }
            >{locale.ui_set_coords}</Button>

            <Button
              color='blue.4'
              variant='light'
              size='xs'
              onClick={() =>
                openModal({
                  title: locale.ui_save_location,
                  size: 'xs',
                  children: <CreateLocation />,
                })
              }
            >{locale.ui_save_location}</Button>
          </Group>
        </Paper>

        {/* LAST LOCATION */}
        <Paper p='md'>
          <Group position='apart'>
            <Text size={20} weight={600}>{locale.ui_last_location}</Text>
            <GiTeleport size={24} />
          </Group>

          <Space h='sm' />

          {
            lastLocation
            ?
              <>
                <Group><Text>{locale.ui_name}:</Text><Text color='blue.4' >{lastLocation.name}</Text></Group>

                <Group position='apart'>
                  <Group><Text>{locale.ui_coords}:</Text><Text color='blue.4' >{lastLocation.x}, {lastLocation.y}, {lastLocation.z}</Text></Group>
                  <Button
                    color='blue.4'
                    variant='light'
                    onClick={() =>
                      fetchNui('dolu_tool:teleport', { name: lastLocation.name, x: lastLocation.x, y: lastLocation.y, z: lastLocation.z, heading: lastLocation.heading })
                    }
                    value={lastLocation.name}
                  >
                    {locale.ui_teleport}
                  </Button>
                </Group>
              </>
            :
              <>
                <Space h='sm' />
                <Text color='dimmed'>{locale.ui_no_last_location}</Text>
              </>
          }
        </Paper>

        {/* CURRENT INTERIOR */}
        <Paper p='md'>
          <Group position='apart'>
            <Text size={20} weight={600}>{locale.ui_current_interior}</Text>
            <RiHomeGearFill size={24} />
          </Group>

          {
            interior.interiorId > 0
            ?
              <>
                <Group><Text>{locale.ui_interior_id}:</Text><Text color='blue.4' >{interior.interiorId}</Text></Group>
                <Group><Text>{locale.ui_current_room}:</Text><Text color='blue.4' >{interior.currentRoom?.index} - {interior.currentRoom?.name}</Text></Group>
              </>
            :
              <>
                <Space h='sm' />
                <Text color='dimmed'>{locale.ui_not_in_interior}</Text>
              </>
          }
        </Paper>

        {/* QUICK ACTIONS */}
        <Paper p='md'>
          <Group position='apart'>
            <Text size={20} weight={600}>{locale.ui_quick_actions}</Text>
            <FiFastForward size={24} />
          </Group>

          <Space h='sm' />

          <Group grow spacing='xs'>
            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:cleanZone', {})
              }
            >{locale.ui_clean_zone}</Button>

            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:cleanPed', {})
              }
            >{locale.ui_clean_ped}</Button>

            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:upgradeVehicle', {})
              }
            >{locale.ui_upgrade_vehicle}</Button>
          </Group>

          <Space h='sm' />

          <Group grow spacing='xs'>
            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:repairVehicle', {})
              }
            >{locale.ui_repair_vehicle}</Button>

            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:deleteVehicle', {})
              }
            >{locale.ui_delete_vehicle}</Button>

            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:setDay', {})
              }
            >{locale.ui_set_sunny_day}</Button>
          </Group>

          <Space h='sm' />

          <Group grow spacing='xs'>
            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:spawnFavoriteVehicle', {})
              }
            >{locale.ui_spawn_vehicle}</Button>

            <Button
              color='blue.4'
              variant='light'
              onClick={() =>
                fetchNui('dolu_tool:setMaxHealth', {})
              }
            >{locale.ui_max_health}</Button>

            <Button
              color={timeFrozen ? 'red.4' : 'blue.4'}
              variant='light'
              onClick={() => {
                setTimeFrozen(!timeFrozen)
                fetchNui('dolu_tool:freezeTime', !timeFrozen)
              }}
            >{timeFrozen ? locale.ui_time_freeze : locale.ui_time_not_freeze }</Button>
          </Group>
        </Paper>
      </Stack>
    </SimpleGrid>
  )
}

export default Home
