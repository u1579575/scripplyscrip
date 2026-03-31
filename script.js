const API_KEY = "DEMO_KEY"; // Replace with your personal NASA API key for best results.
const APOD_URL = "https://api.nasa.gov/planetary/apod";
const GALLERY_DAYS = 9;
const SPACE_FACTS = [
  "A day on Venus lasts longer than a Venus year. Venus rotates so slowly that it takes longer to spin once than to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh billions of tons on Earth.",
  "The footprints left on the Moon can last for millions of years because there is no wind or rain to erase them.",
  "Light from the Sun takes a little over 8 minutes to reach Earth, so sunlight is always slightly in the past.",
  "Jupiter is so large that more than 1,300 Earths could fit inside it by volume.",
  "Saturn would float in an enormous bathtub because its average density is lower than water.",
  "A year on Mercury is only 88 Earth days, but one solar day there lasts about 176 Earth days.",
  "The observable universe contains hundreds of billions of galaxies, and each galaxy can contain billions of stars."
];

const gallery = document.getElementById("gallery");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const dateForm = document.getElementById("date-form");
const statusMessage = document.getElementById("status-message");
const gallerySummary = document.getElementById("gallery-summary");
const spaceFact = document.getElementById("space-fact");
const newFactBtn = document.getElementById("new-fact-btn");

const modal = document.getElementById("modal");
const modalMedia = document.getElementById("modal-media");
const modalDate = document.getElementById("modal-date");
const modalTitle = document.getElementById("modal-title");
const modalExplanation = document.getElementById("modal-explanation");
const modalLink = document.getElementById("modal-link");
const closeModalBtn = document.getElementById("close-modal-btn");

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function subtractDays(dateString, days) {
  return addDays(dateString, -days);
}

function toPrettyDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getDayDifference(startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / millisecondsPerDay);
}

function pickRandomFact() {
  const randomIndex = Math.floor(Math.random() * SPACE_FACTS.length);
  spaceFact.textContent = SPACE_FACTS[randomIndex];
}

function setDefaultDates() {
  const today = new Date();
  const endDate = formatDate(today);
  const startDate = subtractDays(endDate, GALLERY_DAYS - 1);

  startDateInput.value = startDate;
  endDateInput.value = endDate;
  startDateInput.max = endDate;
  endDateInput.max = endDate;
}

function syncEndDateFromStart() {
  if (!startDateInput.value) return;
  endDateInput.value = addDays(startDateInput.value, GALLERY_DAYS - 1);
}

function syncStartDateFromEnd() {
  if (!endDateInput.value) return;
  startDateInput.value = subtractDays(endDateInput.value, GALLERY_DAYS - 1);
}

function showStatus(message) {
  statusMessage.textContent = message;
}

function clearGallery() {
  gallery.innerHTML = "";
}

function showEmptyState(message) {
  clearGallery();
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.textContent = message;
  gallery.appendChild(emptyState);
}

function createMediaMarkup(item) {
  const isVideo = item.media_type === "video";
  const imageSource = isVideo
    ? item.thumbnail_url || "https://apod.nasa.gov/apod/image/1901/IC405_Abolfath_3953.jpg"
    : item.url;

  return `
    <div class="card-media">
      <img src="${imageSource}" alt="${item.title}" loading="lazy" />
      ${isVideo ? '<span class="media-badge">Video</span>' : ""}
    </div>
  `;
}

function createCard(item) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "gallery-card";
  card.innerHTML = `
    ${createMediaMarkup(item)}
    <div class="card-body">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-date">${toPrettyDate(item.date)}</p>
    </div>
  `;

  card.addEventListener("click", () => openModal(item));
  gallery.appendChild(card);
}

function isEmbeddableVideo(url) {
  return /youtube\.com|youtu\.be|player\.vimeo\.com|vimeo\.com/.test(url);
}

function getEmbeddableVideoUrl(url) {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split(/[?&]/)[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1].split(/[?&/]/)[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

function openModal(item) {
  modalMedia.innerHTML = "";
  modalLink.classList.add("hidden");
  modalDate.textContent = toPrettyDate(item.date);
  modalTitle.textContent = item.title;
  modalExplanation.textContent = item.explanation || "No explanation available.";

  const isVideo = item.media_type === "video";

  if (isVideo && isEmbeddableVideo(item.url)) {
    const iframe = document.createElement("iframe");
    iframe.src = getEmbeddableVideoUrl(item.url);
    iframe.title = item.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    modalMedia.appendChild(iframe);
    modalLink.classList.remove("hidden");
    modalLink.href = item.url;
    modalLink.textContent = "Open Original Video";
  } else if (isVideo) {
    const preview = document.createElement("img");
    preview.src = item.thumbnail_url || "https://apod.nasa.gov/apod/image/1901/IC405_Abolfath_3953.jpg";
    preview.alt = item.title;
    modalMedia.appendChild(preview);
    modalLink.classList.remove("hidden");
    modalLink.href = item.url;
    modalLink.textContent = "Open Video";
  } else {
    const image = document.createElement("img");
    image.src = item.hdurl || item.url;
    image.alt = item.title;
    modalMedia.appendChild(image);
    modalLink.classList.remove("hidden");
    modalLink.href = item.hdurl || item.url;
    modalLink.textContent = "Open Full Image";
  }

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  modalMedia.innerHTML = "";
  modalLink.classList.add("hidden");
}

async function fetchGallery() {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    showStatus("Please choose a valid date range.");
    return;
  }

  const dayDifference = getDayDifference(startDate, endDate);

  if (dayDifference !== GALLERY_DAYS - 1) {
    showEmptyState("Please choose exactly 9 consecutive days.");
    showStatus("The selected range must be exactly 9 consecutive days.");
    return;
  }

  clearGallery();
  gallerySummary.textContent = "";
  showStatus("Loading NASA gallery...");

  const params = new URLSearchParams({
    api_key: API_KEY,
    start_date: startDate,
    end_date: endDate,
    thumbs: "true"
  });

  try {
    const response = await fetch(`${APOD_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`NASA API request failed with status ${response.status}.`);
    }

    let data = await response.json();

    if (!Array.isArray(data)) {
      data = [data];
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!data.length) {
      showEmptyState("No gallery items were returned for this date range.");
      showStatus("No data found.");
      return;
    }

    if (data.length !== GALLERY_DAYS) {
      showEmptyState("The API did not return exactly 9 entries for that range. Try another range.");
      showStatus("The gallery needs exactly 9 APOD entries.");
      return;
    }

    data.forEach(createCard);

    gallerySummary.textContent = `Showing ${data.length} APOD entries from ${toPrettyDate(startDate)} to ${toPrettyDate(endDate)}.`;
    showStatus("");
  } catch (error) {
    console.error(error);
    showEmptyState("Something went wrong while loading NASA data.");
    showStatus("The gallery could not be loaded. Check your API key and try again.");
  }
}

startDateInput.addEventListener("change", syncEndDateFromStart);
endDateInput.addEventListener("change", syncStartDateFromEnd);
newFactBtn.addEventListener("click", pickRandomFact);

dateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchGallery();
});

closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

setDefaultDates();
pickRandomFact();
fetchGallery();
