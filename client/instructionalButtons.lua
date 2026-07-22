-- Instructional buttons (freecam & menu camera controls)

local CONTROLS = _G.CONTROL_MAPPING
local scaleform

local function InstructionalButton(controlButton, text)
    ScaleformMovieMethodAddParamPlayerNameString(controlButton)
    BeginTextCommandScaleformString("STRING")
    AddTextComponentSubstringKeyboardDisplay(text)
    EndTextCommandScaleformString()
end

local function SetDataSlot(index, control, text)
    BeginScaleformMovieMethod(scaleform, "SET_DATA_SLOT")
    ScaleformMovieMethodAddParamInt(index)
    InstructionalButton(GetControlInstructionalButton(0, control, true), text)
    EndScaleformMovieMethod()
end

local function BuildButtons(freecam, canLook, objectTab)
    BeginScaleformMovieMethod(scaleform, "CLEAR_ALL")
    EndScaleformMovieMethod()

    BeginScaleformMovieMethod(scaleform, "SET_CLEAR_SPACE")
    ScaleformMovieMethodAddParamInt(200)
    EndScaleformMovieMethod()

    local slot = 0

    if freecam then
        SetDataSlot(slot, 348, "Speed")
        SetDataSlot(slot + 1, 21, "Faster")
        SetDataSlot(slot + 2, CONTROLS.MOVE_Y, "Fwd/Back")
        SetDataSlot(slot + 3, CONTROLS.MOVE_X, "Left/Right")
        SetDataSlot(slot + 4, CONTROLS.MOVE_Z[2], "Down")
        SetDataSlot(slot + 5, CONTROLS.MOVE_Z[1], "Up")
        slot = slot + 6
    end

    if canLook then
        SetDataSlot(slot, 25, "Enable camera controls (HOLD)")
        slot = slot + 1
    end

    if objectTab then
        SetDataSlot(slot, 24, "Select object")
    end

    BeginScaleformMovieMethod(scaleform, "DRAW_INSTRUCTIONAL_BUTTONS")
    EndScaleformMovieMethod()

    BeginScaleformMovieMethod(scaleform, "SET_BACKGROUND_COLOUR")
    ScaleformMovieMethodAddParamInt(0)
    ScaleformMovieMethodAddParamInt(0)
    ScaleformMovieMethodAddParamInt(0)
    ScaleformMovieMethodAddParamInt(80)
    EndScaleformMovieMethod()
end

-- Drawing thread
CreateThread(function()
    local lastFreecam, lastCanLook, lastObjectTab

    while true do
        local freecam = Client.noClip == true
        local canLook = (Client.isMenuOpen or Client.gizmoEntity) and true or false
        local objectTab = (Client.isMenuOpen and Client.currentTab == 'object') and true or false

        if freecam or canLook then
            if not scaleform then
                scaleform = RequestScaleformMovie("instructional_buttons")

                while not HasScaleformMovieLoaded(scaleform) do
                    Wait(1)
                end
            end

            -- Rebuild buttons whenever the freecam/menu state changes
            if freecam ~= lastFreecam or canLook ~= lastCanLook or objectTab ~= lastObjectTab then
                lastFreecam, lastCanLook, lastObjectTab = freecam, canLook, objectTab
                BuildButtons(freecam, canLook, objectTab)
            end

            DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)
            Wait(0)
        else
            if scaleform then
                SetScaleformMovieAsNoLongerNeeded(scaleform)
                scaleform = nil
                lastFreecam, lastCanLook, lastObjectTab = nil, nil, nil
            end

            Wait(200)
        end
    end
end)
