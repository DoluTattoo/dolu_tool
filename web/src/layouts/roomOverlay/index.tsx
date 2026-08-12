import { memo, useEffect, useMemo } from 'react'
import { Box, Divider, Group, Text } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import { RiHomeGearFill } from 'react-icons/ri'
import { interiorAtom, roomOverlayEnabledAtom, timecycleListAtom, type TimecycleOption } from '../../atoms/interior'
import { fetchNui } from '../../utils/fetchNui'
import { useLocales } from '../../providers/LocaleProvider'

// A single "label over value" cell used inside the overlay bar
const Field = memo(({ label, value, mono, maxWidth }: {
  label: string
  value: React.ReactNode
  mono?: boolean
  maxWidth?: number
}) => (
  <Box style={{ minWidth: 0, maxWidth }}>
    <Text
      fz={9}
      fw={700}
      c='dimmed'
      tt='uppercase'
      style={{ letterSpacing: 0.5, lineHeight: 1.3 }}
    >
      {label}
    </Text>
    <Text
      fz='sm'
      fw={500}
      c='blue.4'
      title={typeof value === 'string' ? value : undefined}
      style={{
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...(mono ? { fontFamily: 'var(--mantine-font-family-monospace)' } : {}),
      }}
    >
      {value}
    </Text>
  </Box>
))
Field.displayName = 'RoomOverlayField'

// Optional, non-interactive overlay pinned at the top-center of the screen.
// It mirrors the current room infos so they stay visible without keeping the
// menu open. Purely informative: it never captures input (pointer-events off).
const RoomOverlay: React.FC = () => {
  const { locale } = useLocales()
  const [enabled, setEnabled] = useAtom(roomOverlayEnabledAtom)
  const interior = useAtomValue(interiorAtom)
  const [timecycleList, setTimecycleList] = useAtom(timecycleListAtom)
  const room = interior?.currentRoom

  // Load the persisted preference once (the client owns the source of truth).
  useEffect(() => {
    fetchNui<boolean>('dolu_tool:getRoomOverlay').then((state) => {
      setEnabled(state === true)
    })
  }, [setEnabled])

  // Pull the timecycle list so we can resolve names instead of raw hashes.
  // Right after a resource restart the server data may not be ready yet, so we
  // retry a few times until the list is populated (independent of the menu).
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const load = (attempt: number) => {
      fetchNui<TimecycleOption[]>('dolu_tool:getTimecycleList').then((list) => {
        if (cancelled) return
        if (Array.isArray(list) && list.length > 0) {
          setTimecycleList(list)
        } else if (attempt < 30) {
          timer = setTimeout(() => load(attempt + 1), 500)
        }
      })
    }

    load(0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [setTimecycleList])

  const timecycleName = useMemo(() => {
    if (!room?.timecycle) return '—'
    const hash = String(room.timecycle)
    return timecycleList.find((option) => option.value === hash)?.label ?? hash
  }, [room?.timecycle, timecycleList])

  if (!enabled || !interior || interior.interiorId <= 0 || !room || room.index <= 0) {
    return null
  }

  return (
    <Box className='dolu-room-overlay'>
      <Group gap={6} wrap='nowrap' justify='center' mb={5}>
        <RiHomeGearFill size={13} style={{ opacity: 0.6 }} />
        <Text fz={10} fw={700} c='dimmed' tt='uppercase' style={{ letterSpacing: 1 }}>
          {locale.ui_current_room}
        </Text>
      </Group>

      <Group gap='sm' wrap='nowrap' align='center' justify='center'>
        <Field label={locale.ui_index} value={room.index} mono />
        <Divider orientation='vertical' />
        <Field label={locale.ui_name} value={room.name} maxWidth={200} />
        <Divider orientation='vertical' />
        <Field label={locale.ui_flags} value={room.flags?.total ?? 0} mono />
        <Divider orientation='vertical' />
        <Field label={locale.ui_timecycle} value={timecycleName} maxWidth={240} />
      </Group>
    </Box>
  )
}

export default RoomOverlay
