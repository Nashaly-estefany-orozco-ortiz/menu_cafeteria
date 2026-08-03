import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getUserOrders } from "../api/cafeteria";
import { useAuth } from "../context/AuthContext";
import type { OrdersStackParamList } from "../navigation/types";
import type { Order } from "../types";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  completed: "Completado",
  cancelled: "Cancelado",
};

type Nav = NativeStackNavigationProp<OrdersStackParamList>;

export default function OrderHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setOrders(await getUserOrders(user.id));
  }, [user]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Text className="text-2xl font-extrabold text-slate-800 px-5 pt-5 pb-2">
        Mis pedidos
      </Text>
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={orders}
        keyExtractor={(o) => String(o.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text className="text-slate-400 text-center py-10">
            Aún no tienes pedidos.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
            onPress={() =>
              navigation.navigate("OrderDetail", { orderId: item.id })
            }
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-slate-800">
                Pedido #{item.id}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${statusColors[item.status] ?? "bg-slate-200 text-slate-600"}`}
              >
                <Text className="text-xs font-bold">
                  {statusLabel[item.status] ?? item.status}
                </Text>
              </View>
            </View>
            <Text className="text-slate-500 text-sm">
              {item.items.length} artículo{item.items.length !== 1 ? "s" : ""} ·{" "}
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text className="text-brand-700 font-extrabold mt-1">
              ${item.total.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

export { statusColors, statusLabel };
