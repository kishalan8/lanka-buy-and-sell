import { io } from "socket.io-client";

// Adjust the URL if your backend runs on a different port or host
const socket = io("http://localhost:5000");

export default socket;
