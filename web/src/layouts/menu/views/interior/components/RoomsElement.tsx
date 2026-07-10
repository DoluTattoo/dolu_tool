import { forwardRef, memo, useCallback, useEffect } from "react";
import { ActionIcon, Divider, Group, Paper, Select, Stack, Text } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { RiDoorOpenFill } from "react-icons/ri";
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

// Custom dropdown item: name on the left, variable count discreetly on the right
interface TimecycleItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  varCount?: number;
}

const TimecycleItem = forwardRef<HTMLDivElement, TimecycleItemProps>(
  ({ label, varCount, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group position="apart" noWrap spacing="xs" sx={{ width: "100%" }}>
        <Text
          size="sm"
          sx={{
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
          <Text size="xs" color="dimmed">
            {varCount}
          </Text>
        )}
      </Group>
    </div>
  )
);
TimecycleItem.displayName = "TimecycleItem";

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
    <Group spacing={5} noWrap sx={{ flex: 1, minWidth: 0 }}>
      <Select
        size="sm"
        searchable
        nothingFound={locale.ui_no_timecycle_found}
        data={timecycleList}
        itemComponent={TimecycleItem}
        value={timecycle}
        onChange={onChange}
        sx={{ flex: 1, minWidth: 0 }}
        styles={{
          dropdown: {
            width: "320px !important",
            minWidth: "320px !important",
            // ScrollArea wraps items in a `display: table` element that grows to
            // the widest item; force it to block so labels ellipsize to the
            // dropdown width instead of triggering a horizontal scrollbar.
            "& .mantine-ScrollArea-viewport > div": { display: "block !important" },
            '& .mantine-ScrollArea-scrollbar[data-orientation="horizontal"]': {
              display: "none",
            },
          },
        }}
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
  const interior = useRecoilValue(interiorAtom);
  const [timecycleList, setTimecycleList] = useRecoilState(timecycleListAtom);
  const [timecycle, setTimecycle] = useRecoilState<string | null>(
    timecycleAtom
  );

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
        icon={<RiDoorOpenFill size={22} />}
      />

      <Stack spacing={2}>
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
