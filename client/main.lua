-- Client state & bootstrap

Client = {
    noClip = false,
    isMenuOpen = false,
    captureKeybind = false,
    currentTab = 'home',
    lastLocation = json.decode(GetResourceKvpString('dolu_tool:lastLocation')),
    portalPoly = false,
    portalLines = false,
    portalCorners = false,
    portalInfos = false,
    interiorId = GetInteriorFromEntity(cache.ped),
    defaultTimecycles = {},
    spawnedEntities = {},
    freezeTime = false,
    freezeWeather = false,
    data = {}
}

if not Shared.isUiLoaded then
    lib.notify({
        type = 'error',
        icon = 'fa-solid fa-ban',
        title = 'Dolu Tool',
        description = 'Unable to load UI. Build dolu_tool or download the latest release',
        duration = 20000
    })
end

-- Send the loaded locale to the NUI
RegisterNUICallback('loadLocale', function(_, cb)
    cb(Shared.locale)
end)

-- Get data from shared/data json files
lib.callback('dolu_tool:getData', false, function(data)
    data.timecycles = Utils.getTimecycleModifiers()
    Client.data = data
end)

CreateThread(function()
    Utils.setMenuPlayerCoords()

    Client.version = lib.callback.await('dolu_tool:getVersion', false)
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
        SetNoclipActive(false)
    end
end)
