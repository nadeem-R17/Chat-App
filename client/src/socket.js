// src/socket.js
import io from "socket.io-client";
import { BASE_URL } from './assets/BASE_URL';


export const socket = io(`${BASE_URL}`);

