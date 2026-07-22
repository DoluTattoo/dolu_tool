local vec3 = vec3
local IsPauseMenuActive = IsPauseMenuActive
local GetSmartControlNormal = GetSmartControlNormal

local SETTINGS = _G.CONTROL_SETTINGS
local CONTROLS = _G.CONTROL_MAPPING

local faster, slower = false, false

local speedMultiplier = SETTINGS.BASE_MOVE_MULTIPLIER
-------------------------------------------------------------------------------
local function GetSpeedMultiplier()
	local frameMultiplier = GetFrameTime() * 60

	if IsDisabledControlPressed(0, CONTROLS.MOVE_SLOW) then -- Scroll Up
		if speedMultiplier > 1.0 then
			speedMultiplier = speedMultiplier - 0.5
		elseif speedMultiplier > 0.2 then
			speedMultiplier = speedMultiplier - 0.1
		else
			speedMultiplier = speedMultiplier - 0.01
		end
	elseif IsDisabledControlPressed(0, CONTROLS.MOVE_FAST) then -- Scroll Down
		if speedMultiplier < 0.2 then
			speedMultiplier = speedMultiplier + 0.01
		elseif speedMultiplier > 1.0 then
			speedMultiplier = speedMultiplier + 0.5
		else
			speedMultiplier = speedMultiplier + 0.1
		end
	end

	-- Hold shift to go faster
	if IsDisabledControlJustPressed(0, 21) and not slower then
		faster = true
		speedMultiplier = speedMultiplier*5
	end
	if IsDisabledControlJustReleased(0, 21) and faster and not slower then
		faster = false
		speedMultiplier = speedMultiplier/5
	end

	-- Hold Alt to go slower
	if IsDisabledControlJustPressed(0, 19) and not faster then
		slower = true
		speedMultiplier = speedMultiplier/5
	end
	if IsDisabledControlJustReleased(0, 19) and slower and not faster then
		slower = false
		speedMultiplier = speedMultiplier*5
	end

	if speedMultiplier <= 0.0 then
		speedMultiplier = 0.01
	end
	if speedMultiplier > 15.0 then
		speedMultiplier = 15.0
	end

	return speedMultiplier * frameMultiplier
end

local function UpdateCamera()
	if not IsFreecamActive() or IsPauseMenuActive() then
		return
	end

	if not IsFreecamFrozen() then
		local vecX, vecY = GetFreecamMatrix()
		local vecZ = vec3(0, 0, 1)

		local pos = GetFreecamPosition()
		local rot = GetFreecamRotation()

		-- Get speed multiplier for movement
		local speedMultiplier = GetSpeedMultiplier()

		-- Get camera input
		local lookX, lookY = 0, 0
		local moveX, moveY, moveZ = 0, 0, 0

		if (not Client.isMenuOpen and not Client.gizmoEntity) or IsDisabledControlPressed(0, 25) then
			lookX = GetSmartControlNormal(CONTROLS.LOOK_X)
			lookY = GetSmartControlNormal(CONTROLS.LOOK_Y)
			moveX = GetSmartControlNormal(CONTROLS.MOVE_X)
			moveY = GetSmartControlNormal(CONTROLS.MOVE_Y)
			moveZ = GetSmartControlNormal(CONTROLS.MOVE_Z)
		end

		-- Calculate new rotation.
		local rotX = rot.x + (-lookY * SETTINGS.LOOK_SENSITIVITY_X)
		local rotZ = rot.z + (-lookX * SETTINGS.LOOK_SENSITIVITY_Y)
		local rotY = rot.y

		-- Adjust position relative to camera rotation.
		pos = pos + (vecX * moveX * speedMultiplier)
		pos = pos + (vecY * -moveY * speedMultiplier)
		pos = pos + (vecZ * moveZ * speedMultiplier)

		-- Adjust new rotation
		rot = vec3(rotX, rotY, rotZ)

		-- Update camera

		if pos ~= GetFreecamPosition() then
			SetFreecamPosition(pos)
		end

		SetFreecamRotation(rot)

		return pos, rotZ
	end

	-- Trigger a tick event. Resources depending on the freecam position can
	-- make use of this event.
	-- TriggerEvent('freecam:onTick')
end

-------------------------------------------------------------------------------
function StartFreecamThread()
	-- Camera/Pos updating thread
	CreateThread(function()
		local ped = cache.ped

		SetFreecamPosition(GetEntityCoords(ped))

		local function updatePos(pos, rotZ)
			if pos and DoesEntityExist(ped) then
				-- Update ped
				SetEntityCoords(ped, pos.x, pos.y, pos.z)

				-- Update veh
				local veh = cache.seat == -1 and cache.vehicle

				if veh then
					SetEntityCoords(veh, pos.x, pos.y, pos.z)
				end

				SetEntityHeading(ped, rotZ)
			end
		end

		local loopPos, loopRotZ
		while IsFreecamActive() do
			loopPos, loopRotZ = UpdateCamera()
			if loopPos then
				updatePos(loopPos, loopRotZ)
			end
			Wait(0)
		end
	end)
end
