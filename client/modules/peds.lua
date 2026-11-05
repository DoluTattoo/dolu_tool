-- Peds tab: player model & ped quick actions

local PROP_IDS = { 0, 1, 2, 6, 7 }

-- The ped the player had before the first transformation
local originalPed

local function setPlayerModel(model)
    lib.requestModel(model)
    SetPlayerModel(cache.playerId, model)
    SetModelAsNoLongerNeeded(model)
    cache.ped = PlayerPedId()
end

local function saveOriginalPed()
    local ped = cache.ped
    local saved = { model = GetEntityModel(ped), components = {}, props = {} }

    for id = 0, 11 do
        saved.components[id] = { GetPedDrawableVariation(ped, id), GetPedTextureVariation(ped, id), GetPedPaletteVariation(ped, id) }
    end

    for _, id in ipairs(PROP_IDS) do
        saved.props[id] = { GetPedPropIndex(ped, id), GetPedPropTextureIndex(ped, id) }
    end

    originalPed = saved
end

local function changePed(model)
    if type(model) == 'string' then model = joaat(model) end

    if not IsModelInCdimage(model) then
        lib.notify({ type = 'error', description = locale('model_doesnt_exist', model) })
        return
    end

    if not originalPed then
        saveOriginalPed()
    end

    setPlayerModel(model)

    -- A new player model has no clothes selected until told otherwise
    SetPedDefaultComponentVariation(cache.ped)
end

local function restorePed()
    if not originalPed then return end

    setPlayerModel(originalPed.model)

    local ped = cache.ped

    for id, variation in pairs(originalPed.components) do
        SetPedComponentVariation(ped, id, variation[1], variation[2], variation[3])
    end

    for id, prop in pairs(originalPed.props) do
        if prop[1] < 0 then
            ClearPedProp(ped, id)
        else
            SetPedPropIndex(ped, id, prop[1], prop[2], true)
        end
    end

    originalPed = nil
end

Menu.onTabOpen('peds', function()
    if Client.pedsLoaded then return end

    Utils.loadPage('peds', 1)
    Client.pedsLoaded = true
end)

RegisterNUICallback('dolu_tool:changePed', function(data, cb)
    changePed(data.name)
    cb(originalPed ~= nil)
end)

RegisterNUICallback('dolu_tool:restorePed', function(_, cb)
    restorePed()
    cb(originalPed ~= nil)
end)

RegisterNUICallback('dolu_tool:cleanPed', function(_, cb)
    cb(1)
    local playerId = cache.ped

    ClearPedBloodDamage(playerId)
    ClearPedEnvDirt(playerId)
    ClearPedWetness(playerId)
end)

RegisterNUICallback('dolu_tool:setMaxHealth', function(_, cb)
    cb(1)
    local playerPed = PlayerPedId()

    SetEntityHealth(playerPed, GetEntityMaxHealth(playerPed))

    lib.notify({
        title = 'Dolu Tool',
        description = locale('max_health_set'),
        type = 'success',
        position = 'top'
    })
end)
