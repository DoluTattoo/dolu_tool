import { Context, createContext, useContext, useEffect, useState } from 'react'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { debugData } from '../utils/debugData'

interface Locale {
  cannot_goback: string
  no_marker: string
  command_tpm: string
  command_noclip: string
  command_openui: string
  command_weather_notfound: string
  teleport_invalid_coords: string
  model_doesnt_exist: string
  copied_coords_clipboard: string
  copied_model_clipboard: string
  press_escape_exit: string
  custom_location_created: string
  vehicle_upgraded: string
  weapon_gave: string
  weapon_cant_carry: string
  max_health_set: string
  entity_cant_be_loaded: string
  entity_doesnt_exist: string
  entity_deleted: string
  teleport_success: string
  ui_home: string
  ui_world: string
  ui_exit: string
  ui_copy_coords: string
  ui_copied_coords: string
  ui_copied_rotation: string
  ui_copy_rotation: string
  ui_copy_name: string
  ui_copied_name: string
  ui_copy_hash: string
  ui_copied_hash: string
  ui_name: string
  ui_hash: string
  ui_coords: string
  ui_heading: string
  ui_interior_id: string
  ui_current_room: string
  ui_teleport: string
  ui_not_in_interior: string
  ui_no_last_location: string
  ui_current_coords: string
  ui_set_coords: string
  ui_save_location: string
  ui_last_location: string
  ui_current_interior: string
  ui_quick_actions: string
  ui_clean_zone: string
  ui_clean_ped: string
  ui_upgrade_vehicle: string
  ui_repair_vehicle: string
  ui_delete_vehicle: string
  ui_set_sunny_day: string
  ui_spawn_vehicle: string
  ui_max_health: string
  ui_time_freeze: string
  ui_time_not_freeze: string
  ui_time: string
  ui_sync: string
  ui_freeze_time: string
  ui_weather: string
  ui_choose_weather: string
  ui_current_weather: string
  ui_freeze_weather: string
  ui_interior: string
  ui_room_count: string
  ui_portal_count: string
  ui_portals: string
  ui_infos: string
  ui_fill_portals: string
  ui_outline_portals: string
  ui_corcers_portals: string
  ui_flag: string
  ui_room_from: string
  ui_room_to: string
  ui_index: string
  ui_timecycle: string
  ui_no_timecycle_found: string
  ui_object_spawner: string
  ui_locations: string
  ui_snap_to_ground: string
  ui_duplicate: string
  ui_no_location_found: string
  ui_goto: string
  ui_show_custom_locations: string
  ui_show_vanilla_locations: string
  ui_create_custom_location: string
  ui_search: string
  ui_rename: string
  ui_delete: string
  ui_vanilla: string
  ui_custom: string
  ui_peds: string
  ui_no_ped_found: string
  ui_set_by_name: string
  ui_set_ped: string
  ui_vehicles: string
  ui_spawn: string
  ui_spawn_by_name: string
  ui_no_vehicle_found: string
  ui_weapons: string
  ui_give_weapon_by_name: string
  ui_give_weapon: string
  ui_no_weapon_found: string
  ui_set_coords_as_string: string
  ui_set_coords_separate: string
  ui_confirm: string
  ui_cancel: string
  ui_location_name: string
  ui_create_location_description: string
  ui_add_entity: string
  ui_add_entity_description: string
  ui_delete_all_entities: string
  ui_amount: string
  ui_portal_flag_1: string
  ui_portal_flag_2: string
  ui_portal_flag_4: string
  ui_portal_flag_8: string
  ui_portal_flag_16: string
  ui_portal_flag_32: string
  ui_portal_flag_64: string
  ui_portal_flag_128: string
  ui_portal_flag_256: string
  ui_portal_flag_512: string
  ui_portal_flag_1024: string
  ui_portal_flag_2048: string
  ui_portal_flag_4096: string
  ui_portal_flag_8192: string
  ui_update_warning: string
  ui_github: string
  ui_discord: string
  ui_support: string
  ui_audio: string
  ui_static_emitters: string
  ui_draw_static_emitters: string
  ui_draw_distance: string
  ui_closest_emitter_info: string
  ui_refresh: string
  ui_distance: string
  ui_meters: string
  ui_flags: string
  ui_room: string
  ui_radio_station: string
  ui_copy_interior_pos: string
  ui_copied_interior_pos: string
}

