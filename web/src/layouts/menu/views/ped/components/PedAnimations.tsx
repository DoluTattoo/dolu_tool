import { useEffect, useState } from 'react'
import { Autocomplete, Badge, Button, Checkbox, Group, NumberInput, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useAtom, useSetAtom } from 'jotai'
import { PedActiveAnimation, pedAnimationFormAtom, PedAnimationForm, PedEditorState, pedEditorAtom, pedScenarioAtom } from '../../../../../atoms/ped'
import { useLocales } from '../../../../../providers/LocaleProvider'
import { fetchNui } from '../../../../../utils/fetchNui'
import { setClipboard } from '../../../../../utils/setClipboard'
import { SectionHeader } from '../../interior/components/PropertyRow'

const STATUS_REFRESH_INTERVAL = 1000

// eAnimationFlags values, combined into the `flag` parameter of TaskPlayAnim
const ANIMATION_FLAGS = [
  { value: 1, label: 'Looping' },
  { value: 2, label: 'Hold last frame' },
  { value: 16, label: 'Upper body' },
  { value: 32, label: 'Secondary' },
  { value: 128, label: 'Abort on ped movement' },
  { value: 256, label: 'Additive' },
  { value: 512, label: 'Turn off collision' },
  { value: 2048, label: 'Ignore gravity' },
]

const SCENARIOS = [
  'AA_COFFEE', 'AA_SMOKE', 'BINOCULARS', 'BUM_SLUMPED', 'CAR_PARK_ATTENDANT', 'CHEERING', 'CLIPBOARD', 'CONST_DRILL', 'COP_IDLES',
  'DRINKING', 'DRUG_DEALER', 'GARDENER_PLANT', 'GUARD_STAND', 'HAMMERING', 'HANG_OUT_STREET', 'JANITOR', 'JOG_STANDING', 'LEANING',
  'MAID_CLEAN', 'MOBILE_FILM_SHOCKING', 'MUSCLE_FLEX', 'MUSCLE_FREE_WEIGHTS', 'MUSICIAN', 'PAPARAZZI', 'PARTYING', 'PICNIC', 'PUSH_UPS',
  'SEAT_LEDGE', 'SIT_UPS', 'SMOKING', 'STAND_FISHING', 'STAND_IMPATIENT', 'STAND_MOBILE', 'SUNBATHE', 'SUNBATHE_BACK', 'TENNIS_PLAYER',
  'TOURIST_MAP', 'TOURIST_MOBILE', 'VEHICLE_MECHANIC', 'WELDING', 'WINDOW_SHOP_BROWSE', 'YOGA',
].map((name) => `WORLD_HUMAN_${name}`)

const formatFloat = (value: number) => Number.isInteger(value) ? value.toFixed(1) : String(value)

const clipCode = ({ dict, clip, blendIn, blendOut, duration, flags, startPhase }: PedAnimationForm) =>
  `TaskPlayAnim(ped, '${dict.trim()}', '${clip.trim()}', ${formatFloat(blendIn)}, ${formatFloat(blendOut)}, ${duration}, ${flags}, ${formatFloat(startPhase)}, false, false, false)`

const scenarioCode = (scenario: string) => `TaskStartScenarioInPlace(ped, '${scenario}', 0, true)`

const CopyCodeButton: React.FC<{ code: string, disabled: boolean }> = ({ code, disabled }) => {
  const { locale } = useLocales()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      size='xs'
      color={copied ? 'teal' : 'blue.4'}
      disabled={disabled}
      onClick={() => {
        setClipboard(code)
        setCopied(true)
      }}
    >
      {copied ? locale.ui_copied : locale.ui_ped_copy_code}
    </Button>
  )
}

