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

import { getCategories, getProducts } from "../api/cafeteria";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Category, Order, Product } from "../types";
import CartSheet from "../components/CartSheet";

export default function ProductsScreen() {
  const { user, logout } = useAuth();
  const { add, count, total, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<number | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const load = useCallback(async () => {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const filtered =
    activeCat === "all"
      ? products
      : products.filter((p) => p.category_id === activeCat);

  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? "Sin categoría";

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-slate-500 text-sm">Bienvenido</Text>
          <Text className="text-xl font-extrabold text-slate-800">
            {user?.full_name}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
          onPress={logout}
        >
          <Text className="text-red-600 text-sm font-bold">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-2">
        <Text className="text-lg font-bold text-slate-800">
          Menú del día
        </Text>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperClassName="gap-3"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListHeaderComponent={
          <View className="flex-row flex-wrap gap-2 mb-4">
            <CategoryChip
              label="Todos"
              active={activeCat === "all"}
              onPress={() => setActiveCat("all")}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.name}
                active={activeCat === c.id}
                onPress={() => setActiveCat(c.id)}
              />
            ))}
          </View>
        }
        ListEmptyComponent={
          <Text className="text-slate-400 text-center py-10">
            No hay productos disponibles.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="flex-1 bg-white rounded-2xl p-3 mb-3 shadow-sm border border-slate-100">
            <View className="h-24 rounded-xl bg-slate-100 items-center justify-center mb-2">
              <Text className="text-slate-400 text-xs font-bold">
                {categoryName(item.category_id)}
              </Text>
            </View>
            <Text className="font-bold text-slate-800" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-slate-400 text-xs" numberOfLines={2}>
              {item.description}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-brand-700 font-extrabold">
                ${item.price.toFixed(2)}
              </Text>
              <TouchableOpacity
                className="bg-brand-600 px-4 py-2 rounded-xl"
                onPress={() => add(item)}
              >
                <Text className="text-white font-bold text-sm">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <TouchableOpacity
          className="bg-emerald-600 mx-4 mb-4 py-4 rounded-2xl flex-row items-center justify-between px-5"
          onPress={() => setCartOpen(true)}
        >
          <Text className="text-white font-bold">
            {count} artículo{count !== 1 ? "s" : ""}
          </Text>
          <Text className="text-white font-extrabold">${total.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      <CartSheet
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrderCreated={(order: Order) =>
          Alert.alert(
            "Pedido confirmado",
            `Tu pedido #${order.id} fue registrado con estado "${order.status}".`,
            [{ text: "OK" }]
          )
        }
      />
    </SafeAreaView>
  );
}

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full border ${
        active
          ? "bg-brand-600 border-brand-600"
          : "bg-white border-slate-200"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-semibold ${
          active ? "text-white" : "text-slate-600"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
