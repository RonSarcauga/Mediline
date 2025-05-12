import React, { useState, useEffect, useRef } from 'react';
import BaseIcon from '../General/BaseIcon';
import CommonIcon from '../General/CommonIcon';
import Container, { ItemGroup } from '../General/Container';
import InputBar from '../General/InputBar';
import io from 'socket.io-client';

const Chatbox = ({ user, data, appointmentId }) => {
    const { patient, doctor } = data;
    const [messages, setMessages] = useState([]);
    const [messageText, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false)
    const chatContainerRef = useRef(null);

    //JSON format for message to send to socket server
    var chatMessage = {
        appointment_id: appointmentId,
        message: messageText,
        user_id: user
    }

    let recipient = doctor;
    let messenger = patient;
    let isPatient = false;

    if (user === 1) {
        recipient = patient;
        messenger = doctor;
        isPatient = true;
    }

    const socket = io("https://cs-490-mediline-backend-1021109447710.us-central1.run.app/chat", {
        autoConnect: false,
    });

    useEffect(() => {
        const onConnect = () => {
            socket.connect()
            setIsConnected(true);
            socket.emit('join', { "appointment_id": 1 })
        };

        const onDisconnect = () => {
            socket.disconnect();
            setIsConnected(false);
        };

        const onMessageEvent = (message) => {
            setMessage((prevMessage) => [...prevMessage, message]);
            console.log("New message sent:", message);
        };

        const onSendMessage = (message) => {
            if (messageText.trim() === '') return; // Prevent sending empty messages
            chatMessage.message = message; //does this need to be changed?
            //depending on new implementation, the user_id might need to be updated depending on who is sending
            //chatMessage.user_id = user 
            socket.emit('message', chatMessage)
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('newMessage', onMessageEvent);
        socket.on('sendMessage', onSendMessage);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('newMessage', onMessageEvent);
            socket.off('sendMessage', onSendMessage);
            };
    }, []);

    //jumps to bottom of chat container when new messages are added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    //handle key press for sending message
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSendMessage();
        }
    };

    //timestamp formatting
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <ItemGroup
                customClass="gap-5"
                fitParent={true}
                stretch={true}
                axis={true}
                items={
                    <>
                        <ItemGroup
                            customClass="bg-secondary-400 p-4 br-md justify-content-space-between align-items-center"
                            fitParent={true}
                            axis={false}
                            items={[
                                <ItemGroup
                                    axis={false}
                                    stretch={true}
                                    fitParent={true}
                                    items={[
                                        <div className="overlay-container">
                                            <img src="public/img/person-icon.svg" width="40" height="40" alt="Profile" />
                                        </div>,
                                        <div className="pl-2 pt-2 font-medium">
                                            {isPatient ? recipient : "Dr. " + recipient}
                                        </div>
                                    ]}
                                />
                            ]}
                        />
                        <Container
                            customClass="chat-container"
                            content={[
                                <div
                                    ref={chatContainerRef}
                                    className="overflow-y-visible p-1"
                                    style={{
                                        maxHeight: "400px",
                                        overflowY: "auto",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem",
                                        borderRadius: "10px",
                                    }}
                                >
                                    {isLoading && messages.length === 0 ? (
                                        <div className="text-center py-3">Loading messages...</div>
                                    ) : messages.length === 0 ? (
                                        <button className="border-0 br-sm" onClick={onConnect}>Join Chat</button>
                                    ) : (
                                        messages.map((msg, index) => (
                                            <div
                                                key={msg.messageId || index}
                                                style={{
                                                    alignSelf: msg.sender === user ? "flex-end" : "flex-start",
                                                    backgroundColor: msg.sender === user ? "#5695DD" : "#C5D8E3",
                                                    padding: "0.75rem 1rem",
                                                    borderRadius: "20px",
                                                    maxWidth: "70%",
                                                    position: "relative"
                                                }}
                                            >
                                                <strong style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                                                    {msg.sender === 0 ? patient.name : doctor.name}
                                                </strong>
                                                <div>{msg.message}</div>
                                                <div style={{
                                                    fontSize: "0.7rem",
                                                    opacity: 0.8,
                                                    textAlign: "right",
                                                    marginTop: "0.3rem"
                                                }}>
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ]}
                        />

                        <ItemGroup
                            customClass="bg-neutral-50 br-bottom-md"
                            fitParent={true}
                            stretch={true}
                            axis={true}
                            items={[
                                <div className="br-md bg-white p-3 input-bar d-flex align-items-center justify-content-space-between">
                                    <input id="messageInput"
                                        type="text"
                                        placeholder="Type a message"
                                        className="bg-transparent pl-4 py-2 stretch text-black"
                                        value={messageText}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                    />
                                    <button
                                        className="bg-transparent border-0 br-sm d-flex justify-content-end"
                                        //onClick={onSendMessage}
                                        disabled={isLoading || !messageText.trim()}
                                    >
                                        <img src="public/img/send-icon.svg" width="40" height="30" alt="Send" />
                                    </button>
                                </div>
                            ]}
                        />
                    </>
                }
            />
        </>
    );
};

const connectChat = ({ connect }) => {
    console.log("erm im waiting")
}
export default Chatbox;