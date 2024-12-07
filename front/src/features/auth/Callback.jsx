import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Callback = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const session = localStorage.getItem('session');

        console.log('Code:', code);
        console.log('Session:', session);
        if (!code) {
            setError('Authorization code not found.');
            setLoading(false);
            return;
        }
        if (!session) {
            setError('Session not found.');
            setLoading(false);
            return;
        }
        axios
            .post(
                `${import.meta.env.VITE_BACKEND_CALLBACK_URL}`,
                { code },
                {
                    headers: {
                        session,
                    },
                }
            )
            .then((response) => {
                console.log('Response:', response.data);
                const token = response.data?.data?.token;
                if (token) {
                    localStorage.setItem('discordToken', token);
                    console.log('Token:', token);
                    alert('Logged in successfully!');
                    navigate('/dashboard');
                } else {
                    setError('Token not found in the response.');
                }
            })
            .catch((err) => {
                setError('Failed to authenticate.');
                console.error('Error:', err.response?.data || err.message);
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    return (
        <div className="callback-container">
            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error">Error: {error}</div>
            ) : (
                <div className="success-message">Redirecting...</div>
            )}
        </div>
    );
};
