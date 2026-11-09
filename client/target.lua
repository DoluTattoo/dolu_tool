-- ox_target integration

CreateThread(function()
    if not GetResourceState('ox_target'):find('start') then return end
    if Config.usePermission and not lib.callback.await('dolu_tool:isAllowed', 100, true) then return end

    exports.ox_target:addGlobalObject({
        {
            name = 'ox:option0_name',
            icon = 'fa-solid fa-copy',
            label = 'Copy model name',
            distance = 10,
            onSelect = function(data)
                local modelName = GetEntityArchetypeName(data.entity)

                if not modelName or modelName == '' then
                    return lib.notify({ type = 'error', description = locale('model_name_not_found') })
                end

                lib.setClipboard(modelName)
                lib.notify({ type = 'success', description = locale('copied_model_name_clipboard') })
            end
        },
        {
            name = 'ox:option0',
            icon = 'fa-regular fa-copy',
            label = 'Copy model hash',
            distance = 10,
            onSelect = function(data)
                local model = GetEntityModel(data.entity)
                lib.setClipboard(tostring(model))
                lib.notify({ type = 'success', description = locale('copied_model_clipboard') })
            end
        },
        {
            name = 'ox:option1',
            icon = 'fa-solid fa-location-dot',
            label = 'Copy coords',
            distance = 10,
            onSelect = function(data)
                local coords = GetEntityCoords(data.entity)
                lib.setClipboard(coords.x .. ', ' .. coords.y .. ', ' .. coords.z)
                lib.notify({ type = 'success', description = locale('copied_coords_clipboard') })
            end
        },
        {
            name = 'ox:option2',
            icon = 'fa-solid fa-maximize',
            label = 'Move object',
            distance = 10,
            canInteract = function()
                return Client.gizmoEntity == nil
            end,
            onSelect = function(data)
                SendNUIMessage({
                    action = 'setGizmoEntity',
                    data = {
                        name = 'Unknown Game Object',
                        hash = 0,
                        handle = data.entity,
                        position = GetEntityCoords(data.entity),
                        rotation = GetEntityRotation(data.entity),
                    }
                })
                Client.gizmoEntity = data.entity
                SetNuiFocus(true, true)
                SetNuiFocusKeepInput(true)
                lib.notify({ type = 'info', description = locale('press_escape_exit') })
            end
        },
        {
            name = 'ox:option4',
            icon = 'fa-solid fa-down-long',
            label = 'Snap to ground',
            distance = 10,
            onSelect = function(data)
                PlaceObjectOnGroundProperly(data.entity)
            end
        },
        {
            name = 'ox:option5',
            icon = 'fa-solid fa-trash',
            label = 'Delete entity',
            distance = 10,
            onSelect = function(data)
                SetEntityAsMissionEntity(data.entity, false, false)
                DeleteEntity(data.entity)
            end
        }
    })
end)
