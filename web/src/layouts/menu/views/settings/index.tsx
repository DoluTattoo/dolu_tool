import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionIcon, Alert, Box, Button, Group, Kbd, Paper, SimpleGrid, Space, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { MdRefresh, MdWarningAmber } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import { useAtom } from 'jotai'
import { fetchNui } from '../../../../utils/fetchNui'
import { useLocales } from '../../../../providers/LocaleProvider'
import { keybindsAtom, Keybind } from '../../../../atoms/keybinds'
import { keybindCapture } from '../../../../utils/keybindCapture'
import { codeToKeyName, formatCombo } from '../../../../utils/keys'

// Locale keys for each bindable action. Keeps the UI order deterministic and
// decoupled from the order the client sends.
const ACTION_META: Record<string, { labelKey: string; descKey: string }> = {
  openMenu: { labelKey: 'ui_kb_open_menu', descKey: 'ui_kb_open_menu_desc' },
  toggleNoclip: { labelKey: 'ui_kb_toggle_noclip', descKey: 'ui_kb_toggle_noclip_desc' },
  teleportMarker: { labelKey: 'ui_kb_teleport_marker', descKey: 'ui_kb_teleport_marker_desc' },
  goback: { labelKey: 'ui_kb_goback', descKey: 'ui_kb_goback_desc' },
}

