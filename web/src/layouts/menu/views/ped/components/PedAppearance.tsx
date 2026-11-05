import { useEffect, useState } from 'react'
import { Button, Group, NumberInput, Paper, Stack, Text } from '@mantine/core'
import { PedEditorState, PedVariation } from '../../../../../atoms/ped'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { setClipboard } from '../../../../../utils/setClipboard'
import { Row, SectionHeader } from '../../interior/components/PropertyRow'

const VariationInput: React.FC<{
  label: string,
  value: number,
  min: number,
  max: number,
  onChange: (value: number) => void,
}> = ({ label, value, min, max, onChange }) => (
  <NumberInput
    size='xs'
    aria-label={label}
    style={{ flex: 1, minWidth: 0 }}
    min={min}
    max={max}
    disabled={max <= min}
    clampBehavior='strict'
    allowDecimal={false}
    value={value}
    suffix={max > min ? ` / ${max}` : undefined}
    onChange={(input) => typeof input === 'number' && onChange(input)}
  />
)

const VariationRows: React.FC<{
  title: string,
  labelPrefix: string,
  variations: PedVariation[],
  minDrawable: number,
  onChange: (id: number, drawable: number, texture: number) => void,
}> = ({ title, labelPrefix, variations, minDrawable, onChange }) => {
  const { locale } = useLocales()

  return (
    <Paper p='sm'>
      <SectionHeader title={title} />
      <Stack gap={6}>
        <Row label=''>
          <Text size='xs' c='dimmed' style={{ flex: 1 }}>{locale.ui_ped_drawable}</Text>
          <Text size='xs' c='dimmed' style={{ flex: 1 }}>{locale.ui_ped_texture}</Text>
        </Row>
        {variations.map((variation) => {
          const label = locale[`${labelPrefix}${variation.id}`]

          return (
            <Row key={variation.id} label={label}>
              <VariationInput
                label={`${label} ${locale.ui_ped_drawable}`}
                value={variation.drawable}
                min={minDrawable}
                max={variation.drawableCount - 1}
                onChange={(drawable) => onChange(variation.id, drawable, 0)}
              />
              <VariationInput
                label={`${label} ${locale.ui_ped_texture}`}
                value={variation.texture}
                min={0}
                max={variation.textureCount - 1}
                onChange={(texture) => onChange(variation.id, variation.drawable, texture)}
              />
            </Row>
          )
        })}
      </Stack>
    </Paper>
  )
}

const PedAppearance: React.FC<{
  editor: PedEditorState,
  apply: (action: string, payload?: object) => Promise<void>,
}> = ({ editor, apply }) => {
  const { locale } = useLocales()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(timer)
  }, [copied])

  // Slots with a single variation have nothing to edit
  const components = editor.components.filter((item) => item.drawableCount > 1 || item.textureCount > 1)
  const props = editor.props.filter((item) => item.drawableCount > 0)

  const copyOutfit = () => {
    setClipboard(JSON.stringify({
      model: editor.model,
      components: editor.components.map(({ id, drawable, texture }) => ({ id, drawable, texture })),
      props: editor.props.filter((prop) => prop.drawable >= 0).map(({ id, drawable, texture }) => ({ id, drawable, texture })),
    }))
    setCopied(true)
  }

  return (
    <Stack gap='sm'>
      <Group grow gap='xs'>
        <Button size='xs' color='blue.4' onClick={() => apply('randomizePedAppearance')}>{locale.ui_ped_randomize}</Button>
        <Button size='xs' color='blue.4' onClick={() => apply('resetPedAppearance')}>{locale.ui_ped_reset}</Button>
        <Button size='xs' color={copied ? 'teal' : 'blue.4'} onClick={copyOutfit}>{copied ? locale.ui_copied : locale.ui_ped_copy_outfit}</Button>
      </Group>

      {components.length > 0 && (
        <VariationRows
          title={locale.ui_ped_components}
          labelPrefix='ui_ped_component_'
          variations={components}
          minDrawable={0}
          onChange={(id, drawable, texture) => apply('setPedComponent', { id, drawable, texture })}
        />
      )}

      {props.length > 0 && (
        <VariationRows
          title={locale.ui_ped_props}
          labelPrefix='ui_ped_prop_'
          variations={props}
          minDrawable={-1}
          onChange={(id, drawable, texture) => apply('setPedProp', { id, drawable, texture })}
        />
      )}
    </Stack>
  )
}

export default PedAppearance
