-- based on https://github.com/Deltanic/fivem-freecam

local FOV = 50.0
local EASING_DURATION = 250 -- ms
local LOOK_LR = 1       -- mouse left/right
local LOOK_UD = 2       -- mouse up/down
local MOVE_LR = 30      -- A / D
local MOVE_UD = 31      -- W / S
local MOVE_UP = 153     -- E / RB
local MOVE_DOWN = 152   -- Q / LB
local HOLD_FASTER = 21  -- Shift
local HOLD_SLOWER = 19  -- Alt
local HOLD_TO_LOOK = 25 -- right mouse button

local camera, camPos, camRot, camVecX, camVecY
local speedMultiplier = 1.0
local faster, slower = false, false

-- Computes the camera's right and forward vectors from its euler rotation
local function getCamVectors(rot)
    local radX = math.rad(rot.x)
    local radY = math.rad(rot.y)
    local radZ = math.rad(rot.z)

    local sinX, cosX = math.sin(radX), math.cos(radX)
    local sinY, cosY = math.sin(radY), math.cos(radY)
    local sinZ, cosZ = math.sin(radZ), math.cos(radZ)

    local vecX = vec3(cosY * cosZ, cosY * sinZ, -sinY)
    local vecY = vec3(
        cosZ * sinX * sinY - cosX * sinZ,
        cosX * cosZ - sinX * sinY * sinZ,
        cosY * sinX
    )

    return vecX, vecY
end

local function setPosition(pos)
    local interior = GetInteriorAtCoords(pos.x, pos.y, pos.z)

    if interior ~= 0 then
        PinInteriorInMemory(interior)
    end

    SetFocusPosAndVel(pos.x, pos.y, pos.z, 0, 0, 0)
    LockMinimapPosition(pos.x, pos.y)
    SetCamCoord(camera, pos.x, pos.y, pos.z)

    camPos = pos
end

local function setRotation(rot)
    rot = vec3(math.min(math.max(rot.x, -90.0), 90.0), rot.y % 360, rot.z % 360)

    if camRot ~= rot then
        LockMinimapAngle(math.floor(rot.z))
        SetCamRot(camera, rot.x, rot.y, rot.z, 0)

        camRot = rot
        camVecX, camVecY = getCamVectors(rot)
    end
end

local function getSpeedMultiplier()
    local usingKeyboard = IsUsingKeyboard(2)
    local fastControl = usingKeyboard and 180 or 71 -- scroll up / RT
    local slowControl = usingKeyboard and 181 or 72 -- scroll down / LT

    if IsDisabledControlPressed(0, slowControl) then
        if speedMultiplier > 1.0 then
            speedMultiplier = speedMultiplier - 0.5
        elseif speedMultiplier > 0.2 then
            speedMultiplier = speedMultiplier - 0.1
        else
            speedMultiplier = speedMultiplier - 0.01
        end
    elseif IsDisabledControlPressed(0, fastControl) then
        if speedMultiplier < 0.2 then
            speedMultiplier = speedMultiplier + 0.01
        elseif speedMultiplier > 1.0 then
            speedMultiplier = speedMultiplier + 0.5
        else
            speedMultiplier = speedMultiplier + 0.1
        end
    end

    -- Hold Shift to go 5x faster
    if IsDisabledControlJustPressed(0, HOLD_FASTER) and not slower then
        faster = true
        speedMultiplier = speedMultiplier * 5
    end
    if IsDisabledControlJustReleased(0, HOLD_FASTER) and faster and not slower then
        faster = false
        speedMultiplier = speedMultiplier / 5
    end

    -- Hold Alt to go 5x slower
    if IsDisabledControlJustPressed(0, HOLD_SLOWER) and not faster then
        slower = true
        speedMultiplier = speedMultiplier / 5
    end
    if IsDisabledControlJustReleased(0, HOLD_SLOWER) and slower and not faster then
        slower = false
        speedMultiplier = speedMultiplier * 5
    end

    if speedMultiplier <= 0.0 then
        speedMultiplier = 0.01
    elseif speedMultiplier > 15.0 then
        speedMultiplier = 15.0
    end

    return speedMultiplier * GetFrameTime() * 60
