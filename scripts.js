function handleSearch(e) {
  e.preventDefault();
  const query = document.getElementById("search").value;
  if (query.trim()) {
    alert("Searching for: " + query);
  }
}

function filterCategory(category, btnElement) {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");

  const cards = document.querySelectorAll(".gallery-card");
  cards.forEach((card) => {
    if (category === "all" || card.dataset.category === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function filterGallery() {
  const input = document.getElementById("search").value.toLowerCase();
  const cards = document.querySelectorAll(".gallery-card");
  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(input)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("fullName").value;
  alert(`Thank you, ${name}! Your message has been received. We will get back to you soon.`);
  document.getElementById("contactForm").reset();
}
