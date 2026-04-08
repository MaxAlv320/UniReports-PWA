let db;

const request = indexedDB.open("GeoReportDB", 2);

request.onupgradeneeded = (e) => {
  db = e.target.result;

  if (db.objectStoreNames.contains("reports")) {
    db.deleteObjectStore("reports");
  }

  db.createObjectStore("reports", {
    autoIncrement: true,
  });
};

request.onsuccess = (e) => {
  db = e.target.result;
  console.log("Base de datos lista");
};

request.onerror = (e) => {
  console.error("Error al abrir DB:", e.target.error);
};

function saveReport(report) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Base de datos no inicializada");
      return;
    }

    const tx = db.transaction("reports", "readwrite");
    const store = tx.objectStore("reports");

    const req = store.add(report);

    req.onsuccess = () => resolve(true);
    req.onerror = (e) => {
      console.error("Error al guardar:", e.target.error);
      reject("Error DB: " + e.target.error);
    };
  });
}

function getReports() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Base de datos no inicializada");
      return;
    }

    const tx = db.transaction("reports", "readonly");
    const store = tx.objectStore("reports");

    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => {
      console.error("Error al obtener:", e.target.error);
      reject(e.target.error);
    };
  });
}
