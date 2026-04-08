if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        console.log("Service Worker registrado:", reg.scope);

        if ("sync" in reg) {
          reg.sync
            .register("sync-reports")
            .then(() => console.log("Sync registrado"))
            .catch((err) => console.log("Error al registrar sync:", err));
        }
      })
      .catch((err) => console.log("Error al registrar SW:", err));
  });
}

window.addEventListener("online", () => {
  console.log("Conexión restaurada");
});

window.addEventListener("offline", () => {
  console.log("Sin conexión");
});
