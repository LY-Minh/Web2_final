// 1. Import your service (Ensure the path matches your project structure)
import AuthService from './../../services/Auth/auth.js'; 

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const loginStep = document.getElementById("login-step");
  const otpStep = document.getElementById("otp-step");
  const phoneInput = document.getElementById("phoneInput");

  // Initialize Service
  const authService = new AuthService();

  // State variables
  let currentPhone = null; 
  let currentRequestId = null; 

  // --- STEP 1: Send Code via AuthService ---
  loginBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();
    
    // 1. Validate Format locally first
    if (!authService.validatePhoneNumber(phone)) {
      alert("Invalid phone format. Please use E.164 (e.g., +1234567890)");
      return;
    }

    currentPhone = phone;
    loginBtn.textContent = "Sending..."; // UI Feedback
    loginBtn.disabled = true;

    try {
      // 2. Call the Send Code Endpoint
      const response = await authService.sendCode(phone);
      
      // 3. Extract Request ID (Required for Step 2)
      // Structure based on your auth.js comment: response.result.request_id
      if (response.ok && response.result) {
        currentRequestId = response.result.request_id;
        const deliveryStatus = response.result.delivery_status?.status;

        console.log(`Code Sent! ID: ${currentRequestId}, Status: ${deliveryStatus}`);

        // Switch UI to OTP Input
        loginStep.style.display = "none";
        otpStep.style.display = "block";
        document.querySelector(".otp-box").focus();
      } else {
        throw new Error("API returned error or missing result");
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to send code. Please check the number and try again.");
      loginBtn.disabled = false;
      loginBtn.textContent = "Get Login Code";
    }
  });

 
  const boxes = document.querySelectorAll(".otp-box");
  boxes.forEach((box, index) => {
    box.addEventListener("input", (e) => {
      if (box.value.length === 1 && index < boxes.length - 1) {
        boxes[index + 1].focus();
      }
    });
    

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && box.value === "" && index > 0) {
        boxes[index - 1].focus();
      }
    });
  });

  // --- STEP 2: Verify Code via AuthService ---
  verifyBtn.addEventListener("click", async () => {
    // Combine inputs into string
    let otp = "";
    boxes.forEach((b) => (otp += b.value));

    if (otp.length !== 6) return alert("Enter all 6 digits");
    if (!currentRequestId) return alert("Session expired. Please refresh.");

    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;

    try {
      // 1. Call Verify Endpoint
      const response = await authService.verifyCode(otp, currentRequestId);
      
      // 2. Check Status
      // Structure: response.result.verification_status.status
      const status = response.result?.verification_status?.status;

      if (status === 'code_valid') {
        console.log("Authentication Successful");
        alert("Verified Successfully!");
    // store token in local storage
        const token = await fetch('http://localhost:3000/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
                phoneNumber: currentPhone 
            })
        });

        const result = await token.json();
         if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userPhone', currentPhone);
        console.log("Login Success! Token saved.");
        }

        window.location.href = "../home/home.html"; // Redirect to home page
      } else {
        alert(`Verification failed: ${status}`);
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Verify & Login";
        // Clear inputs on failure
        boxes.forEach(b => b.value = "");
        boxes[0].focus();
      }

    } catch (error) {
      console.error("Verification Error:", error);
      alert("An error occurred during verification.");
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify & Login";
    }
  });
});