const PedAnimations: React.FC<{
  editor: PedEditorState,
  apply: (action: string, payload?: object) => Promise<void>,
  target: string,
}> = ({ editor, apply, target }) => {
  const { locale } = useLocales()
  const [form, setForm] = useAtom(pedAnimationFormAtom)
  const [scenario, setScenario] = useAtom(pedScenarioAtom)
  const setEditor = useSetAtom(pedEditorAtom)

  const update = (patch: Partial<PedAnimationForm>) => setForm((previous) => ({ ...previous, ...patch }))

  const isPlaying = editor.animation !== false

  // Clips without the looping flag end on their own: keep the status accurate
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      fetchNui<PedActiveAnimation | false>('dolu_tool:getPedAnimation', target).then((animation) => {
        setEditor((previous) => previous && { ...previous, animation })
      })
    }, STATUS_REFRESH_INTERVAL)

    return () => clearInterval(timer)
  }, [isPlaying, target])

  const numberField = (key: 'blendIn' | 'blendOut' | 'duration' | 'startPhase', label: string, integer = false) => (
    <NumberInput
      size='xs'
      label={label}
      value={form[key]}
      allowDecimal={!integer}
      onChange={(value) => typeof value === 'number' && update({ [key]: value })}
    />
  )

  const clipReady = form.dict.trim() !== '' && form.clip.trim() !== ''
  const animation = editor.animation

  return (
    <Stack gap='sm'>
      <Paper p='sm'>
        <Group justify='space-between' wrap='nowrap'>
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text size='xs' c='dimmed'>{locale.ui_ped_now_playing}</Text>
            <Text size='sm' fw={600} c={animation ? 'blue.4' : 'dimmed'} truncate>
              {animation ? (animation.scenario ?? `${animation.dict} / ${animation.clip}`) : locale.ui_ped_nothing_playing}
            </Text>
          </Stack>
          <Button size='xs' color='red.4' onClick={() => apply('stopPedAnimation')}>{locale.ui_ped_stop}</Button>
        </Group>
      </Paper>

      <Paper p='sm'>
        <SectionHeader title={locale.ui_ped_animation} />
        <Stack gap='xs'>
          <SimpleGrid cols={2} spacing='xs'>
            <TextInput size='xs' label={locale.ui_ped_anim_dict} value={form.dict} onChange={(event) => update({ dict: event.currentTarget.value })} />
            <TextInput size='xs' label={locale.ui_ped_anim_clip} value={form.clip} onChange={(event) => update({ clip: event.currentTarget.value })} />
          </SimpleGrid>
          <SimpleGrid cols={4} spacing='xs'>
            {numberField('blendIn', locale.ui_ped_blend_in)}
            {numberField('blendOut', locale.ui_ped_blend_out)}
            {numberField('duration', locale.ui_ped_duration, true)}
            {numberField('startPhase', locale.ui_ped_start_phase)}
          </SimpleGrid>
          <Group justify='space-between' align='flex-end' wrap='nowrap'>
            <NumberInput
              size='xs'
              label={locale.ui_flags}
              w={110}
              min={0}
              allowDecimal={false}
              allowNegative={false}
              value={form.flags}
              onChange={(value) => typeof value === 'number' && update({ flags: value })}
            />
            <Group gap='xs' wrap='nowrap'>
              <CopyCodeButton code={clipCode(form)} disabled={!clipReady} />
              <Button
                size='xs'
                color='blue.4'
                disabled={!clipReady}
                onClick={() => apply('playPedAnimation', { ...form, dict: form.dict.trim(), clip: form.clip.trim() })}
              >
                {locale.ui_ped_play}
              </Button>
            </Group>
          </Group>
          <SimpleGrid cols={2} spacing={6}>
            {ANIMATION_FLAGS.map(({ value, label }) => (
              <Checkbox
                key={value}
                size='xs'
                color='blue.4'
                label={`${value} - ${label}`}
                checked={(form.flags & value) !== 0}
                onChange={(event) => update({ flags: event.currentTarget.checked ? form.flags | value : form.flags & ~value })}
              />
            ))}
          </SimpleGrid>
          {editor.recentAnimations.length > 0 && (
            <Stack gap={4}>
              <Text size='xs' fw={500}>{locale.ui_ped_recent}</Text>
              <Group gap={4}>
                {editor.recentAnimations.map(({ dict, clip }) => (
                  <Badge
                    key={`${dict}/${clip}`}
                    component='button'
                    type='button'
                    variant='light'
                    color='blue.4'
                    tt='none'
                    style={{ cursor: 'pointer', maxWidth: '100%' }}
                    onClick={() => update({ dict, clip })}
                  >
                    {dict} / {clip}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper p='sm'>
        <SectionHeader title={locale.ui_ped_scenario} />
        <Group align='flex-end' gap='xs' wrap='nowrap'>
          <Autocomplete
            size='xs'
            style={{ flex: 1, minWidth: 0 }}
            label={locale.ui_ped_scenario_name}
            data={SCENARIOS}
            value={scenario}
            onChange={setScenario}
          />
          <CopyCodeButton code={scenarioCode(scenario.trim())} disabled={scenario.trim() === ''} />
          <Button
            size='xs'
            color='blue.4'
            disabled={scenario.trim() === ''}
            onClick={() => apply('playPedScenario', { scenario: scenario.trim() })}
          >
            {locale.ui_ped_play}
          </Button>
        </Group>
      </Paper>
    </Stack>
  )
}

export default PedAnimations
