import RoutineService from "./services/Routine/getRoutine.js";
import PDFService from "./services/PDF/getPDF.js";
const routineService = new RoutineService();
const pdfService = new PDFService();

let currentRoutineData = null;

// --- DOM Elements ---
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");
const textarea = document.querySelector(".input-bar");
const sendBtn = document.querySelector(".send-btn");
const convertBtn = document.querySelector(".convert-btn");
const emailBtn = document.querySelector(".send-email-btn");
const landingDiv = document.querySelector(".landingDiv");
const chatModeDiv = document.querySelector(".chat-mode");
const chatView = document.getElementById("chatView");
const emailModal = document.getElementById("emailModal");
const emailInput = document.getElementById("emailInput");
const emailError = document.getElementById("emailError");
const cancelEmail = document.getElementById("cancelEmail");
const confirmEmail = document.getElementById("confirmEmail");

// Email validation regex
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Open modal
emailBtn.addEventListener("click", () => {
  emailModal.classList.remove("hidden");
  emailInput.value = "";
  emailError.classList.add("hidden");
});

// Close modal
cancelEmail.addEventListener("click", () => {
  emailModal.classList.add("hidden");
});

// Confirm email
confirmEmail.addEventListener("click", () => {
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    emailError.classList.remove("hidden");
    return;
  }

  emailError.classList.add("hidden");
  emailModal.classList.add("hidden");

  console.log("Email valid, sending:", email);

  // TODO: call backend API here
  // fetch("/send-email", { method: "POST", body: JSON.stringify({ email }) })
});

// --- Sidebar Logic ---
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });
}

// --- PDF Conversion Logic (New Event Listener) ---
if (convertBtn) {
  convertBtn.addEventListener("click", () => {
    // 1. Check if we actually have data to print
    if (!currentRoutineData || currentRoutineData.length === 0) {
      alert("Please generate a workout plan first!");
      return;
    }

    // 2. Call the PDF generation function
    pdfService.createPDF(currentRoutineData);
  });
}

// --- Chat Logic ---
if (sendBtn && textarea) {
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  sendBtn.addEventListener("click", async () => {
    const prompt = textarea.value.trim();
    if (!prompt) return;

    if (landingDiv) landingDiv.style.display = "none";
    if (chatModeDiv) chatModeDiv.classList.remove("hidden");

    addUserMessageToChat(prompt, "user");
    textarea.value = "";
    textarea.style.height = "auto";

    const loadingBubble = addLoadingBubble();

    try {
      const routine = await routineService.generateRoutine(prompt);

      loadingBubble.remove();

      // 🟢 STORE DATA: Save the week plan to our global variable
      currentRoutineData = routine.week_plan;

      renderWorkoutCards(routine.week_plan);
    } catch (error) {
      loadingBubble.remove();
      console.error(error);
      addMessageToChat(
        "I couldn't generate a plan for that. Please try asking for a workout routine!",
        "ai"
      );
    }
  });
}

// --- Helper Functions ---

function scrollToBottom() {
  if (chatView) chatView.scrollTop = chatView.scrollHeight;
}

function addMessageToChat(text, sender) {
  const bubble = document.createElement("div");
  bubble.classList.add("chat-message", sender);
  bubble.style.background = "#161b22";
  bubble.style.border = "1px solid #30363d";
  bubble.style.padding = "12px 16px";
  bubble.style.borderRadius = "20px";
  bubble.textContent = text;

  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);
  wrapper.appendChild(bubble);

  chatView.appendChild(wrapper);
  scrollToBottom();
}

function addUserMessageToChat(text, sender) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);

  // FORCE the whole message row to align right
  wrapper.style.display = "flex";
  wrapper.style.width = "100%";
  wrapper.style.justifyContent = "flex-end";
  wrapper.style.margin = "10px 0";

  const bubble = document.createElement("div");
  bubble.classList.add("chat-message", sender);
  bubble.style.border = "1px solid #30363d";
  bubble.style.padding = "12px 16px";
  bubble.style.borderRadius = "20px";
  bubble.style.maxWidth = "70%";

  // USER bubble colors
  bubble.style.background = "#1f6feb";
  bubble.style.color = "white";

  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatView.appendChild(wrapper);
  scrollToBottom();
}

function addLoadingBubble() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", "ai");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-message", "ai");
  bubble.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
  wrapper.appendChild(bubble);
  chatView.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

function renderWorkoutCards(weekPlan) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", "ai");
  wrapper.style.display = "block";

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "15px";
  container.style.width = "100%";

  weekPlan.forEach((day) => {
    const card = document.createElement("div");
    card.style.background = "rgba(22, 27, 34, 0.8)";
    card.style.border = "";
    card.style.borderRadius = "14px";
    card.style.padding = "18px";
    card.style.color = "#c9d1d9";
    card.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
    backdropFilter = "blur(6px)";
    card.vertical;
    title.style.marginTop = "0";
    title.style.fontWeight = "600";
    title.style.fontSize = "18px";
    title.innerHTML = `<span style="color:#4facfe">${day.day}</span>: ${day.focus}`;

    card.appendChild(title);

    const list = document.createElement("ul");
    list.style.paddingLeft = "20px";
    list.style.margin = "10px 0 0 0";
    list.style.color = "#9ca3af";

    day.exercises.forEach((ex) => {
      const li = document.createElement("li");
      li.style.marginBottom = "5px";
      li.innerHTML = `<strong>${ex.name}</strong>: ${ex.sets} sets × ${ex.reps}`;
      list.appendChild(li);
    });

    card.appendChild(list);
    container.appendChild(card);
  });

  wrapper.appendChild(container);
  chatView.appendChild(wrapper);
  scrollToBottom();
}
