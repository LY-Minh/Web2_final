class AuthService {
  constructor() {
    this.baseURL = "https://gatewayapi.telegram.org/";
    this.authToken = "AAFLLgAA_Y-_BcJxqsW2rwUjWYGLsBabICbFCLBY7ZqLUw";
    this.headers = {
      Authorization: `Bearer ${this.authToken}`,
      "Content-Type": "application/json",
    };
  }
  // Send verification code to the given phone number
  async sendCode(phoneNumber) {
    const url = `${this.baseURL}/sendVerificationMessage`;
    const code = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        phone_number: phoneNumber,
        code_length: 6,
        ttl: 60,
        payload: "my_payload_here",
        callback_url: "https://my.webhook.here/auth",
      }),
    });
    if (code.status !== 200) {
      throw new Error("Failed to send verification code");
    }
    const responseData = await code.json();
    return responseData;
  }
  //send code json response
  /*
    *{
    "ok": true,
    "result": {
        "request_id": "152352603002796",
        "phone_number": "85598845868",
        "request_cost": 0,
        "remaining_balance": 0,
        "delivery_status": {
            "status": "sent",
            "updated_at": 1764492997
        }
    }
*/
  // Verify the code entered by the user
  async verifyCode(code, request_id) {
    const url = `${this.baseURL}/checkVerificationStatus`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        code: code,
        request_id: request_id,
      }),
    });
    if (response.status !== 200) {
      throw new Error("Failed to verify code");
    }
    const responseData = await response.json();
    return responseData;
  }

  //   Validate phone number format
  validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^(0\d{8,10}|\+\d{10,15})$/;
    return phoneRegex.test(phoneNumber);
  }

  setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
}

export default AuthService;
