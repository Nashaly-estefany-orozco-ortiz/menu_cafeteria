import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteCategory, getCategories } from "../api/cafeteria";
import type { AdminStackParamList } from "../navigation/types";
import type { Category } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminCategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setCategories(await getCategories());
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  function confirmDelete(category: Category) {
    Alert.alert(
      "Eliminar categoría",
      `¿Eliminar "${category.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              load();
            } catch (e: any) {
              Alert.alert(
                "No se pudo eliminar",
                typeof e?.response?.data?.detail === "string"
                  ? e.response.data.detail
                  : "Ocurrió un error."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-4 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-slate-800">
          Categorías
        </Text>
        <TouchableOpacity
          className="bg-brand-600 px-4 py-2 rounded-xl"
          onPress={() => navigation.navigate("CategoryForm", {})}
        >
          <Text className="text-white font-bold">Nueva</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={categories}
        keyExtractor={(c) => String(c.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text className="text-slate-400 text-center py-10">
            No hay categorías.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-bold text-slate-800">{item.name}</Text>
                {item.description ? (
                  <Text className="text-slate-400 text-sm">
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-slate-200 px-3 py-2 rounded-lg"
                  onPress={() =>
                    navigation.navigate("CategoryForm", { category: item })
                  }
                >
                  <Text className="text-slate-700 font-bold text-sm">
                    Editar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                  onPress={() => confirmDelete(item)}
                >
                  <Text className="text-red-600 font-bold text-sm">
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
