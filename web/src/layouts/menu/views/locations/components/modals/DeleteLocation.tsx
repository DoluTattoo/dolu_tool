import { Button, Group, Stack, Text } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { useSetAtom } from 'jotai'
import { locationCustomFilterAtom } from '../../../../../../atoms/location'
import { fetchNui } from '../../../../../../utils/fetchNui'
import { useLocales } from '../../../../../../providers/LocaleProvider'

const DeleteLocation = (props: {name: string}) => {
  const { locale } = useLocales()
  const { name } = props
  const setCustomLocationCheckbox = useSetAtom(locationCustomFilterAtom)

  return (
    <Stack>
      <Text>{locale.ui_delete} '{name}' ?</Text>
      <Group grow>
        <Button
          tt='uppercase'
          variant='light'
          color='green.4'
          onClick={() => {
            closeAllModals()
            fetchNui('dolu_tool:deleteLocation', name)
            setCustomLocationCheckbox(true)
          }}
        >
          {locale.ui_confirm}
        </Button>
        <Button
          tt='uppercase'
          variant='light'
          color='red.4'
          onClick={() => {
            closeAllModals()
          }}
        >
          {locale.ui_cancel}
        </Button>
      </Group>
    </Stack>
  )
}

export default DeleteLocation
