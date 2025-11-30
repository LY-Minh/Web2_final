class AuthService {
    constructor() {
        this.baseURL = 'https://gatewayapi.telegram.org/';
        this.authToken = 'AAFLLgAA_Y-_BcJxqsW2rwUjWYGLsBabICbFCLBY7ZqLUw';
        this.headers = {
    'Authorization': `Bearer ${this.authToken}`,
    'Content-Type': 'application/json'
};
    }
    // Send verification code to the given phone number
    async sendCode(phoneNumber) {
        const url = `${this.baseURL}/sendVerificationMessage`;
        const validatePhoneNumber = this.validatePhoneNumber(phoneNumber);
        if (!validatePhoneNumber) {
            throw new Error('Invalid phone number format');
        }
        const code = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ 
                'phone_number': phoneNumber,      
                'code_length': 6,              
                'ttl': 60,     //set expiry time to 60 seconds              
             })
        });
       if (code.status !== 200) {
            throw new Error('Failed to send verification code');
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
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ 
                'code': code,
                'request_id': request_id
                })
            });
        const responseData = await response.json();
        if (response.ok !== true) {
            throw new Error('Verification failed');
        }
        if (responseData.result.verification_status.status !== 'code_valid') {
            throw new Error('Invalid verification code');
        }
        return responseData;
    }
    // Validate phone number format
    validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^\+\d{10,15}$/;
        return phoneRegex.test(phoneNumber);
    }
    // Check if user is logged in using userPhone in local storage
    async checkifloggedin() {
        const user = localStorage.getItem('userPhone');
        if (user) {
            return "not logged in";
        } else {
            return user;
        }
}
}
export default AuthService;