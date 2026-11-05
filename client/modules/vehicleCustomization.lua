-- Vehicles tab: live customization of the current vehicle

local MOD_IDS = {}

-- 17 to 22 are toggle mods, not lists of parts
for id = 0, 49 do
    if id < 17 or id > 22 then
        MOD_IDS[#MOD_IDS + 1] = id
    end
end

local TOGGLE_MODS = { turbo = 18, tyreSmoke = 20, xenon = 22 }

local function getLabelText(label)
    if not label or label == '' or label == 'NULL' then return false end

    local text = GetLabelText(label)

    return text ~= 'NULL' and text or false
end

local function getLabels(count, getLabel)
    local labels = {}

    for index = 1, count do
        labels[index] = getLabelText(getLabel(index - 1))
    end

    return labels
end

local function getMods(vehicle)
    local mods = {}

    for _, id in ipairs(MOD_IDS) do
        local count = GetNumVehicleMods(vehicle, id)

        if count > 0 then
            mods[#mods + 1] = {
                id = id,
                current = GetVehicleMod(vehicle, id),
                customTyres = GetVehicleModVariation(vehicle, id),
                slotLabel = getLabelText(GetModSlotName(vehicle, id)),
                labels = getLabels(count, function(index)
                    return GetModTextLabel(vehicle, id, index)
                end)
            }
        end
    end

    return mods
end

local function getCustomColour(isCustom, getColour, vehicle)
    return isCustom and { getColour(vehicle) } or false
end

local function getCustomization(vehicle)
    if not vehicle or not DoesEntityExist(vehicle) then return false end

    SetVehicleModKit(vehicle, 0)

    local model = GetEntityModel(vehicle)
    local displayName = GetDisplayNameFromVehicleModel(model)
    local primary, secondary = GetVehicleColours(vehicle)
    local pearlescent, wheel = GetVehicleExtraColours(vehicle)
    local liveryCount = GetVehicleLiveryCount(vehicle)
    local roofLiveryCount = GetVehicleRoofLiveryCount(vehicle)
    local neons, extras = {}, {}

    for side = 0, 3 do
        neons[side + 1] = IsVehicleNeonLightEnabled(vehicle, side)
    end

    for id = 1, 15 do
        if DoesExtraExist(vehicle, id) then
            extras[#extras + 1] = { id = id, enabled = IsVehicleExtraTurnedOn(vehicle, id) }
        end
    end

    return {
        model = getLabelText(displayName) or displayName,
        isBike = IsThisModelABike(model),
        mods = getMods(vehicle),
        turbo = IsToggleModOn(vehicle, TOGGLE_MODS.turbo),
        tyreSmoke = IsToggleModOn(vehicle, TOGGLE_MODS.tyreSmoke),
        tyreSmokeColour = { GetVehicleTyreSmokeColor(vehicle) },
        wheelType = GetVehicleWheelType(vehicle),
        colours = {
            primary = primary,
            secondary = secondary,
            pearlescent = pearlescent,
            wheel = wheel,
            interior = GetVehicleInteriorColor(vehicle),
            dashboard = GetVehicleDashboardColour(vehicle)
        },
        customPrimary = getCustomColour(GetIsVehiclePrimaryColourCustom(vehicle), GetVehicleCustomPrimaryColour, vehicle),
        customSecondary = getCustomColour(GetIsVehicleSecondaryColourCustom(vehicle), GetVehicleCustomSecondaryColour, vehicle),
        livery = liveryCount > 0 and {
            current = GetVehicleLivery(vehicle),
            labels = getLabels(liveryCount, function(index)
                return GetLiveryName(vehicle, index)
            end)
        } or false,
        roofLivery = roofLiveryCount > 0 and {
            current = GetVehicleRoofLivery(vehicle),
            count = roofLiveryCount
        } or false,
        xenon = IsToggleModOn(vehicle, TOGGLE_MODS.xenon),
        xenonColour = GetVehicleXenonLightsColor(vehicle),
        neons = neons,
        neonColour = { GetVehicleNeonLightsColour(vehicle) },
        windowTint = GetVehicleWindowTint(vehicle),
        plate = GetVehicleNumberPlateText(vehicle):match('^%s*(.-)%s*$'),
        plateIndex = GetVehicleNumberPlateTextIndex(vehicle),
        extras = extras
    }
end

local function sendCustomization(vehicle)
    SendNUIMessage({
        action = 'setVehicleCustomization',
        data = getCustomization(vehicle)
    })
end

--- Natives only replicate from the entity owner: a passenger has to take control first.
local function requestControl(vehicle)
    if not NetworkGetEntityIsNetworked(vehicle) or NetworkHasControlOfEntity(vehicle) then
        return true
    end

    local timeout = GetGameTimer() + 1000

    while not NetworkHasControlOfEntity(vehicle) and GetGameTimer() < timeout do
        NetworkRequestControlOfEntity(vehicle)
        Wait(50)
    end

    return NetworkHasControlOfEntity(vehicle)
end

local colourIndexSetters = {
    primary = function(vehicle, value)
        local _, secondary = GetVehicleColours(vehicle)

        ClearVehicleCustomPrimaryColour(vehicle)
        SetVehicleColours(vehicle, value, secondary)
    end,
    secondary = function(vehicle, value)
        local primary = GetVehicleColours(vehicle)

        ClearVehicleCustomSecondaryColour(vehicle)
        SetVehicleColours(vehicle, primary, value)
    end,
    pearlescent = function(vehicle, value)
        local _, wheel = GetVehicleExtraColours(vehicle)

        SetVehicleExtraColours(vehicle, value, wheel)
    end,
    wheel = function(vehicle, value)
        local pearlescent = GetVehicleExtraColours(vehicle)

        SetVehicleExtraColours(vehicle, pearlescent, value)
    end,
    interior = SetVehicleInteriorColor,
    dashboard = SetVehicleDashboardColour
}

-- A setter returning true means the available options changed: the UI gets a fresh state
local setters = {
    mod = function(vehicle, data)
        if data.value < 0 then
            RemoveVehicleMod(vehicle, data.id)
            return
        end

        local customTyres = data.customTyres

        if customTyres == nil then
            customTyres = GetVehicleModVariation(vehicle, data.id)
        end

        SetVehicleMod(vehicle, data.id, data.value, customTyres)
    end,
    toggle = function(vehicle, data)
        ToggleVehicleMod(vehicle, TOGGLE_MODS[data.mod], data.enabled)
    end,
    wheelType = function(vehicle, data)
        SetVehicleWheelType(vehicle, data.value)
        return true
    end,
    colourIndex = function(vehicle, data)
        colourIndexSetters[data.field](vehicle, data.value)
    end,
    customColour = function(vehicle, data)
        local r, g, b = data.colour[1], data.colour[2], data.colour[3]

        if data.field == 'primary' then
            SetVehicleCustomPrimaryColour(vehicle, r, g, b)
        else
            SetVehicleCustomSecondaryColour(vehicle, r, g, b)
        end
    end,
    clearCustomColour = function(vehicle, data)
        if data.field == 'primary' then
            ClearVehicleCustomPrimaryColour(vehicle)
        else
            ClearVehicleCustomSecondaryColour(vehicle)
        end

        return true
    end,
    livery = function(vehicle, data)
        SetVehicleLivery(vehicle, data.value)
    end,
    roofLivery = function(vehicle, data)
        SetVehicleRoofLivery(vehicle, data.value)
    end,
    tyreSmokeColour = function(vehicle, data)
        SetVehicleTyreSmokeColor(vehicle, data.colour[1], data.colour[2], data.colour[3])
    end,
    xenonColour = function(vehicle, data)
        SetVehicleXenonLightsColor(vehicle, data.value)
    end,
    neon = function(vehicle, data)
        SetVehicleNeonLightEnabled(vehicle, data.side, data.enabled)
    end,
    neonColour = function(vehicle, data)
        SetVehicleNeonLightsColour(vehicle, data.colour[1], data.colour[2], data.colour[3])
    end,
    windowTint = function(vehicle, data)
        SetVehicleWindowTint(vehicle, data.value)
    end,
    plate = function(vehicle, data)
        SetVehicleNumberPlateText(vehicle, data.value)
    end,
    plateIndex = function(vehicle, data)
        SetVehicleNumberPlateTextIndex(vehicle, data.value)
    end,
    extra = function(vehicle, data)
        SetVehicleExtra(vehicle, data.id, not data.enabled) -- The native takes a "disable" flag
    end,
    resetMods = function(vehicle)
        for _, id in ipairs(MOD_IDS) do
            RemoveVehicleMod(vehicle, id)
        end

        for _, id in pairs(TOGGLE_MODS) do
            ToggleVehicleMod(vehicle, id, false)
        end

        return true
    end
}

RegisterNUICallback('dolu_tool:getVehicleCustomization', function(_, cb)
    cb(getCustomization(cache.vehicle))
end)

RegisterNUICallback('dolu_tool:customizeVehicle', function(data, cb)
    cb(1)
    local vehicle = cache.vehicle
    local setter = setters[data.type]

    if not setter or not vehicle or not DoesEntityExist(vehicle) then return end

    if not requestControl(vehicle) then
        lib.notify({
            title = 'Dolu Tool',
            description = locale('vehicle_no_control'),
            type = 'error',
            position = 'top'
        })

        -- Drop the optimistic UI update
        return sendCustomization(vehicle)
    end

    SetVehicleModKit(vehicle, 0)

    if setter(vehicle, data) then
        sendCustomization(vehicle)
    end
end)

RegisterNUICallback('dolu_tool:getVehicleProperties', function(_, cb)
    cb(cache.vehicle and lib.getVehicleProperties(cache.vehicle) or false)
end)

-- Keep the panel in sync when entering or leaving a vehicle while the menu is open
lib.onCache('vehicle', function(vehicle)
    if Client.isMenuOpen and Client.currentTab == 'vehicles' then
        sendCustomization(vehicle)
    end
end)
