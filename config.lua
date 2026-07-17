-- Documentation: https://dolutattoo.github.io/docs/category/dolu_tool
Config = {}

-- Language (locale files are in the 'locales' folder).
Config.language = 'en'

-- Default keybinds. Everything is rebindable in-game from the Settings tab,
-- combos are supported (e.g. 'ALT+F3').
Config.openMenuKey = 'F3'
Config.toggleNoclipKey = 'F11'
Config.teleportMarkerKey = 'F10'
Config.gobackKey = '' -- unbound by default (also available via /goback)

Config.favoriteVehicle = 'adder'
Config.customVehiclePlate = '~DOLU~' -- leave empty to keep the default plate.

-- Permissions (ace based). Set usePermission to false to allow everyone.
Config.usePermission = false
Config.permission = { 'group.admin', 'qbcore.dev' }
