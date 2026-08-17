const STORAGE_KEY = "myStudyNotes";

let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: Date.now(),
    title: "What is a callback function?",
    category: "JavaScript",
    content: `A callback function is a function passed to another function as an argument and executed later.

Example:

function greet(name, callback) {
    callback(name);
}

greet("Kadeeja", function(name) {
    console.log("Hello " + name);
});`,
    favorite: false,
    createdAt: new Date().toLocaleDateString()
  },
  {
    id: Date.now() + 1,
    title: "What is the label element?",
    category: "HTML",
    content: `The <label> element gives a text description for a form control such as an input, checkbox or radio button.

Example:

<label for="email">Email</label>
<input type="email" id="email">

The for attribute connects the label to the input using the input's id.`,
    favorite: false,
    createdAt: new Date().toLocaleDateString()
  }
];

let selectedCategory = "All";
let currentViewId = null;
let editingId = null;

const notesGrid = document.getElementById("notesGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const viewModal = document.getElementById("viewModal");
const viewTitle = document.getElementById("viewTitle");
const viewCategory = document.getElementById("viewCategory");
const viewContent = document.getElementById("viewContent");
const viewDate = document.getElementById("viewDate");
const favoriteBtn = document.getElementById("favoriteBtn");

const editModal = document.getElementById("editModal");
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteCategory = document.getElementById("noteCategory");
const noteContent = document.getElementById("noteContent");
const modalTitle = document.getElementById("modalTitle");

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = notes.filter(note => {
    const matchesCategory =
      selectedCategory === "All" || note.category === selectedCategory;

    const matchesSearch =
      note.title.toLowerCase().includes(search) ||
      note.content.toLowerCase().includes(search) ||
      note.category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  notesGrid.innerHTML = "";

  filtered.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";

    card.addEventListener("click", () => viewNote(note.id));

    card.innerHTML = `
      <div class="note-top">
        <span class="badge">${escapeHTML(note.category)}</span>
        ${note.favorite ? "<span title='Favorite'>⭐</span>" : ""}
      </div>

      <h3>${escapeHTML(note.title)}</h3>

      <p class="note-content">${escapeHTML(note.content)}</p>

      <div class="note-actions">
        <button class="small-btn edit-card-btn">✏️ Edit</button>
        <button class="small-btn delete-card-btn">🗑️ Delete</button>
      </div>
    `;

    card.querySelector(".edit-card-btn").addEventListener("click", event => {
      event.stopPropagation();
      editNote(note.id);
    });

    card.querySelector(".delete-card-btn").addEventListener("click", event => {
      event.stopPropagation();
      deleteNote(note.id);
    });

    notesGrid.appendChild(card);
  });

  emptyState.classList.toggle("hidden", filtered.length !== 0);
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function viewNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  currentViewId = id;

  viewTitle.textContent = note.title;
  viewCategory.textContent = note.category;
  viewContent.textContent = note.content;
  viewDate.textContent = `Saved on ${note.createdAt || "Recently"}`;

  updateFavoriteButton(note);

  viewModal.classList.remove("hidden");
}

function updateFavoriteButton(note) {
  favoriteBtn.textContent = note.favorite ? "★" : "☆";
  favoriteBtn.title = note.favorite ? "Remove from favorites" : "Add to favorites";
}

function closeViewModal() {
  viewModal.classList.add("hidden");
  currentViewId = null;
}

function openEditModal(note = null) {
  editModal.classList.remove("hidden");

  if (note) {
    editingId = note.id;
    modalTitle.textContent = "Edit your note";
    noteTitle.value = note.title;
    noteCategory.value = note.category;
    noteContent.value = note.content;
  } else {
    editingId = null;
    modalTitle.textContent = "Add a new note";
    noteForm.reset();
  }

  setTimeout(() => noteTitle.focus(), 50);
}

function closeEditModal() {
  editModal.classList.add("hidden");
  noteForm.reset();
  editingId = null;
}

function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  closeViewModal();
  openEditModal(note);
}

function deleteNote(id) {
  const note = notes.find(n => n.id === id);

  if (!note) return;

  if (confirm(`Delete "${note.title}"?`)) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();

    if (currentViewId === id) {
      closeViewModal();
    }
  }
}

document.getElementById("addBtn").addEventListener("click", () => {
  openEditModal();
});

document.getElementById("closeView").addEventListener("click", closeViewModal);
document.getElementById("closeEdit").addEventListener("click", closeEditModal);
document.getElementById("cancelBtn").addEventListener("click", closeEditModal);

viewModal.addEventListener("click", event => {
  if (event.target === viewModal) closeViewModal();
});

editModal.addEventListener("click", event => {
  if (event.target === editModal) closeEditModal();
});

document.getElementById("viewEditBtn").addEventListener("click", () => {
  if (currentViewId !== null) {
    editNote(currentViewId);
  }
});

document.getElementById("viewDeleteBtn").addEventListener("click", () => {
  if (currentViewId !== null) {
    deleteNote(currentViewId);
  }
});

favoriteBtn.addEventListener("click", () => {
  if (currentViewId === null) return;

  const note = notes.find(n => n.id === currentViewId);
  if (!note) return;

  note.favorite = !note.favorite;
  saveNotes();
  updateFavoriteButton(note);
  renderNotes();
});

noteForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = noteTitle.value.trim();
  const category = noteCategory.value;
  const content = noteContent.value.trim();

  if (!title || !content) return;

  if (editingId !== null) {
    const note = notes.find(n => n.id === editingId);

    if (note) {
      note.title = title;
      note.category = category;
      note.content = content;
    }
  } else {
    notes.unshift({
      id: Date.now(),
      title,
      category,
      content,
      favorite: false,
      createdAt: new Date().toLocaleDateString()
    });
  }

  saveNotes();
  renderNotes();
  closeEditModal();
});

document.getElementById("categories").addEventListener("click", event => {
  const button = event.target.closest(".category");
  if (!button) return;

  document.querySelectorAll(".category").forEach(btn =>
    btn.classList.remove("active")
  );

  button.classList.add("active");
  selectedCategory = button.dataset.category;
  renderNotes();
});

searchInput.addEventListener("input", renderNotes);

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");
  document.getElementById("themeBtn").textContent = dark ? "☀️" : "🌙";

  localStorage.setItem("notesTheme", dark ? "dark" : "light");
});

if (localStorage.getItem("notesTheme") === "dark") {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "☀️";
}

renderNotes();
