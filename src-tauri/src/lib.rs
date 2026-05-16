use tauri::Emitter;
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        let _ = update(handle).await;
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
  if let Some(update) = app.updater()?.check().await? {
    let mut downloaded = 0;
    let _ = app.emit("updater-message", "Une mise à jour est disponible !");
    
    update.download_and_install(|chunk_length, content_length| {
      downloaded += chunk_length;
      if let Some(total) = content_length {
        let percent = (downloaded as f64 / total as f64) * 100.0;
        let _ = app.emit("updater-message", format!("Téléchargement : {:.2}%", percent));
      }
    }, || {
      let _ = app.emit("updater-message", "Installation en cours...");
    }).await?;
    
    let _ = app.emit("updater-message", "Mise à jour terminée. Redémarrage...");
  } else {
    let _ = app.emit("updater-message", "L'application est à jour.");
  }
  Ok(())
}

