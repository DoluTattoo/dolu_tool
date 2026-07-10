import { memo, useCallback, useEffect, useState } from 'react'
import { ActionIcon, Box, Checkbox, Group, Popover, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { AiFillEdit } from 'react-icons/ai'
import { setClipboard } from '../../../../../utils/setClipboard'
import { FlagOption, flagsToValues } from './flags'

// Shared width so every label lines up into a tidy column across all interior cards
export const LABEL_WIDTH = 96
const ROW_MIN_HEIGHT = 23

// Dimmed, fixed-width label used by every row so values align vertically
export const Label = memo(({ children }: { children: React.ReactNode }) => (
  <Text
    size='sm'
    c='dimmed'
    style={{ minWidth: LABEL_WIDTH, flexShrink: 0, whiteSpace: 'nowrap' }}
  >
    {children}
  </Text>
));
Label.displayName = 'Label'

// Section header: title + optional accent icon, consistent across every card
export const SectionHeader = memo(({ title, icon }: {
  title: string,
  icon?: React.ReactNode
}) => (
  <Group justify='space-between' wrap='nowrap' mb={6}>
    <Text fz={18} fw={600}>{title}</Text>
    {icon && <Box style={{ display: 'flex', flexShrink: 0, opacity: 0.6 }}>{icon}</Box>}
  </Group>
));
SectionHeader.displayName = 'SectionHeader'

// Aligned row: a label column followed by arbitrary content (values or controls)
export const Row = memo(({ label, children, minHeight = ROW_MIN_HEIGHT }: {
  label: React.ReactNode,
  children: React.ReactNode,
  minHeight?: number
}) => (
  <Group wrap='nowrap' gap='xs' px={8} style={{ minHeight }}>
    <Label>{label}</Label>
    {children}
  </Group>
));
Row.displayName = 'Row'

// Plain, read-only value row
export const InfoRow = memo(({ label, value, monospace, color = 'blue.4' }: {
  label: string,
  value: React.ReactNode,
  monospace?: boolean,
  color?: string
}) => (
  <Row label={label}>
    <Text
      size='sm'
      c={color}
      style={monospace ? { fontFamily: 'var(--mantine-font-family-monospace)' } : undefined}
    >
      {value}
    </Text>
  </Row>
));
InfoRow.displayName = 'InfoRow'

// Clickable value with copy feedback. Flexes to fill the row so it can sit next
// to a trailing control (edit / flip / ...) while staying copyable.
export const CopyableValue = memo(({ value, copyLabel, copiedLabel, monospace = true, color = 'blue.4' }: {
  value: string | number | undefined,
  copyLabel: string,
  copiedLabel: string,
  monospace?: boolean,
  color?: string
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    setClipboard(String(value ?? ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }, [value])

  return (
    <Tooltip
      label={copied ? copiedLabel : copyLabel}
      withArrow
      position='left'
      openDelay={300}
      color={copied ? 'teal' : 'dark'}
    >
      <UnstyledButton
        onClick={handleCopy}
        className='dolu-hover-row'
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: 'var(--mantine-radius-sm)',
          padding: '1px 6px',
          transition: 'background-color 120ms ease',
        }}
      >
        <Text
          size='sm'
          c={copied ? 'teal.4' : color}
          style={{
            minWidth: 0,
            wordBreak: 'break-word',
            ...(monospace ? { fontFamily: 'var(--mantine-font-family-monospace)' } : {}),
          }}
        >
          {value}
        </Text>
      </UnstyledButton>
    </Tooltip>
  )
});
CopyableValue.displayName = 'CopyableValue'

// Copyable value row: a label column + a clickable, copyable value.
// Pass `rightSection` to add a trailing control (kept outside the copy target).
export const CopyableRow = memo(({ label, value, copyLabel, copiedLabel, monospace = true, color = 'blue.4', rightSection }: {
  label: string,
  value: string | number | undefined,
  copyLabel: string,
  copiedLabel: string,
  monospace?: boolean,
  color?: string,
  rightSection?: React.ReactNode
}) => (
  <Row label={label}>
    <CopyableValue
      value={value}
      copyLabel={copyLabel}
      copiedLabel={copiedLabel}
      monospace={monospace}
      color={color}
    />
    {rightSection}
  </Row>
));
CopyableRow.displayName = 'CopyableRow'

// A flag total that is both copyable and editable through a checkbox popover.
// The checkbox state is derived from `total`, so it always reflects the game.
export const FlagRow = memo(({ label, total, options, onChange, copyLabel, copiedLabel }: {
  label: string,
  total: number | undefined,
  options: FlagOption[],
  onChange: (values: string[]) => void,
  copyLabel: string,
  copiedLabel: string
}) => {
  const [selected, setSelected] = useState<string[]>(() => flagsToValues(options, total))

  useEffect(() => {
    setSelected(flagsToValues(options, total))
  }, [options, total])

  const handleChange = useCallback((values: string[]) => {
    setSelected(values)
    onChange(values)
  }, [onChange])

  return (
    <Row label={label}>
      <CopyableValue value={total} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      <Popover position='right-start' withArrow shadow='md'>
        <Popover.Target>
          <ActionIcon size='md' variant='default' style={{ flexShrink: 0 }}>
            <AiFillEdit fontSize={16} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown p='sm'>
          <Checkbox.Group
            size='sm'
            value={selected}
            onChange={handleChange}
          >
            <Stack gap={8}>
              {options.map((o) => (
                <Checkbox
                  key={o.value}
                  color='blue.4'
                  value={o.value}
                  label={`${o.value} - ${o.label}`}
                  styles={{ label: { whiteSpace: 'nowrap' } }}
                />
              ))}
            </Stack>
          </Checkbox.Group>
        </Popover.Dropdown>
      </Popover>
    </Row>
  )
});
FlagRow.displayName = 'FlagRow'
