import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { createOrder } from "../api/cafeteria";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Order } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export default function CartSheet({ visible, onClose, onOrderCreated }: Props) {
  const { items, setQuantity, remove, total, clear } = useCart();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (!user || items.length === 0 || busy) return;
    setBusy(true);
    try {
      const order = await createOrder({
        user_id: user.id,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });
      clear();
      onClose();
      onOrderCreated(order);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      Alert.alert(
        "Error al crear la orden",
        typeof detail === "string" ? detail : "Intenta de nuevo."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-5 pb-8 max-h-[80%]">
          <View className="w-12 h-1 bg-slate-300 rounded-full self-center mb-4" />
          <Text className="text-xl font-bold text-slate-800 mb-3">
            Tu carrito ({items.length})
          </Text>

          <ScrollView className="max-h-[45%]">
            {items.length === 0 ? (
              <Text className="text-slate-400 text-center py-8">
                Tu carrito está vacío
              </Text>
            ) : (
              items.map((i) => (
                <View
                  key={i.product.id}
                  className="flex-row items-center justify-between py-3 border-b border-slate-100"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-slate-800 font-semibold">
                      {i.product.name}
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      ${i.product.price.toFixed(2)} c/u
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      className="w-8 h-8 rounded-lg bg-slate-200 items-center justify-center"
                      onPress={() =>
                        setQuantity(i.product.id, i.quantity - 1)
                      }
                    >
                      <Text className="font-bold text-slate-700">-</Text>
                    </TouchableOpacity>
                    <Text className="w-6 text-center font-bold">
                      {i.quantity}
                    </Text>
                    <TouchableOpacity
                      className="w-8 h-8 rounded-lg bg-brand-100 items-center justify-center"
                      onPress={() =>
                        setQuantity(i.product.id, i.quantity + 1)
                      }
                    >
                      <Text className="font-bold text-brand-700">+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="ml-1 px-2"
                      onPress={() => remove(i.product.id)}
                    >
                      <Text className="text-red-500">Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-slate-500">Total</Text>
            <Text className="text-2xl font-extrabold text-slate-800">
              ${total.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-slate-200 items-center"
              onPress={onClose}
            >
              <Text className="text-slate-700 font-bold">Seguir comprando</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-emerald-600 items-center"
              onPress={checkout}
              disabled={busy || items.length === 0}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Confirmar pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
