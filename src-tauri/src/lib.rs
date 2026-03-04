// Tauri shell — kept intentionally minimal.
// All application logic lives in React. This file handles:
//   1. macOS activation policy (no dock icon, no app switcher)
//   2. Global hotkey (Cmd+Shift+L) to show/hide the panel

use tauri::Manager;

#[cfg(target_os = "macos")]
unsafe fn force_aqua_appearance() {
    use objc2::runtime::{AnyClass, AnyObject};
    use std::ffi::CStr;

    let Some(string_class) = AnyClass::get(c"NSString") else { return };
    let Some(appearance_class) = AnyClass::get(c"NSAppearance") else { return };
    let Some(app_class) = AnyClass::get(c"NSApplication") else { return };

    let c_name = CStr::from_bytes_with_nul(b"NSAppearanceNameAqua\0").unwrap();
    let ns_name: *mut AnyObject = objc2::msg_send![string_class, stringWithUTF8String: c_name.as_ptr()];
    if ns_name.is_null() { return; }

    let appearance: *mut AnyObject = objc2::msg_send![appearance_class, appearanceNamed: ns_name];
    if appearance.is_null() { return; }

    // Set on NSApplication — affects all windows and menus in this process
    let ns_app: *mut AnyObject = objc2::msg_send![app_class, sharedApplication];
    if !ns_app.is_null() {
        let _: () = objc2::msg_send![&*ns_app, setAppearance: &*appearance];
    }
}
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // No dock icon, no app switcher — panel is an invisible utility
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Force standard Aqua appearance so NSMenus render clean (not glassy)
            #[cfg(target_os = "macos")]
            unsafe { force_aqua_appearance(); }

            // Cmd+Shift+L — show or hide the panel from anywhere on the desktop
            let shortcut =
                Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyL);

            let app_handle = app.handle().clone();
            app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
                if event.state() != ShortcutState::Pressed { return; }
                if let Some(window) = app_handle.get_webview_window("main") {
                    match window.is_visible() {
                        Ok(true) => { let _ = window.hide(); }
                        _ => {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
