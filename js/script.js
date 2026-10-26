// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Modal elements
const modal = document.getElementById("imageModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");

// EDITED: Use NASA's new WordPress endpoint, which accepts requests without an API key.
const apiEndpoint = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

const spaceFact = document.getElementById("spaceFact");

const spaceFacts = [
  "Did You Know? One day on Venus is longer than one year on Venus.",
  "Did You Know? The footprints left on the Moon could last for millions of years.",
  "Did You Know? Jupiter has more than 90 known moons.",
  "💡 Did You Know? Neutron stars can spin over 600 times every second.",
  "💡 Did You Know? Light from the Sun takes about 8 minutes to reach Earth.",
  "💡 Did You Know? A teaspoon of a neutron star would weigh billions of tons on Earth."
];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the gallery button
const getImagesBtn = document.getElementById("getImagesBtn");

// Listen for a button click
getImagesBtn.addEventListener("click", async function () {
  const startDate = startInput.value;
  const endDate = endInput.value;

  const gallery = document.getElementById("gallery");

  // EDITED: Validate both dates before sending a request to NASA.
  if (!startDate || !endDate || !startInput.reportValidity() || !endInput.reportValidity()) {
    gallery.textContent = "Please select valid start and end dates.";
    return;
  }
  if (startDate > endDate) {
    gallery.textContent = "The start date must be on or before the end date.";
    return;
  }

  // EDITED: The live API uses date_from/date_to in YYMMDD format, not start_date/end_date.
  const dateFrom = startDate.replaceAll("-", "").slice(2);
  const dateTo = endDate.replaceAll("-", "").slice(2);
  const apiUrl = `${apiEndpoint}?date_from=${dateFrom}&date_to=${dateTo}&per_page=100`;

  // EDITED: Prevent overlapping requests while the current gallery is loading.
  getImagesBtn.disabled = true;

  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;

  try {
    // EDITED: Fetch every result page so ranges longer than 100 entries are complete.
    const data = [];
    let page = 1;
    let totalPages = 1;

    do {
      // EDITED: Request only gallery fields to avoid downloading full HTML documents.
      const response = await fetch(`${apiUrl}&page=${page}&_fields=date,title,hdurl,alt,explanation,media_type`);
      if (!response.ok) {
        throw new Error(`NASA request failed (HTTP ${response.status}). Please try again.`);
      }

      const pageData = await response.json();
      // EDITED: Check the response before using array methods on it.
      if (!Array.isArray(pageData)) {
        throw new Error("NASA returned an unexpected response. Please try again.");
      }

      data.push(...pageData);
      totalPages = Number(response.headers.get("X-WP-TotalPages")) || 1;
      page++;
    } while (page <= totalPages);

    displayGallery(data);

  } catch (error) {
    console.error("Something went wrong:", error);

    // EDITED: Show the failure reason as plain text instead of hiding every error.
    gallery.textContent = `Unable to load space photos. ${error.message}`;
  } finally {
    // EDITED: Re-enable the button after either a successful or failed request.
    getImagesBtn.disabled = false;
  }
});


function displayGallery(data) {
  const gallery = document.getElementById("gallery");

  gallery.innerHTML = "";

  // EDITED: Display photo entries with an image URL; video entries are not photos.
  const photos = data.filter(item => item.media_type === "image" && item.hdurl);
  if (photos.length === 0) {
    gallery.textContent = "No space photos were found for these dates. Try another range.";
    return;
  }

  photos.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "gallery-item";

    const image = document.createElement("img");
    // EDITED: url now points to a webpage; hdurl contains the actual image.
    image.src = item.hdurl;
    image.alt = item.alt || item.title;
    image.loading = "lazy";

    const title = document.createElement("p");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.date;

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(date);


    card.addEventListener("click", function () {
      openModal(item);
    });

    gallery.appendChild(card);
  });
}


function openModal(item) {
  // EDITED: Use the image URL and descriptive alt text in the modal as well.
  modalImage.src = item.hdurl;
  modalImage.alt = item.alt || item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  // EDITED: Convert the API's HTML explanation to plain text without inserting HTML into the page.
  const explanation = new DOMParser().parseFromString(item.explanation || "", "text/html");
  modalExplanation.textContent = explanation.body.textContent;

  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});


function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFact.textContent = spaceFacts[randomIndex];
}


showRandomFact();
