import { useEffect, useState } from 'react'
import { Accordion, ActionIcon, Button, Center, Checkbox, ColorInput, Group, NumberInput, Paper, ScrollArea, Select, SimpleGrid, Stack, Switch, Text, TextInput, Tooltip } from '@mantine/core'
import { useDebouncedCallback } from '@mantine/hooks'
import { useAtom } from 'jotai'
import { TbX } from 'react-icons/tb'
import { RgbColour, vehicleCustomizationAtom, VehicleColours, VehicleCustomization, VehicleMod } from '../../../../../atoms/vehicle'
import { useNuiEvent } from '../../../../../hooks/useNuiEvent'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'
import { setClipboard } from '../../../../../utils/setClipboard'

// Part slots shown per section. Wheels (23, 24), plate (25, 26) and livery (48) slots have dedicated sections below.
const MOD_SECTIONS = [
  { value: 'performance', ids: [11, 12, 13, 15, 16] },
  { value: 'body', ids: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 42, 43, 44, 45, 46, 47, 49] },
  { value: 'interior', ids: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36] },
  { value: 'engine_bay', ids: [37, 38, 39, 40, 41] },
]

const WHEEL_TYPES = ['Sport', 'Muscle', 'Lowrider', 'SUV', 'Offroad', 'Tuner', 'Bike', 'High End', "Benny's Original", "Benny's Bespoke", 'Open Wheel', 'Street', 'Track']
const BIKE_WHEEL_TYPE = 6
const XENON_COLOURS = ['White', 'Blue', 'Electric Blue', 'Mint', 'Lime', 'Yellow', 'Golden', 'Orange', 'Red', 'Pony Pink', 'Hot Pink', 'Purple', 'Blacklight']
const DEFAULT_XENON_COLOUR = 255
const WINDOW_TINTS = ['None', 'Pure Black', 'Dark Smoke', 'Light Smoke', 'Stock', 'Limo', 'Green']
const PLATE_STYLES = ['Blue on White 1', 'Yellow on Black', 'Yellow on Blue', 'Blue on White 2', 'Blue on White 3', 'Yankton']
const NEON_SIDES = ['ui_neon_left', 'ui_neon_right', 'ui_neon_front', 'ui_neon_back']
const COLOUR_FIELDS: { field: keyof VehicleColours, label: string }[] = [
  { field: 'pearlescent', label: 'ui_colour_pearlescent' },
  { field: 'wheel', label: 'ui_colour_wheel' },
  { field: 'interior', label: 'ui_colour_interior' },
  { field: 'dashboard', label: 'ui_colour_dashboard' },
]
const MAX_COLOUR_INDEX = 160
const HEX_COLOUR = /^#[0-9a-f]{6}$/i

const rgbToHex = (colour: RgbColour | false) =>
  colour ? `#${colour.map((channel) => channel.toString(16).padStart(2, '0')).join('')}` : ''

const hexToRgb = (hex: string): RgbColour =>
  [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)) as RgbColour

const toOptions = (labels: string[]) => labels.map((label, index) => ({ value: String(index), label }))

const customize = (type: string, payload?: object) => fetchNui('dolu_tool:customizeVehicle', { type, ...payload })

// Applies the colour while the picker is dragged, without flooding the client with NUI callbacks
const ColourField: React.FC<{
  label: string,
  value: RgbColour | false,
  onChange: (colour: RgbColour) => void,
  onClear?: () => void,
  clearLabel?: string,
}> = ({ label, value, onChange, onClear, clearLabel }) => {
  const hex = rgbToHex(value)
  const [draft, setDraft] = useState(hex)
  const apply = useDebouncedCallback((colour: string) => onChange(hexToRgb(colour)), 100)

  useEffect(() => setDraft(hex), [hex])

  return (
    <ColorInput
      size='xs'
      label={label}
      format='hex'
      value={draft}
      withEyeDropper={false}
      onChange={(colour) => {
        setDraft(colour)
        if (HEX_COLOUR.test(colour)) apply(colour)
      }}
      onBlur={() => setDraft(hex)}
      rightSectionPointerEvents='all'
      rightSection={onClear && value ? (
        <Tooltip label={clearLabel}>
          <ActionIcon size='xs' variant='subtle' color='gray' onClick={onClear}>
            <TbX />
          </ActionIcon>
        </Tooltip>
      ) : undefined}
    />
  )
}

