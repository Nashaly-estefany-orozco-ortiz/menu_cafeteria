import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import type {
  AdminStackParamList,
  MainTabsParamList,
  OrdersStackParamList,
  RootStackParamList,
} from "./types";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProductsScreen from "../screens/ProductsScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminCategoriesScreen from "../screens/AdminCategoriesScreen";
import CategoryFormScreen from "../screens/CategoryFormScreen";
import AdminProductsScreen from "../screens/AdminProductsScreen";
import ProductFormScreen from "../screens/ProductFormScreen";
import AdminOrdersScreen from "../screens/AdminOrdersScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";

const Root = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabsParamList>();
const Orders = createNativeStackNavigator<OrdersStackParamList>();
const Admin = createNativeStackNavigator<AdminStackParamList>();

function OrdersStack() {
  return (
    <Orders.Navigator screenOptions={{ headerShown: false }}>
      <Orders.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Orders.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: true, title: "Detalle" }}
      />
    </Orders.Navigator>
  );
}

function AdminStack() {
  return (
    <Admin.Navigator>
      <Admin.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ headerShown: false }}
      />
      <Admin.Screen
        name="AdminCategories"
        component={AdminCategoriesScreen}
        options={{ title: "Categorías" }}
      />
      <Admin.Screen
        name="CategoryForm"
        component={CategoryFormScreen}
        options={{ title: "Categoría" }}
      />
      <Admin.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{ title: "Productos" }}
      />
      <Admin.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: "Producto" }}
      />
      <Admin.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: "Órdenes" }}
      />
      <Admin.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: "Usuarios" }}
      />
    </Admin.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tabs.Screen
        name="Menu"
        component={ProductsScreen}
        options={{ title: "Menú" }}
      />
      <Tabs.Screen
        name="MisPedidos"
        component={OrdersStack}
        options={{ title: "Mis pedidos" }}
      />
      {user?.role === "admin" && (
        <Tabs.Screen
          name="Admin"
          component={AdminStack}
          options={{ title: "Admin" }}
        />
      )}
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-500 mt-3">Cargando sesión...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Root.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Root.Screen name="Login" component={LoginScreen} />
            <Root.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
