-- Peds tab: player model & ped quick actions

local function changePed(model)
    if type(model) == 'string' then model = joaat(model) end

    if not IsModelInCdimage(model) then
        lib.notify({ type = 'error', description = locale('model_doesnt_exist', model) })
        return
    end

    local playerId = cache.playerId

    lib.requestModel(model)
    SetPlayerModel(playerId, model)
    cache.ped = PlayerPedId()
end

Menu.onTabOpen('peds', function()
    if Client.pedsLoaded then return end

    Utils.loadPage('peds', 1)
    Client.pedsLoaded = true
end)

RegisterNUICallback('dolu_tool:changePed', function(data, cb)
    cb(1)
    changePed(data.name)
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
