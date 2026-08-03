import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import FaceCapture from "../components/FaceCapture";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleCapture(uri: string) {
    setCameraOpen(false);
    setPreview(uri);
  }

  async function handleLogin() {
    if (!preview || busy) return;
    setBusy(true);
    try {
      await login(preview);
      setPreview(null);
      navigation.navigate("Main");
    } catch (e: any) {
      Alert.alert(
        "Acceso denegado",
        e?.message || "No se pudo autenticar. Intenta de nuevo."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="bg-brand-100 rounded-2xl px-6 py-3 mb-4">
            <Text className="text-brand-700 text-sm font-bold uppercase tracking-wide">
              Cafetería Escolar
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-slate-800">
            Inicio de sesión
          </Text>
          <Text className="text-slate-500 mt-2 text-center">
            Autenticación biométrica por reconocimiento facial
          </Text>
        </View>

        {preview ? (
          <View className="items-center mb-6">
            <Image
              source={{ uri: preview }}
              className="w-40 h-40 rounded-full border-4 border-brand-500"
            />
            <Text className="text-slate-500 mt-2 text-sm">
              Rostro capturado. ¿Continuar?
            </Text>
          </View>
        ) : (
          <View className="items-center mb-6">
            <View className="w-32 h-32 rounded-full bg-slate-200 items-center justify-center border-4 border-dashed border-slate-300">
              <Text className="text-slate-400 text-xs text-center px-4">
                Captura tu rostro para entrar
              </Text>
            </View>
          </View>
        )}

        <View className="gap-3">
          <TouchableOpacity
            className="bg-brand-600 py-4 rounded-2xl items-center"
            onPress={() => setCameraOpen(true)}
          >
            <Text className="text-white font-bold text-base">
              {preview ? "Volver a capturar" : "Escanear mi rostro"}
            </Text>
          </TouchableOpacity>

          {preview && (
            <TouchableOpacity
              className="bg-emerald-600 py-4 rounded-2xl items-center"
              onPress={handleLogin}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Confirmar identidad
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-500">¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-brand-600 font-bold">Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FaceCapture
        visible={cameraOpen}
        onCapture={handleCapture}
        onCancel={() => setCameraOpen(false)}
      />
    </SafeAreaView>
  );
}
