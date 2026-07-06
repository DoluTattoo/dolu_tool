import { memo, useState } from 'react'
import { Text, Paper, Group, Space, Button } from '@mantine/core'
import { getInteriorData } from '../../../../../atoms/interior'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'
import { setClipboard } from '../../../../../utils/setClipboard'

// Memoized info row component
const InfoRow = memo(({ label, value }: { label: string, value: string | number | undefined }) => (
  <Group>
    <Text>{label}:</Text>
    <Text color='blue.4'>{value}</Text>
  </Group>
));

// Memoized current room display with locale prop
const CurrentRoomInfo = memo(({ room, locale }: { 
  room: { index?: number, name?: string } | undefined,
  locale: { ui_current_room: string }
}) => (
  <Group>
    <Text>{locale.ui_current_room}:</Text>
    <Text color='blue.4'>{room?.index} - {room?.name}</Text>
  </Group>
));

const InteriorElement: React.FC = memo(() => {
  const { locale } = useLocales()
  const interior = getInteriorData()
  const [copiedPos, setCopiedPos] = useState(false)

  const handleCopyInteriorPos = async () => {
    const pos = await fetchNui<{ x: number, y: number, z: number }>('dolu_tool:getInteriorPos')
    if (pos) {
      setClipboard(`${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}`)
      setCopiedPos(true)
      setTimeout(() => setCopiedPos(false), 1000)
    }
  }

  return (
    <Paper p='md'>
      <Text size={20} weight={600}>{locale.ui_current_interior}</Text>
      <Space h='xs' />
      <InfoRow label={locale.ui_interior_id} value={interior.interiorId} />
      <InfoRow label={locale.ui_room_count} value={interior.roomCount} />
      <InfoRow label={locale.ui_portal_count} value={interior.portalCount} />
      <CurrentRoomInfo room={interior.currentRoom} locale={locale} />
      <Space h='xs' />
      <Button
        color={copiedPos ? 'teal' : 'blue.4'}
        variant='light'
        size='xs'
        onClick={handleCopyInteriorPos}
      >{copiedPos ? locale.ui_copied_interior_pos : locale.ui_copy_interior_pos}</Button>
    </Paper>
  )
});

// Add display name for debugging
InteriorElement.displayName = 'InteriorElement'

export default InteriorElement
