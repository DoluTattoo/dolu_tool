-- Vehicles tab: vehicle spawning & quick actions

local function spawnVehicle(model, coords)
    if type(model) == 'string' then model = joaat(model) end

    local playerPed = cache.ped
    local oldVehicle = GetVehiclePedIsIn(playerPed, false)

    if oldVehicle > 0 and GetPedInVehicleSeat(oldVehicle, -1) == playerPed then
        DeleteVehicle(oldVehicle)
    end

    if not coords then
        coords = GetEntityCoords(playerPed)
    end

    lib.requestModel(model)

    local vehicle = CreateVehicle(model, coords.x, coords.y, coords.z, GetEntityHeading(playerPed), true, true)

    TaskWarpPedIntoVehicle(playerPed, vehicle, -1)
    SetVehRadioStation(vehicle, 'OFF')
    SetVehicleDirtLevel(vehicle, 0.0)

    if Config.customVehiclePlate and Config.customVehiclePlate ~= '' then
        SetVehicleNumberPlateText(vehicle, Config.customVehiclePlate)
    end

    cache.vehicle = vehicle
end

Menu.onTabOpen('vehicles', function()
    if Client.vehiclesLoaded then return end

    Utils.loadPage('vehicles', 1)
    Client.vehiclesLoaded = true
end)

RegisterNUICallback('dolu_tool:spawnVehicle', function(data, cb)
    cb(1)
    spawnVehicle(data)
end)

RegisterNUICallback('dolu_tool:spawnFavoriteVehicle', function(_, cb)
    cb(1)
    spawnVehicle(Config.favoriteVehicle)
end)

RegisterNUICallback('dolu_tool:deleteVehicle', function(_, cb)
    cb(1)
    if cache.vehicle and DoesEntityExist(cache.vehicle) then
        DeleteVehicle(cache.vehicle)
    end
end)

RegisterNUICallback('dolu_tool:upgradeVehicle', function(_, cb)
    cb(1)
    local vehicle = cache.vehicle

    if DoesEntityExist(vehicle) and IsEntityAVehicle(vehicle) then
        local max

        for _, modType in ipairs({ 11, 12, 13, 16 }) do
            max = GetNumVehicleMods(vehicle, modType) - 1
            SetVehicleMod(vehicle, modType, max, false)
        end

        ToggleVehicleMod(vehicle, 18, true) -- Turbo

        lib.notify({
            title = 'Dolu Tool',
            description = locale('vehicle_upgraded'),
            type = 'success',
            position = 'top'
        })
    end
end)

RegisterNUICallback('dolu_tool:repairVehicle', function(_, cb)
    cb(1)
    local vehicle = cache.vehicle

    SetVehicleFixed(vehicle)
    SetVehicleEngineHealth(vehicle, 1000.0)
    SetVehicleDirtLevel(vehicle, 0.0)
end)
