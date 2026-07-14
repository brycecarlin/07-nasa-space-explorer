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

// NASA API key
const apiKey = "xXBDbTgoOFhhPjFde6UTEEi2rxSegqXEUkwICvqh";

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

  const apiUrl =
    `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  const gallery = document.getElementById("gallery");

  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log(data);
    displayGallery(data);

  } catch (error) {
    console.error("Something went wrong:", error);

    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">❌</div>
        <p>Unable to load space photos. Please try again.</p>
      </div>
    `;
  }
});


function displayGallery(data) {
  const gallery = document.getElementById("gallery");

  gallery.innerHTML = "";

  data.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "gallery-item";

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.title;

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
  modalImage.src = item.hdurl || item.url;
  modalImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

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