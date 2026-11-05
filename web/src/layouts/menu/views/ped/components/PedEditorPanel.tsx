import { useEffect } from 'react'
import { Button, Center, Group, Paper, ScrollArea, Select, Text } from '@mantine/core'
import { useAtom } from 'jotai'
import { pedEditorAtom, PedEditorState, pedTargetAtom, PLAYER_TARGET } from '../../../../../atoms/ped'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'
import PedAnimations from './PedAnimations'
import PedAppearance from './PedAppearance'

const PedEditorPanel: React.FC<{ view: string }> = ({ view }) => {
  const { locale } = useLocales()
  const [editor, setEditor] = useAtom(pedEditorAtom)
  const [target, setTarget] = useAtom(pedTargetAtom)

  const receive = (state: PedEditorState) => {
    setEditor({
      ...state,
      // An empty Lua table may be serialized as an object instead of an array
      recentAnimations: Array.isArray(state.recentAnimations) ? state.recentAnimations : [],
    })
    setTarget(state.target)
  }

  const refresh = (id = target) => {
    fetchNui<PedEditorState>('dolu_tool:getPedEditor', id).then(receive)
  }

  useEffect(() => refresh(), [target])

  // Every editor action replies with the fresh state of the target
  const apply = (action: string, payload?: object) =>
    fetchNui<PedEditorState>(`dolu_tool:${action}`, { target, ...payload }).then(receive)

  if (!editor) return null

  const scenePed = editor.targets.find((item) => item.id === editor.target && item.id !== PLAYER_TARGET)

  return (
    <>
      <Paper p='xs'>
        <Group justify='space-between' wrap='nowrap' gap='xs'>
          <Select
            size='xs'
            style={{ flex: 1, minWidth: 0 }}
            aria-label={locale.ui_ped_target}
            allowDeselect={false}
            value={editor.target}
            data={editor.targets.map((item, index) => ({
              value: item.id,
              label: item.id === PLAYER_TARGET ? locale.ui_ped_target_player : `${index}. ${item.name}`,
            }))}
            onChange={(value) => value && setTarget(value)}
          />
          <Button size='xs' color='blue.4' onClick={() => refresh()}>{locale.ui_refresh}</Button>
        </Group>
        {scenePed && (
          <Group grow gap='xs' mt='xs'>
            <Button size='xs' color='blue.4' onClick={() => fetchNui('dolu_tool:setGizmoEntity', scenePed.id)}>{locale.ui_ped_move}</Button>
            <Button size='xs' color='blue.4' onClick={() => fetchNui('dolu_tool:snapEntityToGround', scenePed)}>{locale.ui_snap_to_ground}</Button>
            <Button size='xs' color='red.4' onClick={() => fetchNui('dolu_tool:deleteEntity', scenePed.id).then(() => setTarget(PLAYER_TARGET))}>{locale.ui_delete}</Button>
          </Group>
        )}
      </Paper>

      <ScrollArea style={{ flex: 1, minHeight: 0 }} scrollbarSize={6}>
        {view === 'appearance'
          ? <PedAppearance editor={editor} apply={apply} />
          : <PedAnimations editor={editor} apply={apply} target={target} />}
      </ScrollArea>

      {!scenePed && editor.targets.length === 1 && (
        <Center>
          <Text size='xs' c='dimmed'>{locale.ui_ped_target_hint}</Text>
        </Center>
      )}
    </>
  )
}

export default PedEditorPanel
