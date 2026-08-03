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

import { getOrders, updateOrderStatus } from "../api/cafeteria";
import type { AdminStackParamList } from "../navigation/types";
import type { Order } from "../types";
import { statusColors, statusLabel } from "./OrderHistoryScreen";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const nextStatuses: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export default function AdminOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setOrders(await getOrders());
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function changeStatus(order: Order, status: string) {
    await updateOrderStatus(order.id, status);
    load();
  }

  function onStatusTap(order: Order) {
    const options = nextStatuses[order.status] ?? [];
    if (options.length === 0) {
      Alert.alert("Sin cambios", "Este pedido no tiene más estados.");
      return;
    }
    Alert.alert(
      `Pedido #${order.id}`,
      "Cambiar estado a:",
      [
        ...options.map((s) => ({
          text: statusLabel[s] ?? s,
          onPress: () => changeStatus(order, s),
        })),
        { text: "Cancelar", style: "cancel" },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Text className="text-2xl font-extrabold text-slate-800 px-5 pt-5 pb-2">
        Órdenes
      </Text>

      <View className="px-5 flex-row gap-2 mb-2">
        {["all", ...Object.keys(statusLabel)].map((s) => (
          <TouchableOpacity
            key={s}
            className={`px-3 py-2 rounded-full border ${
              filter === s
                ? "bg-brand-600 border-brand-600"
                : "bg-white border-slate-200"
            }`}
            onPress={() => setFilter(s)}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === s ? "text-white" : "text-slate-600"
              }`}
            >
              {s === "all" ? "Todos" : statusLabel[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={filtered}
        keyExtractor={(o) => String(o.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text className="text-slate-400 text-center py-10">
            No hay órdenes.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-slate-800">Pedido #{item.id}</Text>
              <View
                className={`px-3 py-1 rounded-full ${statusColors[item.status] ?? "bg-slate-200"}`}
              >
                <Text className="text-xs font-bold">
                  {statusLabel[item.status] ?? item.status}
                </Text>
              </View>
            </View>
            <Text className="text-slate-500 text-sm">
              Usuario #{item.user_id} · {item.items.length} artículo
              {item.items.length !== 1 ? "s" : ""}
            </Text>
            <Text className="text-slate-500 text-sm">
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text className="text-brand-700 font-extrabold mt-1">
              ${item.total.toFixed(2)}
            </Text>
            <TouchableOpacity
              className="bg-slate-200 py-2 rounded-lg items-center mt-3"
              onPress={() => onStatusTap(item)}
            >
              <Text className="text-slate-700 font-bold text-sm">
                Actualizar estado
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
