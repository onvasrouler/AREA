import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const CallbackDiscord = () => {
    const [status, setStatus] = useState('loading');
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
            setStatus('error');
            return;
        }
        if (!session) {
            setError('Session not found.');
            setStatus('error');
            return;
        }
        axios
            .post(
                `${import.meta.env.VITE_BACKEND_CALLBACK_DISCORD_URL}`,
                { code },
                {
                    headers: {
                        session,
                    },
                }
            )
            .then((response) => {
                console.log('Response:', response.data);
                if (response.status == 200) {
                    setStatus('success');
                    navigate('/dashboard');
                } else {
                    setError('Failed to authenticate.');
                    setStatus('error');
                    console.error('Error:', response.data);
                }
            })
            .catch((err) => {
                setError('Failed to authenticate.');
                setStatus('error');
                console.error('Error:', err.response?.data || err.message);
            });
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md">
                {status === 'loading' && (
                    <div className="text-center">
                        <img
                            src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXk0aHo4bHRzd2lsbjZ4NTR2ajFpNTZoM25pemdhdTRhcjZnMTBtZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/jV0fRmUyDAGRalG0T7/giphy.gif"
                            alt="Loading"
                            className="w-24 h-24 mx-auto mb-4"
                        />
                        <p className="text-xl font-semibold text-gray-700">Authenticating...</p>
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