const Settings: React.FC = () => {
  const { locale } = useLocales()
  const [keybinds, setKeybinds] = useAtom(keybindsAtom)
  const [capturingName, setCapturingName] = useState<string | null>(null)
  const capturingRef = useRef<string | null>(null)

  // Load the current keybinds every time the tab is opened.
  useEffect(() => {
    fetchNui<Keybind[]>('dolu_tool:getKeybinds').then((list) => {
      if (Array.isArray(list)) setKeybinds(list)
    })
  }, [setKeybinds])

  const stopCapture = () => {
    capturingRef.current = null
    setCapturingName(null)
    keybindCapture.active = false
    fetchNui('dolu_tool:captureKeybind', false)
  }

  const startCapture = (name: string) => {
    capturingRef.current = name
    setCapturingName(name)
    keybindCapture.active = true
    fetchNui('dolu_tool:captureKeybind', true)
  }

  // While capturing, read the next key press (capture phase so it runs before
  // any other listener) and send it to the client.
  useEffect(() => {
    if (!capturingName) return

    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.code === 'Escape') {
        // Absorb the paired keyup so the exit listener doesn't close the menu.
        keybindCapture.swallowEscapeUp = true
        stopCapture()
        return
      }

      const key = codeToKeyName(e)
      if (!key) return // Unsupported key, keep waiting.

      // Ignore lone modifier presses: wait for the actual key of the combo.
      if (key === 'CTRL' || key === 'ALT' || key === 'SHIFT') return

      const parts: string[] = []
      if (e.ctrlKey) parts.push('CTRL')
      if (e.altKey) parts.push('ALT')
      if (e.shiftKey) parts.push('SHIFT')
      parts.push(key)
      const combo = parts.join('+')

      const name = capturingRef.current
      stopCapture()

      if (name) {
        fetchNui<Keybind[]>('dolu_tool:setKeybind', { name, key: combo }).then((list) => {
          if (Array.isArray(list)) setKeybinds(list)
        })
      }
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturingName])

  // Cancel any pending capture when leaving the tab.
  useEffect(() => {
    return () => {
      if (keybindCapture.active) {
        keybindCapture.active = false
        fetchNui('dolu_tool:captureKeybind', false)
      }
    }
  }, [])

  const resetKeybind = (name: string) => {
    fetchNui<Keybind[]>('dolu_tool:resetKeybind', { name }).then((list) => {
      if (Array.isArray(list)) setKeybinds(list)
    })
  }

  const unbindKeybind = (name: string) => {
    fetchNui<Keybind[]>('dolu_tool:setKeybind', { name, key: '' }).then((list) => {
      if (Array.isArray(list)) setKeybinds(list)
    })
  }

  const resetAll = () => {
    fetchNui<Keybind[]>('dolu_tool:resetAllKeybinds').then((list) => {
      if (Array.isArray(list)) setKeybinds(list)
    })
  }

  // Count how many actions share the same bound key to flag conflicts.
  const conflicts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const kb of keybinds) {
      if (kb.key) counts[kb.key] = (counts[kb.key] ?? 0) + 1
    }
    return counts
  }, [keybinds])

  const hasConflict = Object.values(conflicts).some((c) => c > 1)

  return (
    <SimpleGrid cols={1}>
      <Paper p='md'>
        <Group justify='space-between' align='center'>
          <Box>
            <Text fz={20} fw={600}>{locale.ui_keybinds}</Text>
            <Text fz='sm' c='dimmed'>{locale.ui_keybinds_description}</Text>
          </Box>
          <Button color='blue.4' variant='light' onClick={resetAll}>
            {locale.ui_reset_all}
          </Button>
        </Group>

        {hasConflict && (
          <>
            <Space h='sm' />
            <Alert color='yellow' variant='light' icon={<MdWarningAmber />} p='xs'>
              {locale.ui_keybind_conflict}
            </Alert>
          </>
        )}

        <Space h='md' />

        <Stack gap='xs'>
          {keybinds.map((kb) => {
            const meta = ACTION_META[kb.name]
            const label = meta ? locale[meta.labelKey] : kb.name
            const desc = meta ? locale[meta.descKey] : ''
            const isCapturing = capturingName === kb.name
            const isConflicting = !!kb.key && conflicts[kb.key] > 1
            const isDefault = kb.key === kb.default

            return (
              <Paper key={kb.name} px='md' py='sm' withBorder radius='md'>
                <Group justify='space-between' align='center' wrap='nowrap' gap='md'>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={500}>{label}</Text>
                    {desc && <Text fz='xs' c='dimmed'>{desc}</Text>}
                  </Box>

                  <Group gap={10} wrap='nowrap' style={{ flexShrink: 0 }}>
                    <UnstyledButton
                      onClick={() => (isCapturing ? stopCapture() : startCapture(kb.name))}
                      className='dolu-keybind-button'
                      data-capturing={isCapturing || undefined}
                      data-conflict={isConflicting || undefined}
                    >
                      {isCapturing ? (
                        <Text fz='sm' fw={500} c='yellow.5'>{locale.ui_press_key}</Text>
                      ) : kb.key ? (
                        <Group gap={4} wrap='nowrap' justify='center'>
                          {formatCombo(kb.key).map((part, i) => (
                            <Group key={i} gap={4} wrap='nowrap'>
                              {i > 0 && <Text fz='xs' c='dimmed'>+</Text>}
                              <Kbd>{part}</Kbd>
                            </Group>
                          ))}
                        </Group>
                      ) : (
                        <Text fz='sm' c='dimmed'>{locale.ui_unbound}</Text>
                      )}
                    </UnstyledButton>

                    <Group gap={4} wrap='nowrap'>
                      {kb.required ? (
                        // Keep the reset button aligned with the other rows.
                        <Box w={28} h={28} />
                      ) : (
                        <Tooltip label={locale.ui_unbind} position='top' withArrow>
                          <ActionIcon
                            size={28}
                            variant='subtle'
                            color='gray'
                            disabled={!kb.key || isCapturing}
                            onClick={() => unbindKeybind(kb.name)}
                          >
                            <IoClose fontSize={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      <Tooltip label={locale.ui_reset_to_default} position='top' withArrow>
                        <ActionIcon
                          size={28}
                          variant='subtle'
                          color='blue.4'
                          disabled={isDefault || isCapturing}
                          onClick={() => resetKeybind(kb.name)}
                        >
                          <MdRefresh fontSize={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Group>
              </Paper>
            )
          })}
        </Stack>
      </Paper>
    </SimpleGrid>
  )
}

export default Settings
