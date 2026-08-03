import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createCategory, updateCategory } from "../api/cafeteria";
import type { AdminStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Route = RouteProp<AdminStackParamList, "CategoryForm">;

const inputClass =
  "bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800";

export default function CategoryFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editing = route.params.category;
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) {
      Alert.alert("Nombre requerido", "Escribe el nombre de la categoría.");
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "Error",
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Ocurrió un error."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 gap-4">
        <Text className="text-2xl font-extrabold text-slate-800">
          {editing ? "Editar categoría" : "Nueva categoría"}
        </Text>

        <View>
          <Text className="text-slate-600 font-semibold mb-1">Nombre</Text>
          <TextInput
            className={inputClass}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Bebidas"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View>
          <Text className="text-slate-600 font-semibold mb-1">
            Descripción
          </Text>
          <TextInput
            className={inputClass}
            value={description}
            onChangeText={setDescription}
            placeholder="Opcional"
            multiline
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity
          className="bg-emerald-600 py-4 rounded-2xl items-center"
          onPress={save}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {editing ? "Guardar cambios" : "Crear categoría"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
