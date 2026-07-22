-- Weapons tab: weapon giving

Menu.onTabOpen('weapons', function()
    if Client.weaponsLoaded then return end

    Utils.loadPage('weapons', 1)
    Client.weaponsLoaded = true
end)

RegisterNUICallback('dolu_tool:giveWeapon', function(weaponName, cb)
    cb(1)
    if Shared.ox_inventory then
        lib.callback('dolu_tool:giveWeaponToPlayer', false, function(result)
            if result then
                lib.notify({ type = 'success', description = locale('weapon_gave') })
            else
                lib.notify({ type = 'error', description = locale('weapon_cant_carry') })
            end
        end, weaponName)

        return
    else
        GiveWeaponToPed(cache.ped, joaat(weaponName), 999, false, true)
    end
end)
