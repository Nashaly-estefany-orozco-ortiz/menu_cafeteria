import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createProduct, getCategories, updateProduct } from "../api/cafeteria";
import type { AdminStackParamList } from "../navigation/types";
import type { Category } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Route = RouteProp<AdminStackParamList, "ProductForm">;

const inputClass =
  "bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800";

export default function ProductFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editing = route.params.product;
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [price, setPrice] = useState(
    editing ? String(editing.price) : ""
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    editing?.category_id ?? null
  );
  const [busy, setBusy] = useState(false);

  const loadCategories = useCallback(async () => {
    setCategories(await getCategories());
  }, []);

  useEffect(() => {
    loadCategories().catch(() => {});
  }, [loadCategories]);

  async function save() {
    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum) || priceNum < 0) {
      Alert.alert(
        "Datos inválidos",
        "Revisa el nombre y el precio (número mayor o igual a 0)."
      );
      return;
    }
    if (categoryId === null) {
      Alert.alert("Categoría requerida", "Selecciona una categoría.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        category_id: categoryId,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
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
      <ScrollView className="flex-1 p-6 gap-4">
        <Text className="text-2xl font-extrabold text-slate-800">
          {editing ? "Editar producto" : "Nuevo producto"}
        </Text>

        <View>
          <Text className="text-slate-600 font-semibold mb-1">Nombre</Text>
          <TextInput
            className={inputClass}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Torta de jamón"
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

        <View>
          <Text className="text-slate-600 font-semibold mb-1">
            Precio (MXN)
          </Text>
          <TextInput
            className={inputClass}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View>
          <Text className="text-slate-600 font-semibold mb-1">
            Categoría
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                className={`px-4 py-2 rounded-full border ${
                  categoryId === c.id
                    ? "bg-brand-600 border-brand-600"
                    : "bg-white border-slate-200"
                }`}
                onPress={() => setCategoryId(c.id)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    categoryId === c.id
                      ? "text-white"
                      : "text-slate-600"
                  }`}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              {editing ? "Guardar cambios" : "Crear producto"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
