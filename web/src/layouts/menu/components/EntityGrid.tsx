import { Button, Center, Group, Image, Paper, ScrollArea, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { displayImageAtom, imagePathAtom } from '../../../atoms/imgPreview'
import { setClipboard } from '../../../utils/setClipboard'
import { useLocales } from '../../../providers/LocaleProvider'

export interface EntityGridItem {
  name: string
  hash?: number
}

interface EntityGridProps {
  items?: EntityGridItem[] | null
  getImageUrl: (name: string) => string
  primaryLabel: string
  onPrimary: (item: EntityGridItem) => void
  emptyText: string
}

// Neutral placeholder shown when an entity has no image on the CDN
const fallbackImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'
  )

const EntityGrid: React.FC<EntityGridProps> = ({ items, getImageUrl, primaryLabel, onPrimary, emptyText }) => {
  const { locale } = useLocales()
  const [selected, setSelected] = useState<EntityGridItem | null>(null)
  const [copied, setCopied] = useState<'name' | 'hash' | null>(null)

  const displayImage = useSetAtom(displayImageAtom)
  const imagePath = useSetAtom(imagePathAtom)

  // Page or search changed: the selected entry may no longer be displayed
  useEffect(() => {
    setSelected(null)
  }, [items])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(null), 1000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <>
      <ScrollArea style={{ flex: 1, minHeight: 0 }} scrollbarSize={6}>
        {items && items.length > 0 ? (
          <SimpleGrid cols={4} spacing='sm'>
            {items.map((item) => (
              <UnstyledButton
                key={item.name}
                className='dolu-grid-card'
                data-selected={selected?.name === item.name || undefined}
                onClick={() => setSelected(item)}
                onDoubleClick={() => onPrimary(item)}
                onMouseEnter={() => {
                  displayImage(true)
                  imagePath(getImageUrl(item.name))
                }}
                onMouseLeave={() => displayImage(false)}
              >
                <Image
                  h={56}
                  fit='contain'
                  draggable={false}
                  alt={item.name}
                  src={getImageUrl(item.name)}
                  fallbackSrc={fallbackImage}
                />
                <Text size='xs' fw={500} ta='center' w='100%' truncate>
                  {item.name}
                </Text>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        ) : (
          <Center h='100%' mih={200}>
            <Text size='md' fw={600} c='red.4'>{emptyText}</Text>
          </Center>
        )}
      </ScrollArea>

      <Paper p='xs'>
        <Group justify='space-between' wrap='nowrap'>
          <Stack gap={0} style={{ minWidth: 0 }}>
            {selected ? (
              <>
                <Text size='sm' fw={600} truncate>{selected.name}</Text>
                <Text size='xs' c='dimmed'>{locale.ui_hash}: {selected.hash ?? '-'}</Text>
              </>
            ) : (
              <Text size='sm' c='dimmed' fs='italic'>{locale.ui_no_selection}</Text>
            )}
          </Stack>
          <Group gap='xs' wrap='nowrap'>
            <Button
              size='xs'
              color={copied === 'name' ? 'teal' : 'blue.4'}
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                setClipboard(selected.name)
                setCopied('name')
              }}
            >
              {copied === 'name' ? locale.ui_copied_name : locale.ui_copy_name}
            </Button>
            <Button
              size='xs'
              color={copied === 'hash' ? 'teal' : 'blue.4'}
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                setClipboard(selected.hash !== undefined ? `${selected.hash}` : '')
                setCopied('hash')
              }}
            >
              {copied === 'hash' ? locale.ui_copied_hash : locale.ui_copy_hash}
            </Button>
            <Button
              size='xs'
              color='blue.4'
              disabled={!selected}
              onClick={() => selected && onPrimary(selected)}
            >
              {primaryLabel}
            </Button>
          </Group>
        </Group>
      </Paper>
    </>
  )
}

export default EntityGrid
