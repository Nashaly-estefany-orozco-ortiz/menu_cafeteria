import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import type { AdminStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const options = [
  { key: "AdminCategories", label: "Categorías", icon: "C", color: "bg-violet-100" },
  { key: "AdminProducts", label: "Productos", icon: "P", color: "bg-amber-100" },
  { key: "AdminOrders", label: "Órdenes", icon: "O", color: "bg-emerald-100" },
  { key: "AdminUsers", label: "Usuarios", icon: "U", color: "bg-sky-100" },
] as const;

export default function AdminHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Text className="text-2xl font-extrabold text-slate-800 px-5 pt-5 pb-2">
        Administración
      </Text>
      <Text className="text-slate-500 px-5 pb-4">
        Gestiona el catálogo, órdenes y usuarios.
      </Text>
      <View className="p-4 flex-row flex-wrap gap-4">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            className="w-[47%] bg-white rounded-2xl p-5 border border-slate-100"
            onPress={() => navigation.navigate(opt.key)}
          >
            <View
              className={`w-12 h-12 rounded-xl items-center justify-center ${opt.color}`}
            >
              <Text className="text-xl font-extrabold text-slate-700">
                {opt.icon}
              </Text>
            </View>
            <Text className="font-bold text-slate-800 mt-3">{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