const OptionSelect: React.FC<{
  label: string,
  value: number,
  data: { value: string, label: string }[],
  onChange: (value: number) => void,
  disabled?: boolean,
}> = ({ label, value, data, onChange, disabled }) => (
  <Select
    size='xs'
    label={label}
    data={data}
    value={String(value)}
    searchable
    allowDeselect={false}
    disabled={disabled}
    onChange={(selected) => selected !== null && onChange(Number(selected))}
  />
)

const VehicleCustomizationPanel: React.FC = () => {
  const { locale } = useLocales()
  const [vehicle, setVehicle] = useAtom(vehicleCustomizationAtom)
  const [plate, setPlate] = useState('')
  const [copied, setCopied] = useState(false)

  // An empty Lua table may be serialized as an object instead of an array
  const receive = (data: VehicleCustomization | false) => setVehicle(data && {
    ...data,
    mods: Array.isArray(data.mods) ? data.mods : [],
    extras: Array.isArray(data.extras) ? data.extras : [],
  })

  const refresh = () => {
    fetchNui<VehicleCustomization | false>('dolu_tool:getVehicleCustomization').then(receive)
  }

  useEffect(refresh, [])
  useNuiEvent('setVehicleCustomization', receive)

  const currentPlate = vehicle ? vehicle.plate : ''
  useEffect(() => setPlate(currentPlate), [currentPlate])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(timer)
  }, [copied])

  if (!vehicle) {
    return (
      <Center style={{ flex: 1 }}>
        <Text size='md' fw={600} c='red.4'>{locale.ui_not_in_vehicle}</Text>
      </Center>
    )
  }

  const update = (patch: Partial<VehicleCustomization>) => setVehicle((previous) => previous && { ...previous, ...patch })

  const updateMod = (id: number, patch: Partial<VehicleMod>) => update({
    mods: vehicle.mods.map((mod) => mod.id === id ? { ...mod, ...patch } : mod),
  })

  const getMod = (id: number) => vehicle.mods.find((mod) => mod.id === id)

  const getOptionLabel = (label: string | false, index: number) => label || `${locale.ui_vehicle_option} ${index + 1}`

  const renderMod = (mod: VehicleMod) => (
    <OptionSelect
      key={mod.id}
      label={mod.slotLabel || locale[`ui_vehicle_mod_${mod.id}`]}
      value={mod.current}
      data={[
        { value: '-1', label: locale.ui_vehicle_stock },
        ...mod.labels.map((label, index) => ({ value: String(index), label: getOptionLabel(label, index) })),
      ]}
      onChange={(value) => {
        updateMod(mod.id, { current: value })
        customize('mod', { id: mod.id, value })
      }}
    />
  )

  const renderWheel = (mod: VehicleMod) => (
    <Stack key={mod.id} gap={6}>
      {renderMod(mod)}
      <Checkbox
        size='xs'
        color='blue.4'
        label={locale.ui_custom_tyres}
        checked={mod.customTyres}
        disabled={mod.current < 0}
        onChange={(event) => {
          const customTyres = event.currentTarget.checked
          updateMod(mod.id, { customTyres })
          customize('mod', { id: mod.id, value: mod.current, customTyres })
        }}
      />
    </Stack>
  )

  const renderSwitch = (label: string, mod: 'turbo' | 'tyreSmoke' | 'xenon') => (
    <Switch
      size='sm'
      color='blue.4'
      label={label}
      checked={vehicle[mod]}
      onChange={(event) => {
        const enabled = event.currentTarget.checked
        update({ [mod]: enabled })
        customize('toggle', { mod, enabled })
      }}
    />
  )

  const renderColourIndex = (field: keyof VehicleColours, label: string) => (
    <NumberInput
      key={field}
      size='xs'
      label={label}
      min={0}
      max={MAX_COLOUR_INDEX}
      clampBehavior='strict'
      allowDecimal={false}
      allowNegative={false}
      value={vehicle.colours[field]}
      onChange={(value) => {
        if (typeof value !== 'number') return
        const patch: Partial<VehicleCustomization> = { colours: { ...vehicle.colours, [field]: value } }

        // The game drops the custom colour when a paint index is applied
        if (field === 'primary') patch.customPrimary = false
        if (field === 'secondary') patch.customSecondary = false

        update(patch)
        customize('colourIndex', { field, value })
      }}
    />
  )

  const renderCustomColour = (field: 'primary' | 'secondary', label: string) => {
    const key = field === 'primary' ? 'customPrimary' : 'customSecondary'

    return (
      <ColourField
        label={label}
        value={vehicle[key]}
        clearLabel={locale.ui_clear_custom_colour}
        onChange={(colour) => {
          update({ [key]: colour })
          customize('customColour', { field, colour })
        }}
        onClear={() => {
          update({ [key]: false })
          customize('clearCustomColour', { field })
        }}
      />
    )
  }

  const wheelMods = [getMod(23), getMod(24)].filter((mod): mod is VehicleMod => mod !== undefined)
  const liveryMod = getMod(48)
  const plateMods = [getMod(25), getMod(26)].filter((mod): mod is VehicleMod => mod !== undefined)
  const modSections = MOD_SECTIONS
    .map((section) => ({ ...section, mods: section.ids.map(getMod).filter((mod): mod is VehicleMod => mod !== undefined) }))
    .filter((section) => section.mods.length > 0 || section.value === 'performance')
  const { extras } = vehicle
  const hasLivery = liveryMod || vehicle.livery || vehicle.roofLivery

  return (
    <>
      <Paper p='xs'>
        <Group justify='space-between' wrap='nowrap'>
          <Text size='sm' fw={600} truncate>{vehicle.model}</Text>
          <Group gap='xs' wrap='nowrap'>
            <Button size='xs' color='blue.4' onClick={refresh}>{locale.ui_refresh}</Button>
            <Button
              size='xs'
              color={copied ? 'teal' : 'blue.4'}
              onClick={() => {
                fetchNui<object | false>('dolu_tool:getVehicleProperties').then((properties) => {
                  if (!properties) return
                  setClipboard(JSON.stringify(properties))
                  setCopied(true)
                })
              }}
            >
              {copied ? locale.ui_copied_properties : locale.ui_copy_properties}
            </Button>
            <Button size='xs' color='red.4' onClick={() => customize('resetMods')}>{locale.ui_reset_mods}</Button>
          </Group>
        </Group>
      </Paper>

      <ScrollArea style={{ flex: 1, minHeight: 0 }} scrollbarSize={6}>
        <Accordion multiple defaultValue={['paint']} chevronPosition='left' variant='contained' radius='sm' keepMounted={false}>
          <Accordion.Item value='paint'>
            <Accordion.Control>{locale.ui_vehicle_section_paint}</Accordion.Control>
            <Accordion.Panel>
              <Stack gap='xs'>
                <SimpleGrid cols={2} spacing='xs'>
                  {renderColourIndex('primary', locale.ui_colour_primary)}
                  {renderCustomColour('primary', locale.ui_colour_primary_custom)}
                  {renderColourIndex('secondary', locale.ui_colour_secondary)}
                  {renderCustomColour('secondary', locale.ui_colour_secondary_custom)}
                </SimpleGrid>
                <SimpleGrid cols={2} spacing='xs'>
                  {COLOUR_FIELDS.map(({ field, label }) => renderColourIndex(field, locale[label]))}
                </SimpleGrid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          {hasLivery && (
            <Accordion.Item value='livery'>
              <Accordion.Control>{locale.ui_vehicle_section_livery}</Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={2} spacing='xs'>
                  {liveryMod && renderMod(liveryMod)}
                  {vehicle.livery && (
                    <OptionSelect
                      label={locale.ui_vehicle_livery}
                      value={vehicle.livery.current}
                      data={vehicle.livery.labels.map((label, index) => ({ value: String(index), label: getOptionLabel(label, index) }))}
                      onChange={(value) => {
                        if (vehicle.livery) update({ livery: { ...vehicle.livery, current: value } })
                        customize('livery', { value })
                      }}
                    />
                  )}
                  {vehicle.roofLivery && (
                    <OptionSelect
                      label={locale.ui_vehicle_roof_livery}
                      value={vehicle.roofLivery.current}
                      data={Array.from({ length: vehicle.roofLivery.count }, (_, index) => ({ value: String(index), label: getOptionLabel(false, index) }))}
                      onChange={(value) => {
                        if (vehicle.roofLivery) update({ roofLivery: { ...vehicle.roofLivery, current: value } })
                        customize('roofLivery', { value })
                      }}
                    />
                  )}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          )}

          {wheelMods.length > 0 && (
            <Accordion.Item value='wheels'>
              <Accordion.Control>{locale.ui_vehicle_section_wheels}</Accordion.Control>
              <Accordion.Panel>
                <Stack gap='xs'>
                  <SimpleGrid cols={2} spacing='xs'>
                    {!vehicle.isBike && (
                      <OptionSelect
                        label={locale.ui_wheel_type}
                        value={vehicle.wheelType}
                        data={toOptions(WHEEL_TYPES).filter((option) => Number(option.value) !== BIKE_WHEEL_TYPE)}
                        onChange={(value) => {
                          update({ wheelType: value })
                          customize('wheelType', { value })
                        }}
                      />
                    )}
                    {wheelMods.map(renderWheel)}
                  </SimpleGrid>
                  {renderSwitch(locale.ui_tyre_smoke, 'tyreSmoke')}
                  <ColourField
                    label={locale.ui_tyre_smoke_colour}
                    value={vehicle.tyreSmokeColour}
                    onChange={(colour) => {
                      update({ tyreSmokeColour: colour })
                      customize('tyreSmokeColour', { colour })
                    }}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          )}

          {modSections.map((section) => (
            <Accordion.Item key={section.value} value={section.value}>
              <Accordion.Control>{locale[`ui_vehicle_section_${section.value}`]}</Accordion.Control>
              <Accordion.Panel>
                <Stack gap='xs'>
                  {section.value === 'performance' && renderSwitch(locale.ui_turbo, 'turbo')}
                  <SimpleGrid cols={2} spacing='xs'>
                    {section.mods.map(renderMod)}
                  </SimpleGrid>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}

          <Accordion.Item value='lights'>
            <Accordion.Control>{locale.ui_vehicle_section_lights}</Accordion.Control>
            <Accordion.Panel>
              <Stack gap='xs'>
                {renderSwitch(locale.ui_xenon, 'xenon')}
                <OptionSelect
                  label={locale.ui_xenon_colour}
                  value={vehicle.xenonColour}
                  disabled={!vehicle.xenon}
                  data={[{ value: String(DEFAULT_XENON_COLOUR), label: locale.ui_vehicle_stock }, ...toOptions(XENON_COLOURS)]}
                  onChange={(value) => {
                    update({ xenonColour: value })
                    customize('xenonColour', { value })
                  }}
                />
                <Text size='xs' fw={500}>{locale.ui_neons}</Text>
                <Group gap='md'>
                  {NEON_SIDES.map((label, side) => (
                    <Checkbox
                      key={label}
                      size='xs'
                      color='blue.4'
                      label={locale[label]}
                      checked={vehicle.neons[side]}
                      onChange={(event) => {
                        const enabled = event.currentTarget.checked
                        update({ neons: vehicle.neons.map((value, index) => index === side ? enabled : value) })
                        customize('neon', { side, enabled })
                      }}
                    />
                  ))}
                </Group>
                <ColourField
                  label={locale.ui_neon_colour}
                  value={vehicle.neonColour}
                  onChange={(colour) => {
                    update({ neonColour: colour })
                    customize('neonColour', { colour })
                  }}
                />
                <OptionSelect
                  label={locale.ui_window_tint}
                  value={vehicle.windowTint}
                  data={[{ value: '-1', label: locale.ui_vehicle_stock }, ...toOptions(WINDOW_TINTS)]}
                  onChange={(value) => {
                    update({ windowTint: value })
                    customize('windowTint', { value })
                  }}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value='plate'>
            <Accordion.Control>{locale.ui_vehicle_section_plate}</Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={2} spacing='xs'>
                <TextInput
                  size='xs'
                  label={locale.ui_plate_text}
                  maxLength={8}
                  value={plate}
                  onChange={(event) => setPlate(event.currentTarget.value)}
                  onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                  onBlur={() => {
                    if (plate === vehicle.plate) return
                    update({ plate })
                    customize('plate', { value: plate })
                  }}
                />
                <OptionSelect
                  label={locale.ui_plate_style}
                  value={vehicle.plateIndex}
                  data={toOptions(PLATE_STYLES)}
                  onChange={(value) => {
                    update({ plateIndex: value })
                    customize('plateIndex', { value })
                  }}
                />
                {plateMods.map(renderMod)}
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>

          {extras.length > 0 && (
            <Accordion.Item value='extras'>
              <Accordion.Control>{locale.ui_vehicle_section_extras}</Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={3} spacing='xs'>
                  {extras.map(({ id, enabled }) => (
                    <Checkbox
                      key={id}
                      size='xs'
                      color='blue.4'
                      label={`${locale.ui_vehicle_extra} ${id}`}
                      checked={enabled}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked
                        update({ extras: extras.map((extra) => extra.id === id ? { ...extra, enabled: checked } : extra) })
                        customize('extra', { id, enabled: checked })
                      }}
                    />
                  ))}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      </ScrollArea>
    </>
  )
}

export default VehicleCustomizationPanel
