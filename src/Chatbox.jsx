import React, { useState, useEffect, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './files/Chatbox.module.css';  // Importing CSS as a module

const Chatbox = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.userName;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!username) {
            navigate('/UserForm', { replace: true });
        }
    }, [username, navigate]);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        let mounted = true;

        const connectWebSocket = () => {
            try {
                const socketFactory = () => {
                    return new SockJS('http://localhost:8080/ws');
                };

                const client = Stomp.over(socketFactory);

                client.debug = function(str) {
                    console.log(str);
                };

                console.log('Connecting with username:', username);    
                client.connect(
                    {
                      'username':username,
                    },
                    () => {
                        if (mounted) {
                            console.log('WebSocket Connected');
                            setIsConnected(true);
                            setError('');
                            stompClientRef.current = client;

                            subscriptionRef.current = client.subscribe('/topic/main', (response) => {
                                try {
                                    const message = JSON.parse(response.body);
                                    console.log('Received message type: '+ message.type);
                                    setMessages((prev) => [...prev, message]);
                                } catch (err) {
                                    console.error('Error parsing message:', err);
                                }
                            });
                        }
                    },
                    (err) => {
                        console.error('WebSocket connection error:', err);
                        setError('Connection failed. Retrying...');
                        setIsConnected(false);
                        hasInitialized.current = false;

                        setTimeout(() => {
                            if (mounted) {
                                connectWebSocket();
                            }
                        }, 5000);
                    }
                );
            } catch (err) {
                console.error('Error creating WebSocket connection:', err);
                setError('Failed to create connection. Will retry...');
                hasInitialized.current = false;
            }
        };

        connectWebSocket();

        return () => {
            mounted = false;
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            if (stompClientRef.current?.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log('WebSocket Disconnected');
                });
            }
            hasInitialized.current = false;
        };
    }, [username]);

    const sendMessage = useCallback(() => {
        if (stompClientRef.current?.connected && input.trim()) {
            const message = {
                sender: username,
                content: input.trim(),
                timestamp: new Date().toISOString(),
                type : 'M'
            };

            try {
                stompClientRef.current.send('/app/userMessage', {'username':username}, JSON.stringify(message));
                setInput('');
            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message. Please try again.');
            }
        }
    }, [input, username]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    return (
        <div className={styles.chatboxContainer}>
            <h1 className={styles.chatboxTitle}>Chat Room</h1>

            {error && <div className={styles.chatboxError}>{error}</div>}

            <div className={styles.chatboxMessages}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${styles.chatboxMessage} ${message.type === 'M' ? (message.sender === username ? styles.chatboxMessageSent : styles.chatboxMessageReceived) : ''}`}
                    >
                        {message.type === 'M' ? (
                            <>
                                <div className={styles.chatboxUsername}>{message.sender}</div>
                                <div className={styles.chatboxContent}>{message.content}</div>
                                {message.timestamp && (
                                    <div className={styles.chatboxTimestamp}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                )}
                            </>
                        ) : message.type === 'J' || message.type === 'L' ? (
                            <div className={styles.chatboxSystemMessageCenter}>
                                {message.sender} {message.type === 'J' ? 'joined' : 'left'} the chat
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>

            <div className={styles.chatboxInputContainer}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className={styles.chatboxInput}
                    disabled={!isConnected}
                />
                <button
                    onClick={sendMessage}
                    disabled={!isConnected || !input.trim()}
                    className={`${styles.chatboxSendBtn} ${!isConnected || !input.trim() ? styles.chatboxSendBtnDisabled : ''}`}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbox;

