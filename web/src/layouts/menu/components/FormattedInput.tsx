import { NumberInput } from '@mantine/core'
import { TbCurrencyDollar } from 'react-icons/tb'
import { useLocales } from '../../../providers/LocaleProvider'

interface Props {
  onChange: (value: number | undefined) => void
  value: number | undefined
  description?: string
}

const FormattedInput: React.FC<Props> = ({ value, onChange, description }) => {
  const { locale } = useLocales()

  return (
    <NumberInput
      label={locale.amount}
      value={value}
      onChange={(val) => onChange(typeof val === 'number' ? val : undefined)}
      hideControls
      description={description}
      leftSection={<TbCurrencyDollar size={20} />}
      thousandSeparator=','
    />
  )
}

export default FormattedInput
