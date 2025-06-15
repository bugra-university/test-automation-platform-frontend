/**
 * Test script to verify the authentication endpoint directly
 */
import axios from 'axios';

async function testAuth() {
    try {
        console.log('Testing authentication with admin/admin credentials');
        const response = await axios.post('http://localhost:8080/auth/login', {
            username: 'admin',
            password: 'admin'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Authentication successful!');
        console.log('Response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Authentication failed!');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        return null;
    }
}

// Execute the test
testAuth().then(result => {
    console.log('Test completed. Result:', result ? 'SUCCESS' : 'FAILED');
});

export default testAuth;
