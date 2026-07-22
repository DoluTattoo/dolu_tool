CreateThread(function()
    DisableIdleCamera(true)

    local looking = false

    while true do
        local canLook = Client.isMenuOpen or Client.gizmoEntity

        if canLook or Client.noClip then
            local rightClicking = IsDisabledControlPressed(0, 25) -- INPUT_AIM | RIGHT MOUSE BUTTON

            -- Enable controls while holding right click, otherwise disable everything
            if rightClicking then
                EnableAllControlActions(0)
                DisableControlAction(0, 16, true) -- INPUT_SELECT_NEXT_WEAPON | SCROLLWHEEL DOWN
                DisableControlAction(0, 17, true) -- INPUT_SELECT_PREV_WEAPON | SCROLLWHEEL UP
            else
                DisableAllControlActions(0)
            end

            -- Right click to-look
            if canLook then
                if rightClicking and not looking then
                    looking = true
                    SetNuiFocus(true, false)
                elseif not rightClicking and looking then
                    looking = false
                    SetNuiFocus(true, true)
                end
            else
                looking = false
            end

            Wait(0)
        else
            looking = false
            Wait(200)
        end
    end
end)
