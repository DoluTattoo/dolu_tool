import { memo, useState } from 'react'
import { Paper, Stack, Divider, Collapse, UnstyledButton, Group, Text, Box } from '@mantine/core'
import { FiChevronRight } from 'react-icons/fi'
import { getInteriorData } from '../../../../../atoms/interior'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { CopyableRow, SectionHeader } from './PropertyRow'

// Format a number to a fixed amount of decimals (defaults to 3)
const fmt = (value: number | undefined, decimals = 3): string =>
  (value ?? 0).toFixed(decimals)

const InteriorElement: React.FC = memo(() => {
  const { locale } = useLocales()
  const interior = getInteriorData()
  const [showDetails, setShowDetails] = useState(false)

  const { position, rotation, extents } = interior

  const positionStr = position
    ? `${fmt(position.x)}, ${fmt(position.y)}, ${fmt(position.z)}`
    : undefined

  const rotationStr = rotation
    ? `${fmt(rotation.x, 4)}, ${fmt(rotation.y, 4)}, ${fmt(rotation.z, 4)}, ${fmt(rotation.w, 4)}`
    : undefined

  const minStr = extents
    ? `${fmt(extents.min.x)}, ${fmt(extents.min.y)}, ${fmt(extents.min.z)}`
    : undefined

  const maxStr = extents
    ? `${fmt(extents.max.x)}, ${fmt(extents.max.y)}, ${fmt(extents.max.z)}`
    : undefined

  const sizeStr = extents
    ? `${fmt(extents.max.x - extents.min.x)}, ${fmt(extents.max.y - extents.min.y)}, ${fmt(extents.max.z - extents.min.z)}`
    : undefined

  const hasDetails = Boolean(positionStr || rotationStr || extents)

  return (
    <Paper p='md'>
      <SectionHeader title={locale.ui_current_interior} />

      <Stack gap={1}>
        <CopyableRow
          label={locale.ui_interior_id}
          value={interior.interiorId}
          copyLabel={locale.ui_copy}
          copiedLabel={locale.ui_copied}
        />
        <CopyableRow
          label={locale.ui_room_count}
          value={interior.roomCount}
          copyLabel={locale.ui_copy}
          copiedLabel={locale.ui_copied}
        />
        <CopyableRow
          label={locale.ui_portal_count}
          value={interior.portalCount}
          copyLabel={locale.ui_copy}
          copiedLabel={locale.ui_copied}
        />

        {hasDetails &&
          <>
            <Divider my={4} variant='dashed' />

            <UnstyledButton
              onClick={() => setShowDetails((v) => !v)}
              className='dolu-hover-row'
              style={{
                width: '100%',
                borderRadius: 'var(--mantine-radius-sm)',
                padding: '1px 8px',
                transition: 'background-color 120ms ease',
              }}
            >
              <Group wrap='nowrap' gap={6} style={{ minHeight: 22 }}>
                <Box
                  style={{
                    display: 'flex',
                    color: 'var(--mantine-color-dark-2)',
                    transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <FiChevronRight size={14} />
                </Box>
                <Text size='xs' c='dimmed' fw={600} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {locale.ui_details}
                </Text>
              </Group>
            </UnstyledButton>

            <Collapse expanded={showDetails}>
              <Stack gap={1} pt={1}>
                {positionStr &&
                  <CopyableRow
                    label={locale.ui_position}
                    value={positionStr}
                    copyLabel={locale.ui_copy}
                    copiedLabel={locale.ui_copied}
                  />
                }
                {rotationStr &&
                  <CopyableRow
                    label={locale.ui_rotation}
                    value={rotationStr}
                    copyLabel={locale.ui_copy}
                    copiedLabel={locale.ui_copied}
                  />
                }
                {extents &&
                  <>
                    <Divider my={4} variant='dashed' />
                    <CopyableRow
                      label={locale.ui_extents_min}
                      value={minStr!}
                      copyLabel={locale.ui_copy}
                      copiedLabel={locale.ui_copied}
                    />
                    <CopyableRow
                      label={locale.ui_extents_max}
                      value={maxStr!}
                      copyLabel={locale.ui_copy}
                      copiedLabel={locale.ui_copied}
                    />
                    <CopyableRow
                      label={locale.ui_size}
                      value={sizeStr!}
                      copyLabel={locale.ui_copy}
                      copiedLabel={locale.ui_copied}
                    />
                  </>
                }
              </Stack>
            </Collapse>
          </>
        }
      </Stack>
    </Paper>
  )
});

// Add display name for debugging
InteriorElement.displayName = 'InteriorElement'

export default InteriorElement
