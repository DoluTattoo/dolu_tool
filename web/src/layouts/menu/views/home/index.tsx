import { Button, Divider, Group, Paper, SimpleGrid, Space, Stack, Text } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { useState } from 'react'
import { useAtom } from 'jotai'
import { getInteriorData } from '../../../../atoms/interior'
import { getLastLocation } from '../../../../atoms/location'
import { positionAtom } from '../../../../atoms/position'
import { worldFreezeTimeAtom } from '../../../../atoms/world'
import { useNuiEvent } from '../../../../hooks/useNuiEvent'
import { useLocales } from '../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../utils/fetchNui'
import { setClipboard } from '../../../../utils/setClipboard'
import CreateLocation from '../locations/components/modals/CreateLocation'
import SetCoords from './modals/SetCoords'
import { CopyableRow, InfoRow, SectionHeader } from '../interior/components/PropertyRow'

const Home: React.FC = () => {
  const { locale } = useLocales()
  const lastLocation = getLastLocation()
  const interior = getInteriorData()
  const [currentCoords, setCurrentCoords] = useAtom(positionAtom)
  const [currentHeading, setCurrentHeading] = useState('0.000')
  const [timeFrozen, setTimeFrozen] = useAtom(worldFreezeTimeAtom)
  const [copiedCoords, setCopiedCoords] = useState(false)

  useNuiEvent('playerCoords', (data: { coords: string, heading: string }) => {
    setCurrentCoords(data.coords)
    setCurrentHeading(data.heading)
  })

  return (
    <SimpleGrid cols={1}>
      <Stack gap='sm'>
        {/* CURRENT COORDS */}
        <Paper p='md'>
          <SectionHeader title={locale.ui_current_coords} />

          <Stack gap={1}>
            <CopyableRow label={locale.ui_coords} value={currentCoords} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
            <CopyableRow label={locale.ui_heading} value={currentHeading} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
          </Stack>

          <Divider my={8} variant='dashed' />

          <Group grow gap='xs'>
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
          <SectionHeader title={locale.ui_last_location} />

          {lastLocation ? (
            <>
              <Stack gap={1}>
                <InfoRow label={locale.ui_name} value={lastLocation.name} />
                <CopyableRow
                  label={locale.ui_coords}
                  value={`${lastLocation.x}, ${lastLocation.y}, ${lastLocation.z}`}
                  copyLabel={locale.ui_copy}
                  copiedLabel={locale.ui_copied}
                />
              </Stack>

              <Divider my={8} variant='dashed' />

              <Button
                fullWidth
                color='blue.4'
                variant='light'
                onClick={() =>
                  fetchNui('dolu_tool:teleport', { name: lastLocation.name, x: lastLocation.x, y: lastLocation.y, z: lastLocation.z, heading: lastLocation.heading })
                }
              >
                {locale.ui_teleport}
              </Button>
            </>
          ) : (
            <Text c='dimmed' size='sm' px={8}>{locale.ui_no_last_location}</Text>
          )}
        </Paper>

        {/* CURRENT INTERIOR */}
        <Paper p='md'>
          <SectionHeader title={locale.ui_current_interior} />

          {interior.interiorId > 0 ? (
            <Stack gap={1}>
              <CopyableRow label={locale.ui_interior_id} value={interior.interiorId} copyLabel={locale.ui_copy} copiedLabel={locale.ui_copied} />
              <InfoRow label={locale.ui_current_room} value={`${interior.currentRoom?.index} - ${interior.currentRoom?.name}`} />
            </Stack>
          ) : (
            <Text c='dimmed' size='sm' px={8}>{locale.ui_not_in_interior}</Text>
          )}
        </Paper>

        {/* QUICK ACTIONS */}
        <Paper p='md'>
          <SectionHeader title={locale.ui_quick_actions} />

          <Group grow gap='xs'>
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

          <Group grow gap='xs'>
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

          <Group grow gap='xs'>
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
