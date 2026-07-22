-- Menu lifecycle

Menu = {}

local tabOpenHandlers = {}

Menu.onTabOpen = function(tab, handler)
    tabOpenHandlers[tab] = handler
end

Menu.open = function()
    local coords = GetEntityCoords(cache.ped)

    SendNUIMessage({
        action = 'setMenuVisible',
        data = {
            version = Client.version,
            lastLocation = Client.lastLocation,
            position = ('%.4f, %.4f, %.4f'):format(coords.x, coords.y, coords.z)
        }
    })

    -- Refresh the current tab so its data is up to date when reopening the menu
    local onTabOpen = tabOpenHandlers[Client.currentTab]

    if onTabOpen then
        onTabOpen()
    end

    -- keepInput stays enabled so the game can read the right mouse button while
    -- the menu is open (used to look around with the noclip camera). All gameplay
    -- controls are disabled in controls.lua, so nothing leaks through.
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
    Client.isMenuOpen = true
end

Menu.onTabOpen('home', function()
    Utils.setMenuPlayerCoords()
end)

RegisterNUICallback('dolu_tool:tabSelected', function(newTab, cb)
    cb(1)
    local previousTab = Client.currentTab

    Client.currentTab = newTab

    -- If exiting object tab while gizmo is enabled, set gizmo disabled
    if previousTab == 'object' and newTab ~= 'object' then
        SendNUIMessage({
            action = 'setGizmoEntity',
            data = {}
        })

        Client.gizmoEntity = nil
    end

    local onTabOpen = tabOpenHandlers[newTab]

    if onTabOpen then
        onTabOpen()
    end
end)

RegisterNUICallback('dolu_tool:exit', function(_, cb)
    cb(1)
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = 'setGizmoEntity',
        data = {}
    })
    Client.gizmoEntity = nil
    Client.isMenuOpen = false
end)

RegisterNUICallback('dolu_tool:loadPages', function(data, cb)
    cb(1)
    Utils.loadPage(data.type, data.activePage, data.filter, data.checkboxes)
end)

-- Sync current coords to NUI
CreateThread(function()
    local oldCoords = vec3(0, 0, 0)
    local oldHeading = 0

    while true do
        if Client.isMenuOpen and Client.currentTab == 'home' then
            local coords, heading = Utils.setMenuPlayerCoords()

            if #(coords - oldCoords) > 0.25 or heading - oldHeading > 1 then
                oldCoords = coords
                oldHeading = heading
            end
        else
            Wait(200)
        end

        Wait(50)
    end
end)
