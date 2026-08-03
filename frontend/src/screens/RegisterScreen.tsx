import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { registerUser } from "../api/cafeteria";
import type { RootStackParamList } from "../navigation/types";
import FaceCapture from "../components/FaceCapture";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const inputClass =
  "bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800";

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Faltan datos", "Ingresa nombre y correo.");
      return;
    }
    if (!photo) {
      Alert.alert("Rostro requerido", "Captura una foto de tu rostro.");
      return;
    }
    setBusy(true);
    try {
      const user = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        photoUri: photo,
      });
      Alert.alert(
        "Usuario registrado",
        `${user.full_name} fue registrado. Ahora inicia sesión con tu rostro.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      Alert.alert(
        "Error al registrar",
        typeof detail === "string" ? detail : "Revisa los datos e intenta de nuevo."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <Text className="text-3xl font-extrabold text-slate-800 mb-1">
          Registro
        </Text>
        <Text className="text-slate-500 mb-6">
          Crea tu cuenta y captura tu rostro para identificarte.
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-slate-600 font-semibold mb-1">
              Nombre completo
            </Text>
            <TextInput
              className={inputClass}
              placeholder="Ej. María López"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View>
            <Text className="text-slate-600 font-semibold mb-1">Correo</Text>
            <TextInput
              className={inputClass}
              placeholder="correo@escuela.edu"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View>
            <Text className="text-slate-600 font-semibold mb-1">Rol</Text>
            <View className="flex-row gap-3">
              {(["customer", "admin"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    role === r
                      ? "bg-brand-600 border-brand-600"
                      : "bg-white border-slate-300"
                  }`}
                  onPress={() => setRole(r)}
                >
                  <Text
                    className={`font-bold ${
                      role === r ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {r === "customer" ? "Alumno" : "Administrador"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-slate-600 font-semibold mb-1">
              Foto de rostro
            </Text>
            <View className="items-center py-4">
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  className="w-36 h-36 rounded-full border-4 border-brand-500"
                />
              ) : (
                <View className="w-36 h-36 rounded-full bg-slate-200 items-center justify-center border-4 border-dashed border-slate-300">
                  <Text className="text-slate-400 text-xs text-center px-4">
                    Sin foto
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              className="bg-brand-600 py-3 rounded-xl items-center"
              onPress={() => setCameraOpen(true)}
            >
              <Text className="text-white font-bold">
                {photo ? "Volver a capturar" : "Capturar rostro"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-emerald-600 py-4 rounded-2xl items-center mt-2"
            onPress={handleRegister}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Crear cuenta
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-2"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-brand-600 font-semibold">
              Ya tengo cuenta, volver
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FaceCapture
        visible={cameraOpen}
        onCapture={(uri) => {
          setCameraOpen(false);
          setPhoto(uri);
        }}
        onCancel={() => setCameraOpen(false)}
      />
    </SafeAreaView>
  );
}
