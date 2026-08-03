import axios from "axios";
import { Platform } from "react-native";

// ------------------------------------------------------------------
// Configuración del backend.
//
// - Emulador Android:      http://10.0.2.2:8000
// - Emulador iOS / web:    http://localhost:8000
// - Dispositivo físico:    http://IP_DE_TU_PC:8000
//   (tu PC y el teléfono deben estar en la misma red WiFi)
// ------------------------------------------------------------------
export const API_URL =
  Platform.select({
    android: "http://10.0.2.2:8000",
    default: "http://localhost:8000",
  }) ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});
