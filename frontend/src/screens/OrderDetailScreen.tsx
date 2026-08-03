import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getOrder } from "../api/cafeteria";
import type { OrdersStackParamList } from "../navigation/types";
import type { Order } from "../types";
import { statusColors, statusLabel } from "./OrderHistoryScreen";

type Route = RouteProp<OrdersStackParamList, "OrderDetail">;

export default function OrderDetailScreen() {
  const route = useRoute<Route>();
  const [order, setOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setOrder(await getOrder(route.params.orderId));
  }, [route.params.orderId]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  if (!order) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-slate-400">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-5 border-b border-slate-200 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold text-slate-800">
            Pedido #{order.id}
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${statusColors[order.status] ?? "bg-slate-200"}`}
          >
            <Text className="text-xs font-bold">
              {statusLabel[order.status] ?? order.status}
            </Text>
          </View>
        </View>
        <Text className="text-slate-400 text-sm mt-1">
          {new Date(order.created_at).toLocaleString()}
        </Text>
      </View>

      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={order.items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View className="flex-row justify-between py-3 border-b border-slate-100">
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-slate-800">
                {item.product_name ?? `Producto #${item.product_id}`}
              </Text>
              <Text className="text-slate-400 text-sm">
                {item.quantity} × ${item.unit_price.toFixed(2)}
              </Text>
            </View>
            <Text className="font-bold text-slate-800">
              ${(item.quantity * item.unit_price).toFixed(2)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View className="mt-4">
            <TouchableOpacity
              className="bg-brand-600 py-3 rounded-xl items-center"
              onPress={load}
            >
              <Text className="text-white font-bold">Actualizar estado</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <View className="p-5 bg-white border-t border-slate-200 flex-row justify-between">
        <Text className="text-lg font-bold text-slate-800">Total</Text>
        <Text className="text-2xl font-extrabold text-brand-700">
          ${order.total.toFixed(2)}
        </Text>
      </View>
    </SafeAreaView>
  );
}
