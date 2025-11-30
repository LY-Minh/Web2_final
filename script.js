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
const landingDiv = document.querySelector(".landingDiv");
const chatModeDiv = document.querySelector(".chat-mode"); 
const chatView = document.getElementById("chatView");

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

    addMessageToChat(prompt, "user");
    textarea.value = "";
    textarea.style.height = "auto";

    const loadingBubble = addLoadingBubble();

    try {
      const routine = await routineService.generateRoutine(prompt);
      
      loadingBubble.remove();

      currentRoutineData = routine.week_plan;

      renderWorkoutCards(routine.week_plan);

    } catch (error) {
      loadingBubble.remove();
      console.error(error);
      addMessageToChat("I couldn't generate a plan for that. Please try asking for a workout routine!", "ai");
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
  bubble.textContent = text;
  
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);
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
    card.style.background = "#1e1e1e"; 
    card.style.border = "1px solid #333";
    card.style.borderRadius = "10px";
    card.style.padding = "15px";
    card.style.color = "#fff";

    const title = document.createElement("h3");
    title.innerHTML = `<span style="color: #4facfe">${day.day}</span>: ${day.focus}`;
    title.style.marginTop = "0";
    card.appendChild(title);

    const list = document.createElement("ul");
    list.style.paddingLeft = "20px";
    list.style.margin = "10px 0 0 0";

    day.exercises.forEach(ex => {
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

