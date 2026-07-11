-- Controls
CreateThread(function()
    local DisableControlAction = DisableControlAction
    local EnableControlAction = EnableControlAction
    local IsDisabledControlPressed = IsDisabledControlPressed

    DisableIdleCamera(true)

    local DISABLED<const> = {
        0, -- Next Camera
        1, -- Look Left/Right
        2, -- Look up/Down
        14, -- INPUT_WEAPON_WHEEL_NEXT
        15, -- INPUT_WEAPON_WHEEL_PREV
        16, -- INPUT_SELECT_NEXT_WEAPON
        17, -- INPUT_SELECT_PREV_WEAPON
        17, -- Select Previous Weapon
        22, -- Jump
        23, -- Enter vehicle
        24, -- Attack
        25, -- Aim
        26, -- Look Behind
        29, -- INPUT_SPECIAL_ABILITY_SECONDARY
        30, -- Player Movement
        31, -- Player Movement
        36, -- Input Duck/Sneak
        37, -- Weapon Wheel
        38, -- INPUT_PICKUP
        44, -- Cover
        45, -- INPUT_RELOAD
        47, -- Detonate
        51, -- INPUT_CONTEXT
        55, -- Dive
        58, -- INPUT_THROW_GRENADE
        69, -- Vehicle attack
        73, -- INPUT_VEH_DUCK
        81, -- Next Radio (Vehicle)
        82, -- Previous Radio (Vehicle)
        91, -- Passenger Aim (Vehicle)
        92, -- Passenger Attack (Vehicle)
        99, -- Select Next Weapon (Vehicle)
        105, -- INPUT_VEH_DROP_PROJECTILE
        106, -- Control Override (Vehicle)
        113, -- INPUT_VEH_FLY_UNDERCARRIAGE
        114, -- Fly Attack (Flying)
        115, -- Next Weapon (Flying)
        121, -- Fly Camera (Flying)
        122, -- Control OVerride (Flying)
        135, -- Control OVerride (Sub)
        140, -- Melee attack light
        142, -- Attack alternate
        154, -- INPUT_PARACHUTE_SMOKE
        199, -- Pause menu (P)
        200, -- Pause Menu (ESC)
        244, -- INPUT_INTERACTION_MENU
        245, -- Chat
        257, -- Attack 2
        263, -- INPUT_MELEE_ATTACK1
        301, -- INPUT_REPLAY_NEWMARKER
        303, -- INPUT_REPLAY_SCREENSHOT
        305, -- INPUT_REPLAY_STARTPOINT
        309, -- INPUT_REPLAY_TOOLS
        311, -- INPUT_REPLAY_SHOWHOTKEY
    }

    local FORCEABLE<const> = {
        1, -- Look Left/Right
        2, -- Look up/Down
        30, -- Player Movement
        31, -- Player Movement
        22, -- Jump
        23 -- Enter vehicle
    }

    while true do
        if Client.isMenuOpen or Client.gizmoEntity or Client.noClip then
            for i = 1, #DISABLED do
                DisableControlAction(0, DISABLED[i], true)
            end

            -- Enabling a few input only while holding right click. The NUI-driven
            if Client.gameInputGranted or IsDisabledControlPressed(0, 25) then
                for i = 1, #FORCEABLE do
                    EnableControlAction(0, FORCEABLE[i], true)
                end
            end
        else
            Wait(500)
        end

        Wait(0)
    end
end)

AddEventHandler('onResourceStop', function(name)
	if name ~= cache.resource then return end

	-- Stop outlining entity
    if Client.outlinedEntity then
        SetEntityDrawOutline(Client.outlinedEntity, false)
    end

    -- Unfreeze current gizmo entity
    if Client.gizmoEntity and DoesEntityExist(Client.gizmoEntity) then
        FreezeEntityPosition(Client.gizmoEntity, false)
    end

    -- Reset player camera
    if Client.noClip then
	    SetFreecamActive(false)
    end
end)
