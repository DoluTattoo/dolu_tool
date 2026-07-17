import { memo, useCallback, useEffect } from "react";
import { ActionIcon, Divider, Group, Paper, Select, Stack, Text } from "@mantine/core";
import { useAtom, useAtomValue } from "jotai";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import {
  interiorAtom,
  timecycleAtom,
  timecycleListAtom,
  type TimecycleOption,
} from "../../../../../atoms/interior";
import { fetchNui } from "../../../../../utils/fetchNui";
import { useLocales, type Locale } from "../../../../../providers/LocaleProvider";
import { useNuiEvent } from "../../../../../hooks/useNuiEvent";
import { CopyableRow, FlagRow, Row, SectionHeader } from "./PropertyRow";
import { ROOM_FLAGS } from "./flags";

// Memoized timecycle controls
const TimecycleControls = memo(
  ({
    timecycle,
    timecycleList,
    onPrev,
    onNext,
    onReset,
    onChange,
    locale,
  }: {
    timecycle: string | null;
    timecycleList: TimecycleOption[];
    onPrev: () => void;
    onNext: () => void;
    onReset: () => void;
    onChange: (value: string | null) => void;
    locale: Locale;
  }) => (
    <Group gap={5} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
      <Select
        size="sm"
        searchable
        nothingFoundMessage={locale.ui_no_timecycle_found}
        data={timecycleList}
        renderOption={({ option }) => {
          const { label, varCount } = option as TimecycleOption;
          return (
            <Group justify="space-between" wrap="nowrap" gap="xs" style={{ width: "100%" }}>
              <Text
                size="sm"
                style={{
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </Text>
              {!!varCount && (
                <Text size="xs" c="dimmed">
                  {varCount}
                </Text>
              )}
            </Group>
          );
        }}
        value={timecycle}
        onChange={onChange}
        style={{ flex: 1, minWidth: 0 }}
        comboboxProps={{ width: 320, position: "bottom-start", keepMounted: false }}
      />
      <ActionIcon size={30} variant="default" onClick={onPrev}>
        <FaArrowLeft size={13} />
      </ActionIcon>
      <ActionIcon size={30} variant="default" onClick={onNext}>
        <FaArrowRight size={13} />
      </ActionIcon>
      <ActionIcon size={30} variant="default" onClick={onReset}>
        <GiCancel size={15} />
      </ActionIcon>
    </Group>
  )
);
TimecycleControls.displayName = "TimecycleControls";

const RoomsElement: React.FC = memo(() => {
  const { locale } = useLocales();
  const interior = useAtomValue(interiorAtom);
  const [timecycleList, setTimecycleList] = useAtom(timecycleListAtom);
  const [timecycle, setTimecycle] = useAtom(timecycleAtom);

  useNuiEvent(
    "setTimecycleList",
    (data: TimecycleOption[]) => {
      setTimecycleList(data);
    }
  );

  const handlePrevClick = useCallback(() => {
    const currentIndex = timecycleList.findIndex(
      (option) => option.value === timecycle
    );
    const prevIndex =
      currentIndex === 0 ? timecycleList.length - 1 : currentIndex - 1;
    setTimecycle(timecycleList[prevIndex].value);
  }, [timecycle, timecycleList, setTimecycle]);

  const handleNextClick = useCallback(() => {
    const currentIndex = timecycleList.findIndex(
      (option) => option.value === timecycle
    );
    const nextIndex = (currentIndex + 1) % timecycleList.length;
    setTimecycle(timecycleList[nextIndex].value);
  }, [timecycle, timecycleList, setTimecycle]);

  const handleResetClick = useCallback(() => {
    fetchNui("dolu_tool:resetTimecycle", {
      roomId: interior.currentRoom?.index,
    }).then((resp) => {
      if (resp !== 0) {
        const currentIndex = timecycleList.findIndex(
          (option) => option.label === resp.label
        );
        setTimecycle(
          currentIndex === -1 ? resp.value : timecycleList[currentIndex].value
        );
      }
    });
  }, [interior.currentRoom?.index, timecycleList, setTimecycle]);

  const handleTimecycleChange = useCallback(
    (value: string | null) => {
      setTimecycle(value);
    },
    [setTimecycle]
  );

  useEffect(() => {
    if (timecycle) {
      fetchNui("dolu_tool:setTimecycle", {
        value: timecycle,
        roomId: interior.currentRoom?.index,
      });
    }
  }, [timecycle, interior.currentRoom?.index]);

  return (
    <Paper p="md">
      <SectionHeader
        title={locale.ui_current_room}
      />

      <Stack gap={2}>
        <CopyableRow
          label={locale.ui_index}
          value={interior.currentRoom?.index}
          copyLabel={locale.ui_copy}
          copiedLabel={locale.ui_copied}
        />
        <CopyableRow
          label={locale.ui_name}
          value={interior.currentRoom?.name}
          copyLabel={locale.ui_copy}
          copiedLabel={locale.ui_copied}
        />
        <FlagRow
          label={locale.ui_flag}
          total={interior.currentRoom?.flags.total}
          options={ROOM_FLAGS}
          onChange={(values) =>
            fetchNui('dolu_tool:setRoomFlagCheckbox', {
              flags: values,
              roomId: interior.currentRoom?.index,
            })
          }
          copyLabel={locale.ui_copy}
          copiedLabel={locale.ui_copied}
        />

        {timecycle && (
          <>
            <Divider my={6} variant="dashed" />
            <Row label={locale.ui_timecycle}>
              <TimecycleControls
                timecycle={timecycle}
                timecycleList={timecycleList}
                onPrev={handlePrevClick}
                onNext={handleNextClick}
                onReset={handleResetClick}
                onChange={handleTimecycleChange}
                locale={locale}
              />
            </Row>
          </>
        )}
      </Stack>
    </Paper>
  );
});

RoomsElement.displayName = "RoomsElement";

export default RoomsElement;
