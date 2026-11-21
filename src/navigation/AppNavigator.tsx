import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../features/auth/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DoctorsScreen from "../screens/doctors/DoctorsScreen";
import DoctorFormScreen from "../screens/doctors/DoctorFormScreen";
import DoctorPatientsScreen from "../screens/doctors/DoctorPatientsScreen";
import PatientsScreen from "../screens/patients/PatientsScreen";
import PatientFormScreen from "../screens/patients/PatientFormScreen";
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Doctor Tracker</Text>
        <Text style={styles.drawerUser}>{user?.name}</Text>
        <Text style={styles.drawerRole}>{user?.role}</Text>
      </View>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("Dashboard")}
      >
        <Ionicons name="grid-outline" size={22} color="#334155" />
        <Text style={styles.drawerItemText}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("Doctors")}
      >
        <Ionicons name="medkit-outline" size={22} color="#334155" />
        <Text style={styles.drawerItemText}>Doctors</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("Patients")}
      >
        <Ionicons name="people-outline" size={22} color="#334155" />
        <Text style={styles.drawerItemText}>Patients</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color="#dc2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#f8fafc" },
        headerTitleStyle: { fontWeight: "600" },
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Doctors" component={DoctorsScreen} />
      <Drawer.Screen name="Patients" component={PatientsScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainDrawer}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DoctorForm"
              component={DoctorFormScreen}
              options={{ title: "Doctor" }}
            />
            <Stack.Screen
              name="DoctorPatients"
              component={DoctorPatientsScreen}
              options={{ title: "Doctor's Patients" }}
            />
            <Stack.Screen
              name="PatientForm"
              component={PatientFormScreen}
              options={{ title: "Patient" }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  drawerUser: {
    fontSize: 14,
    color: "#334155",
    marginTop: 8,
  },
  drawerRole: {
    fontSize: 12,
    color: "#64748b",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  drawerItemText: {
    fontSize: 16,
    color: "#334155",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  logoutText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "600",
  },
});