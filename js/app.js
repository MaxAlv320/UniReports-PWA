const openCameraBtn = document.getElementById("openCamera");
const takePhotoBtn = document.getElementById("takePhoto");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
const saveBtn = document.getElementById("saveReport");
const reportsContainer = document.getElementById("reports");

let stream = null;
let imageData = null;

openCameraBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    video.srcObject = stream;
    video.style.display = "block";
    takePhotoBtn.style.display = "block";
    openCameraBtn.style.display = "none";
  } catch (err) {
    alert("No se pudo abrir la cámara: " + err.message);
  }
};

takePhotoBtn.onclick = () => {
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  imageData = canvas.toDataURL("image/jpeg", 0.7);

  preview.src = imageData;
  preview.style.display = "block";

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  video.style.display = "none";
  takePhotoBtn.style.display = "none";
  openCameraBtn.style.display = "inline-block";
};

function getLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            city: Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)},
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          console.error("Error de geolocalización:", error);
          resolve({ city: "Ubicación no permitida", lat: null, lon: null });
        },
      );
    } else {
      resolve({ city: "GPS no soportado", lat: null, lon: null });
    }
  });
}

saveBtn.onclick = async () => {
  const title = document.getElementById("title").value;
  const desc = document.getElementById("description").value;

  if (!title || !desc) {
    alert("Faltan el título o la descripción");
    return;
  }

  if (!imageData) {
    alert("Debes tomar una foto primero");
    return;
  }

  saveBtn.textContent = "Guardando...";
  saveBtn.disabled = true;

  try {
    const loc = await getLocation();

    const report = {
      title: title.trim(),
      desc: desc.trim(),
      img: imageData,
      city: loc.city,
      lat: loc.lat,
      lon: loc.lon,
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      status: "pendiente", 
    };

    await saveReport(report);
    alert("¡Reporte guardado con éxito!");

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    imageData = null;
    preview.src = "";
    preview.style.display = "none";

    await render();
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Error al guardar: " + error);
  } finally {
    saveBtn.textContent = "Guardar Reporte";
    saveBtn.disabled = false;
  }
};

async function render() {
  try {
    const reports = await getReports();
    reportsContainer.innerHTML = "";

    if (!reports || reports.length === 0) {
      reportsContainer.innerHTML =
        "<p class='empty-message'>No hay reportes aún. ¡Crea el primero!</p>";
      return;
    }

    reports.reverse().forEach((r) => {
      const div = document.createElement("div");
      div.className = "report";
      const status = r.status || "pendiente";

      let locationHtml = "";
      if (r.lat && r.lon) {
        locationHtml = `<a href="https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}&zoom=15" target="_blank" class="location-link">
          📍 ${r.city}
        </a>`;
      } else {
        locationHtml = <span class="location-text">📍 ${r.city}</span>;
      }

      div.innerHTML = `
        <h3>📌 ${escapeHtml(r.title)}</h3>

        <span class="status ${status}">
          ${status.toUpperCase()}
        </span>

        <p>${escapeHtml(r.desc)}</p>
        <img src="${r.img}" alt="Foto del reporte">
        <p>${locationHtml}</p>
        <small>📅 ${escapeHtml(r.date)}</small>
      `;

      reportsContainer.appendChild(div);
    });

    console.log(Mostrando ${reports.length} reportes);
  } catch (error) {
    console.error("Error al renderizar:", error);
    reportsContainer.innerHTML =
      "<p class='error-message'>Error al cargar los reportes</p>";
  }
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

setTimeout(async () => {
  await render();
}, 1000);
const banner = document.getElementById("offlineBanner");

function updateOnlineStatus() {
  if (navigator.onLine) {
    banner.classList.add("hidden");
  } else {
    banner.classList.remove("hidden");
  }
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

updateOnlineStatus();