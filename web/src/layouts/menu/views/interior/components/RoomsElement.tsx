import { memo, useCallback, useEffect } from "react";
import { ActionIcon, Group, Paper, Select, Space, Text } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import {
  interiorAtom,
  timecycleAtom,
  timecycleListAtom,
  timecycleOptionSchema,
} from "../../../../../atoms/interior";
import { fetchNui } from "../../../../../utils/fetchNui";
import { useLocales } from "../../../../../providers/LocaleProvider";
import { useNuiValidatedEvent } from "../../../../../hooks/useNuiValidatedEvent";

// Memoized room info row
const RoomInfoRow = memo(
  ({ label, value }: { label: string; value: string | number | undefined }) => (
    <Group>
      <Text>{label}:</Text>
      <Text color="blue.4">{value}</Text>
    </Group>
  )
);

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
    timecycleList: Array<{ label: string; value: string }>;
    onPrev: () => void;
    onNext: () => void;
    onReset: () => void;
    onChange: (value: string | null) => void;
    locale: { ui_no_timecycle_found: string };
  }) => (
    <Group spacing={5}>
      <Select
        searchable
        nothingFound={locale.ui_no_timecycle_found}
        data={timecycleList}
        value={timecycle}
        onChange={onChange}
        width={170}
      />
      <ActionIcon size={36} variant="default" onClick={onPrev}>
        <FaArrowLeft />
      </ActionIcon>
      <ActionIcon size={36} variant="default" onClick={onNext}>
        <FaArrowRight />
      </ActionIcon>
      <ActionIcon size={36} variant="default" onClick={onReset}>
        <GiCancel />
      </ActionIcon>
    </Group>
  )
);

const RoomsElement: React.FC = memo(() => {
  const { locale } = useLocales();
  const interior = useRecoilValue(interiorAtom);
  const [timecycleList, setTimecycleList] = useRecoilState(timecycleListAtom);
  const [timecycle, setTimecycle] = useRecoilState<string | null>(
    timecycleAtom
  );

  useNuiValidatedEvent(
    "setTimecycleList",
    timecycleOptionSchema.array(),
    (data: Array<{ label: string; value: string }>) => {
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
      <Text size={20} weight={600}>
        {locale.ui_current_room}
      </Text>
      <Space h="xs" />
        <RoomInfoRow
          label={locale.ui_index}
          value={interior.currentRoom?.index}
        />
        <RoomInfoRow
          label={locale.ui_name}
          value={interior.currentRoom?.name}
        />
        <RoomInfoRow
          label={locale.ui_flag}
          value={interior.currentRoom?.flags.total}
        />
        <Group>
          <Text>{locale.ui_timecycle}:</Text>
          {timecycle && (
            <TimecycleControls
              timecycle={timecycle}
              timecycleList={timecycleList}
              onPrev={handlePrevClick}
              onNext={handleNextClick}
              onReset={handleResetClick}
              onChange={handleTimecycleChange}
              locale={locale}
            />
          )}
        </Group>
    </Paper>
  );
});

RoomsElement.displayName = "RoomsElement";

export default RoomsElement;
