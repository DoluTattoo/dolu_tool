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
      onChange={onChange}
      hideControls
      description={description}
      icon={<TbCurrencyDollar size={20} />}
      parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
      formatter={(value) => (value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
    />
  )
}

export default FormattedInput
