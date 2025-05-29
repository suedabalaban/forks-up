import {api, getToken} from "./ForksUpAPI";

export const sendMessageToChatBot = async (message: string) => {
    try {
        const token = await getToken();
        const response = await api("/chatbot?message=" + message, {
            headers: {
                Authorization: `Bearer ${token}`,
            }}
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching response from chatbot:", error);
    }
}