end

local function updateCamera()
    if not Client.noClip or IsPauseMenuActive() then return end

    local speed = getSpeedMultiplier()
    local lookX, lookY = 0.0, 0.0
    local moveX, moveY, moveZ = 0.0, 0.0, 0.0

    -- Only read inputs when the menu doesn't use the mouse, or while right click is held
    if (not Client.isMenuOpen and not Client.gizmoEntity) or IsDisabledControlPressed(0, HOLD_TO_LOOK) then
        lookX = GetDisabledControlNormal(0, LOOK_LR)
        lookY = GetDisabledControlNormal(0, LOOK_UD)
        moveX = GetDisabledControlNormal(0, MOVE_LR)
        moveY = GetDisabledControlNormal(0, MOVE_UD)
        moveZ = GetDisabledControlNormal(0, MOVE_UP) - GetDisabledControlNormal(0, MOVE_DOWN)
    end

    local sensitivity = IsUsingKeyboard(2) and 5 or 2
    local rot = vec3(camRot.x - lookY * sensitivity, camRot.y, camRot.z - lookX * sensitivity)
    local pos = camPos + (camVecX * moveX * speed) - (camVecY * moveY * speed) + vec3(0.0, 0.0, moveZ * speed)

    if pos ~= camPos then
        setPosition(pos)
    end

    setRotation(rot)

    return pos, rot.z
end

local function startNoclipThread()
    CreateThread(function()
        local ped = cache.ped

        setPosition(GetEntityCoords(ped))

        while Client.noClip do
            local pos, rotZ = updateCamera()

            -- Keep the ped (and their vehicle) on the camera so the world streams around it
            if pos and rotZ and DoesEntityExist(ped) then
                SetEntityHeading(ped, rotZ)

                local entity = cache.seat == -1 and cache.vehicle or cache.ped

                SetEntityCoordsNoOffset(entity, pos.x, pos.y, pos.z, false, false, false)
                SetEntityHeading(entity, rotZ)
            end

            Wait(0)
        end
    end)
end

function SetNoclipActive(active)
    if active == Client.noClip then return end

    local ped = cache.ped
    local vehicle = cache.vehicle
    local isDriving = vehicle and cache.seat == -1

    SetEntityVisible(ped, not active, false)
    SetEntityCollision(ped, not active, not active)
    SetEntityCompletelyDisableCollision(ped, not active, not active)
    SetEntityInvincible(ped, active)

    if isDriving then
        SetEntityVisible(vehicle, not active, false)
        SetEntityCollision(vehicle, not active, not active)
        SetEntityCompletelyDisableCollision(vehicle, not active, not active)
        SetEntityInvincible(vehicle, active)
    end

    if active then
        if cache.vehicle and cache.seat ~= -1 then
            TaskLeaveVehicle(ped, cache.vehicle, 16)
        end

        camera = CreateCam('DEFAULT_SCRIPTED_CAMERA', true)

        local gameplayRot = GetGameplayCamRot(0)

        SetCamFov(camera, FOV)
        setPosition(GetGameplayCamCoord())
        setRotation(vec3(gameplayRot.x, 0.0, gameplayRot.z))
        startNoclipThread()
    else
        DestroyCam(camera, false)
        camera = nil
        ClearFocus()
        UnlockMinimapPosition()
        UnlockMinimapAngle()
        SetGameplayCamRelativeHeading(0)
    end

    RenderScriptCams(active, true, EASING_DURATION, true, true)

    Client.noClip = active
end

function SetGameplayCamCoords(coords)
    setPosition(vec3(coords.x, coords.y, coords.z))
end
