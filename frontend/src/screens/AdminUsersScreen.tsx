import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { getUsers } from "../api/cafeteria";
import type { User } from "../types";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setUsers(await getUsers());
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Text className="text-2xl font-extrabold text-slate-800 px-5 pt-5 pb-2">
        Usuarios
      </Text>
      <FlatList
        className="flex-1"
        contentContainerClassName="p-4"
        data={users}
        keyExtractor={(u) => String(u.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListEmptyComponent={
          <Text className="text-slate-400 text-center py-10">
            No hay usuarios.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-bold text-slate-800">{item.full_name}</Text>
              <Text className="text-slate-400 text-sm">{item.email}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                {item.face_image ? "Rostro registrado" : "Sin rostro"}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                item.role === "admin"
                  ? "bg-violet-100"
                  : "bg-sky-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  item.role === "admin" ? "text-violet-700" : "text-sky-700"
                }`}
              >
                {item.role === "admin" ? "Admin" : "Alumno"}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
