import { useEffect } from 'react'
import { Button, Group, Paper, ScrollArea, Text } from '@mantine/core'
import { useAtom } from 'jotai'
import { pedEditorAtom, PedEditorState } from '../../../../../atoms/ped'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'
import PedAnimations from './PedAnimations'
import PedAppearance from './PedAppearance'

const PedEditorPanel: React.FC<{ view: string }> = ({ view }) => {
  const { locale } = useLocales()
  const [editor, setEditor] = useAtom(pedEditorAtom)

  const receive = (state: PedEditorState) => setEditor({
    ...state,
    // An empty Lua table may be serialized as an object instead of an array
    recentAnimations: Array.isArray(state.recentAnimations) ? state.recentAnimations : [],
  })

  const refresh = () => {
    fetchNui<PedEditorState>('dolu_tool:getPedEditor').then(receive)
  }

  useEffect(refresh, [])

  // Every editor action replies with the fresh state of the ped
  const apply = (action: string, payload?: object) =>
    fetchNui<PedEditorState>(`dolu_tool:${action}`, payload ?? {}).then(receive)

  if (!editor) return null

  return (
    <>
      <Paper p='xs'>
        <Group justify='space-between' wrap='nowrap'>
          <Text size='sm' fw={600} truncate>{editor.model}</Text>
          <Button size='xs' color='blue.4' onClick={refresh}>{locale.ui_refresh}</Button>
        </Group>
      </Paper>

      <ScrollArea style={{ flex: 1, minHeight: 0 }} scrollbarSize={6}>
        {view === 'appearance'
          ? <PedAppearance editor={editor} apply={apply} />
          : <PedAnimations editor={editor} apply={apply} />}
      </ScrollArea>
    </>
  )
}

export default PedEditorPanel