debugData(
  [
    {
      action: 'setLocale',
      data: {
        cannot_goback: "No last location found. You need to teleport somewhere first",
        no_marker: "You did not set any marker",
        command_tpm: "%s Teleport to marker",
        command_noclip: "%s Toggle noclip",
        command_openui: "%s Open Dolu Tool",
        command_weather_notfound: "Trying to set an invalid weather type: %s",
        teleport_invalid_coords: "Trying to teleport player to invalid coords type",
        model_doesnt_exist: "Model %s does not exists",
        copied_coords_clipboard: "Coords copied to clipboard",
        copied_model_clipboard: "Model hash copied to clipboard",
        press_escape_exit: "Press 'Escape' to exit edit mode",
        custom_location_created: "Custom location succefully created",
        vehicle_upgraded: "Vehicle succefully upgraded!",
        weapon_gave: "You just receive a weapon",
        weapon_cant_carry: "You cannot receive this weapon",
        max_health_set: "Max health succefully set",
        entity_cant_be_loaded: "The entity cannot be loaded...",
        entity_doesnt_exist: "Entity does not exist",
        entity_deleted: "Entity succefully deleted",
        teleport_success: "Succefully teleported. Use /goback to go back to last location",
        ui_home: "Home",
        ui_world: "World",
        ui_exit: "Exit",
        ui_copy_coords: "Copy coords",
        ui_copied_coords: "Copied coords",
        ui_copied_rotation: "Copied rotation",
        ui_copy_rotation: "Copy rotation",
        ui_copy_name: "Copy name",
        ui_copied_name: "Copied name",
        ui_copy_hash: "Copy hash",
        ui_copied_hash: "Copied hash",
        ui_name: "Name",
        ui_hash: "Hash",
        ui_coords: "Coords",
        ui_heading: "Heading",
        ui_interior_id: "Interior ID",
        ui_current_room: "Current Room",
        ui_teleport: "Teleport",
        ui_not_in_interior: "You are not inside any interior",
        ui_no_last_location: "You did not teleport to any location yet",
        ui_current_coords: "Current Coords",
        ui_set_coords: "Set coords",
        ui_save_location: "Save as location",
        ui_last_location: "Last Location",
        ui_current_interior: "Current Interior",
        ui_quick_actions: "Quick Actions",
        ui_clean_zone: "Clean zone",
        ui_clean_ped: "Clean ped",
        ui_upgrade_vehicle: "Upgrade vehicle",
        ui_repair_vehicle: "Repair vehicle",
        ui_delete_vehicle: "Delete vehicle",
        ui_set_sunny_day: "Set sunny day",
        ui_spawn_vehicle: "Spawn vehicle",
        ui_max_health: "Max health",
        ui_time_freeze: "Time frozen",
        ui_time_not_freeze: "Time not frozen",
        ui_time: "Time",
        ui_sync: "Sync",
        ui_freeze_time: "Freeze time",
        ui_weather: "Weather",
        ui_choose_weather: "Pick a weather type",
        ui_current_weather: "Current weather?",
        ui_freeze_weather: "Freeze weather",
        ui_interior: "Current Interior",
        ui_room_count: "Room count",
        ui_portal_count: "Portal count",
        ui_portals: "Portals",
        ui_infos: "Infos",
        ui_fill_portals: "Fill",
        ui_outline_portals: "Outline",
        ui_corcers_portals: "Corners",
        ui_flag: "Flag",
        ui_room_from: "Room from",
        ui_room_to: "Room to",
        ui_index: "Index",
        ui_timecycle: "Timecycle",
        ui_no_timecycle_found: "No timecycle found",
        ui_object_spawner: "Object Spawner",
        ui_locations: "Locations",
        ui_snap_to_ground: "Snap to ground",
        ui_duplicate: "Duplicate",
        ui_no_location_found: "No location found",
        ui_goto: "Go to",
        ui_show_custom_locations: "Show custom locations",
        ui_show_vanilla_locations: "Show vanilla locations",
        ui_create_custom_location: "Create custom location",
        ui_search: "Search",
        ui_rename: "Rename",
        ui_delete: "Delete",
        ui_vanilla: "Vanilla",
        ui_custom: "Custom",
        ui_peds: "Peds",
        ui_no_ped_found: "No ped found",
        ui_set_by_name: "Set by name",
        ui_set_ped: "Apply",
        ui_vehicles: "Vehicles",
        ui_spawn: "Spawn",
        ui_spawn_by_name: "Spawn by name",
        ui_no_vehicle_found: "No vehicle found",
        ui_weapons: "Weapons",
        ui_give_weapon_by_name: "Give weapon by name",
        ui_give_weapon: "Give",
        ui_no_weapon_found: "No weapon found",
        ui_set_coords_as_string: "Set as string",
        ui_set_coords_separate: "Set as separated values",
        ui_confirm: "Confirm",
        ui_cancel: "Cancel",
        ui_location_name: "Location name",
        ui_create_location_description: "Will save your current coords and heading",
        ui_add_entity: "Add a new entity",
        ui_add_entity_description: "Enter the name of the entity",
        ui_delete_all_entities: "Delete all spawned entities?",
        ui_amount: "Amount",
        ui_portal_flag_1: "Disables exterior rendering",
        ui_portal_flag_2: "Disables interior rendering",
        ui_portal_flag_4: "Mirror",
        ui_portal_flag_8: "Extra bloom",
        ui_portal_flag_16: "Unknown 16",
        ui_portal_flag_32: "Use exterior LOD",
        ui_portal_flag_64: "Hide when door closed",
        ui_portal_flag_128: "Unknown 128",
        ui_portal_flag_256: "Mirror exterior portals",
        ui_portal_flag_512: "Unknown 512",
        ui_portal_flag_1024: "Mirror limbo entities",
        ui_portal_flag_2048: "Unknown 2048",
        ui_portal_flag_4096: "Unknown 4096",
        ui_portal_flag_8192: "Disable farclipping",
        ui_update_warning: "Update available!",
        ui_github: "Open Github Repository",
        ui_discord: "Join Dolu Discord",
        ui_support: "Support me",
        ui_audio: "Audio",
        ui_static_emitters: 'Static Emitters',
        ui_draw_static_emitters: 'Show static emitters',
        ui_draw_distance: 'Draw Distance',
        ui_closest_emitter_info: 'Closest Emitter Info',
        ui_refresh: 'Refresh',
        ui_distance: 'Distance',
        ui_meters: 'meters',
        ui_flags: 'Flags',
        ui_room: 'Room',
        ui_radio_station: 'Radio Station',
        ui_copy_interior_pos: 'Copy Interior Pos',
        ui_copied_interior_pos: 'Copied Interior Pos',
      }
    },
  ],
  2000
)

