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

import { deleteProduct, getProducts } from "../api/cafeteria";
import type { AdminStackParamList } from "../navigation/types";
import type { Product } from "../types";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminProductsScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setProducts(await getProducts(true));
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  function confirmDeactivate(product: Product) {
    Alert.alert(
      "Dar de baja",
      product.is_active
        ? `¿Dar de baja "${product.name}"?`
        : `¿Reactivar "${product.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: product.is_active ? "destructive" : "default",
          onPress: async () => {
            await deleteProduct(product.id);
            load();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-4 flex-row justify-between items-center">
        <Text className="text-2xl font-extrabold text-slate-800">
          Productos
        </Text>
        <TouchableOpacity
          className="bg-brand-600 px-4 py-2 rounded-xl"
          onPress={() => navigation.navigate("ProductForm", {})}
        >
          <Text className="text-white font-bold">Nuevo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={products}
        keyExtractor={(p) => String(p.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text className="text-slate-400 text-center py-10">
            No hay productos.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-3">
                <Text
                  className={`font-bold ${
                    item.is_active ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {item.name}
                </Text>
                <Text className="text-slate-400 text-sm">
                  ${item.price.toFixed(2)}
                </Text>
                {!item.is_active && (
                  <View className="self-start mt-1 bg-red-100 px-2 py-0.5 rounded">
                    <Text className="text-red-600 text-xs font-bold">
                      Inactivo
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-slate-200 px-3 py-2 rounded-lg"
                  onPress={() =>
                    navigation.navigate("ProductForm", { product: item })
                  }
                >
                  <Text className="text-slate-700 font-bold text-sm">
                    Editar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                  onPress={() => confirmDeactivate(item)}
                >
                  <Text className="text-red-600 font-bold text-sm">
                    {item.is_active ? "Baja" : "Alta"}
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
