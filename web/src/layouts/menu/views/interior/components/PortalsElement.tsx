import { ActionIcon, Checkbox, Divider, Group, NumberInput, NumberInputHandlers, Paper, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, memo } from "react";
import { useAtom } from "jotai";
import { FaArrowLeft, FaArrowRight, FaExchangeAlt } from "react-icons/fa";
import { useLocales } from "../../../../../providers/LocaleProvider";
import { getInteriorData, portalDataAtom, portalDebuggingAtom, portalEditingIndexAtom } from "../../../../../atoms/interior";
import { fetchNui } from "../../../../../utils/fetchNui";
import { CopyableRow, CopyableValue, FlagRow, Row, SectionHeader } from "./PropertyRow";
import { PORTAL_FLAGS } from "./flags";

const DebugCheckboxGroup = memo(({ locale, value, onChange }: { locale: any, value: string[], onChange: (value: string[]) => void }) => (
  <Checkbox.Group
    size='md'
    value={value}
    onChange={onChange}
  >
    <Group gap='xs'>
      <Checkbox color='blue.4' value='portalInfos' label={locale.ui_infos} />
      <Checkbox color='blue.4' value='portalPoly' label={locale.ui_fill_portals} />
      <Checkbox color='blue.4' value='portalLines' label={locale.ui_outline_portals} />
      <Checkbox color='blue.4' value='portalCorners' label={locale.ui_corcers_portals} />
    </Group>
  </Checkbox.Group>
));

const PortalsElement: React.FC = () => {
  const { locale } = useLocales()
  const interior = getInteriorData()
  const [portalEditingIndex, setPortalEditingIndex] = useAtom(portalEditingIndexAtom)
  const handlers = useRef<NumberInputHandlers>(undefined)
  const [portalData, setPortalData] = useAtom(portalDataAtom)
  const [portalDebugCheckboxesValue, setPortalDebugCheckboxesValue] = useAtom(portalDebuggingAtom)

  useEffect(() => {
    if (interior) {
      if (interior.portalCount && interior.portalCount - 1 < portalEditingIndex) {
        setPortalEditingIndex(0)
      }

      if (interior.portals && interior.portals[portalEditingIndex] !== undefined) {
        setPortalData(interior.portals[portalEditingIndex])
      }
    }
  }, [interior])

  useEffect(() => {
    if (portalDebugCheckboxesValue) fetchNui('dolu_tool:setPortalCheckbox', portalDebugCheckboxesValue)
  }, [portalDebugCheckboxesValue])

  const handleFlipPortal = useCallback(() => {
    fetchNui('dolu_tool:flipPortal', { portalIndex: portalEditingIndex })
  }, [portalEditingIndex])

  return (
    <Paper p='md'>
      <SectionHeader title={locale.ui_portals} />

      {interior.portalCount && interior.portalCount > 0 ?
        <>
          <DebugCheckboxGroup locale={locale} value={portalDebugCheckboxesValue} onChange={setPortalDebugCheckboxesValue} />

          <Divider my='sm' variant='dashed' />

          <Stack gap={2}>
            {/* PORTAL INDEX STEPPER */}
            <Row label={locale.ui_index}>
              <Group gap={5} wrap='nowrap'>
                <ActionIcon size={30} variant='default' onClick={() => { handlers.current?.decrement() }}>
                  <FaArrowLeft size={13} />
                </ActionIcon>

                <NumberInput
                  size='sm'
                  hideControls
                  value={portalEditingIndex}
                  handlersRef={handlers}
                  max={interior.portalCount && interior.portalCount - 1}
                  min={0}
                  step={1}
                  onChange={(val) => {
                    const index = typeof val === 'number' ? val : parseInt(val, 10)
                    if (Number.isNaN(index)) return
                    setPortalEditingIndex(index || 0)
                    setPortalData(interior.portals![index])
                  }}
                  styles={{ input: { width: 54, textAlign: 'center' } }}
                />

                <ActionIcon size={30} variant='default' onClick={() => { handlers.current?.increment() }}>
                  <FaArrowRight size={13} />
                </ActionIcon>
              </Group>
            </Row>

            {
              portalData && <>
                {/* FLAG + EDIT */}
                <FlagRow
                  label={locale.ui_flag}
                  total={portalData?.flags.total}
                  options={PORTAL_FLAGS}
                  onChange={(values) =>
                    fetchNui('dolu_tool:setPortalFlagCheckbox', {
                      flags: values,
                      portalIndex: portalEditingIndex,
                    })
                  }
                  copyLabel={locale.ui_copy}
                  copiedLabel={locale.ui_copied}
                />

                {/* ROOM FROM / TO + FLIP */}
                <Row label={locale.ui_room_from}>
                  <CopyableValue
                    value={portalData ? portalData.roomFrom : 'Unknown'}
                    copyLabel={locale.ui_copy}
                    copiedLabel={locale.ui_copied}
                  />
                  <ActionIcon size='md' variant='default' onClick={handleFlipPortal}>
                    <FaExchangeAlt size={13} />
                  </ActionIcon>
                </Row>

                <CopyableRow
                  label={locale.ui_room_to}
                  value={portalData ? portalData.roomTo : 'Unknown'}
                  copyLabel={locale.ui_copy}
                  copiedLabel={locale.ui_copied}
                />
              </>
            }
          </Stack>
        </>
        :
        <Text c='dimmed' size='sm'>No portal found</Text>
      }
    </Paper>
  )
}

export default PortalsElement
