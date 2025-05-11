import axios from '../assets/js/api.js';
import { useMutation } from '@tanstack/react-query';


//commented out for now as chat connection will be through socket.io

function authHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      }
    };
  }
  

export const chatLogFetch = {
    fetchMessages: async (appointment_id) => {
        try {
        const chatlog = await axios.get(`/chat/${appointment_id}/messages`, authHeaders());
        console.log('Fetched data:', chatlog.data);
        return {
            chat : chatlog.data
        };
    } catch(error){
        console.error('Error fetching messages:', error);
        throw error
    }
},

    sendMessage: async (appointment_id, messageData) => {
        const sendChat = await axios.put(`/chat/appointment/${appointment_id}`, messageData, authHeaders());
        console.log('Sent message:', sendChat.data);
        return sendChat.data;
    },

    formatMessages: (apiMessages) => {
        if (!apiMessages || !Array.isArray(apiMessages)) {
            return [];
        }

        return apiMessages.map(msg => ({
            sender: parseInt(msg.user_id),
            message: msg.message_content,
            timestamp: msg.time,
            messageId: msg.message_id
        }));
    }
};

export default chatLogFetch;
