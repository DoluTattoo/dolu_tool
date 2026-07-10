import { Stack, Button, TextInput } from '@mantine/core'
import { closeAllModals } from '@mantine/modals'
import { useAtom } from 'jotai'
import { ObjectNameAtom } from '../../../../../../atoms/object'
import { fetchNui } from '../../../../../../utils/fetchNui'
import { useLocales } from '../../../../../../providers/LocaleProvider'

const AddEntity: React.FC = () => {
  const { locale } = useLocales()
  const [entityName, setEntityName] = useAtom(ObjectNameAtom)

  return (
    <Stack>
      <TextInput value={entityName} onChange={(e) => setEntityName(e.target.value)} />
      <Button
        tt='uppercase'
        disabled={entityName === ''}
        variant='light'
        color='blue.4'
        onClick={() => {
          closeAllModals()
          fetchNui('dolu_tool:addEntity', entityName)
        }}
      >
        {locale.ui_confirm}
      </Button>
    </Stack>
  )
}

export default AddEntity
