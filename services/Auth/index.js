import AuthService from './auth.js';

const authService = new AuthService();
let request_id = null;
//form for phone number input
const form = document.getElementById('auth-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phoneNumber = document.getElementById('phone-number').value;
    try {
        const isValid = authService.validatePhoneNumber(phoneNumber);
        if (!isValid) {
            alert('Invalid phone number format. Please use E.164 format (e.g., +1234567890).');
            return;
        }
        const res  = await authService.sendCode(phoneNumber);
        const {result : {delivery_status: {status}}} = res;
        request_id = res.result.request_id; //store request_id for later verification
        if (status !== 'delivered') {
            alert(`Cannot send verification code. Delivery status: ${status}`);
            return;
        }
        alert('Verification code sent successfully!');
        window.location.href = '#verify-section'; //navigate to code verification section
    } catch (error) {
        console.error('Error during authentication:', error);
        alert('Failed to send verification code. Please try again.');
    }
});

//form for code verification
const verifyForm = document.getElementById('verify-form');
verifyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = document.getElementById('verification-code').value;

    try {
        const response = await authService.verifyCode(code, request_id);
        console.log('Verification response:', response); //for debugging
        if (!response.ok) {
            alert('Verification failed. Please check the code and try again.');
            return;
        }
        const { verification_status: { status } } = response;
        /* EXAMPLE RESPONSE
        *{
        "ok": true,
        "result": {
        "verification_status": {
            "status": "code_valid",
            "updated_at": 1715602341,
            "code": "123456" 
    }
  }
}
        */
        if (status === 'verified') {
            alert('Phone number verified successfully!');
        } else {
            alert(`Verification status: ${status}. Please try again.`);
        }
        
    }
    catch (error) {
        console.error('Error during code verification:', error);
        alert('Failed to verify code. Please try again.');
    }
}
);