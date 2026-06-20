import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Node < 22 no trae WebSocket nativo; sin esto, el cliente de Supabase
// rompe al inicializar Realtime cuando se corre `expo start --web`.
// En nativo (iOS/Android) no hace falta: ahí el WebSocket lo provee RN.
const realtimeTransport = Platform.OS === "web" ? require("ws") : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: Platform.OS !== "web",
    detectSessionInUrl: false,
  },
  ...(realtimeTransport && {
    realtime: {
      transport: realtimeTransport,
    },
  }),
});
