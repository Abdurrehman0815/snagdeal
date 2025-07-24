import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (userId) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) {
            // If no userId, disconnect any existing socket and don't connect
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsConnected(false);
            return;
        }

        // Connect to your backend Socket.IO server
        socketRef.current = io(process.env.REACT_APP_BACKEND_URL);

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            console.log('Socket Connected! ID:', socketRef.current.id);
            // Join a room specific to the user/shop owner for targeted notifications
            socketRef.current.emit('joinRoom', userId);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket Disconnected!');
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userId]); // Reconnect if userId changes

    return { socket: socketRef.current, isConnected };
};

export default useSocket;