interface LocaleContextValue {
  locale: Locale
  setLocale: (locales: Locale) => void
}

const LocaleCtx = createContext<LocaleContextValue | null>(null)

const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>({
    cannot_goback: '',
    no_marker: '',
    command_tpm: '',
    command_noclip: '',
    command_openui: '',
    command_weather_notfound: '',
    teleport_invalid_coords: '',
    model_doesnt_exist: '',
    copied_coords_clipboard: '',
    copied_model_clipboard: '',
    press_escape_exit: '',
    custom_location_created: '',
    vehicle_upgraded: '',
    weapon_gave: '',
    weapon_cant_carry: '',
    max_health_set: '',
    entity_cant_be_loaded: '',
    entity_doesnt_exist: '',
    entity_deleted: '',
    teleport_success: '',
    ui_home: '',
    ui_world: '',
    ui_exit: '',
    ui_copy_coords: '',
    ui_copied_coords: '',
    ui_copied_rotation: '',
    ui_copy_rotation: '',
    ui_copy_name: '',
    ui_copied_name: '',
    ui_copy_hash: '',
    ui_copied_hash: '',
    ui_name: '',
    ui_hash: '',
    ui_coords: '',
    ui_heading: '',
    ui_interior_id: '',
    ui_current_room: '',
    ui_teleport: '',
    ui_not_in_interior: '',
    ui_no_last_location: '',
    ui_current_coords: '',
    ui_set_coords: '',
    ui_save_location: '',
    ui_last_location: '',
    ui_current_interior: '',
    ui_quick_actions: '',
    ui_clean_zone: '',
    ui_clean_ped: '',
    ui_upgrade_vehicle: '',
    ui_repair_vehicle: '',
    ui_delete_vehicle: '',
    ui_set_sunny_day: '',
    ui_spawn_vehicle: '',
    ui_max_health: '',
    ui_time_freeze: '',
    ui_time_not_freeze: '',
    ui_time: '',
    ui_sync: '',
    ui_freeze_time: '',
    ui_weather: '',
    ui_choose_weather: '',
    ui_current_weather: '',
    ui_freeze_weather: '',
    ui_interior: '',
    ui_room_count: '',
    ui_portal_count: '',
    ui_portals: '',
    ui_infos: '',
    ui_fill_portals: '',
    ui_outline_portals: '',
    ui_corcers_portals: '',
    ui_flag: '',
    ui_room_from: '',
    ui_room_to: '',
    ui_index: '',
    ui_timecycle: '',
    ui_no_timecycle_found: '',
    ui_object_spawner: '',
    ui_locations: '',
    ui_snap_to_ground: '',
    ui_duplicate: '',
    ui_no_location_found: '',
    ui_goto: '',
    ui_show_custom_locations: '',
    ui_show_vanilla_locations: '',
    ui_create_custom_location: '',
    ui_search: '',
    ui_rename: '',
    ui_delete: '',
    ui_vanilla: '',
    ui_custom: '',
    ui_peds: '',
    ui_no_ped_found: '',
    ui_set_by_name: '',
    ui_set_ped: '',
    ui_vehicles: '',
    ui_spawn: '',
    ui_spawn_by_name: '',
    ui_no_vehicle_found: '',
    ui_weapons: '',
    ui_give_weapon_by_name: '',
    ui_give_weapon: '',
    ui_no_weapon_found: '',
    ui_set_coords_as_string: '',
    ui_set_coords_separate: '',
    ui_confirm: '',
    ui_cancel: '',
    ui_location_name: '',
    ui_create_location_description: '',
    ui_add_entity: '',
    ui_add_entity_description: '',
    ui_delete_all_entities: '',
    ui_amount: '',
    ui_portal_flag_1: '',
    ui_portal_flag_2: '',
    ui_portal_flag_4: '',
    ui_portal_flag_8: '',
    ui_portal_flag_16: '',
    ui_portal_flag_32: '',
    ui_portal_flag_64: '',
    ui_portal_flag_128: '',
    ui_portal_flag_256: '',
    ui_portal_flag_512: '',
    ui_portal_flag_1024: '',
    ui_portal_flag_2048: '',
    ui_portal_flag_4096: '',
    ui_portal_flag_8192: '',
    ui_update_warning: '',
    ui_github: '',
    ui_discord: '',
    ui_support: '',
    ui_audio: '',
    ui_static_emitters: '',
    ui_draw_static_emitters: '',
    ui_draw_distance: '',
    ui_closest_emitter_info: '',
    ui_refresh: '',
    ui_distance: '',
    ui_meters: '',
    ui_flags: '',
    ui_room: '',
    ui_radio_station: '',
    ui_copy_interior_pos: '',
    ui_copied_interior_pos: '',
  })

  useEffect(() => {
    fetchNui('loadLocale')
  }, [])

  useNuiEvent('setLocale', async (data: Locale) => setLocale(data))

  return <LocaleCtx.Provider value={{ locale, setLocale }}>{children}</LocaleCtx.Provider>
}

export default LocaleProvider

export const useLocales = () => useContext<LocaleContextValue>(LocaleCtx as Context<LocaleContextValue>)
