import { Button, Group, Stack, Text } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { fetchNui } from '../../../../../../utils/fetchNui'
import { useLocales } from '../../../../../../providers/LocaleProvider'

const DeleteAllEntities = () => {
  const { locale } = useLocales()

  return (
    <Stack>
      <Group grow>
        <Button
          tt='uppercase'
          variant='light'
          color='green.4'
          onClick={() => {
            closeAllModals()
            fetchNui('dolu_tool:deleteAllEntities')
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

export default DeleteAllEntities
