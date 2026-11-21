import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../../api/client";
import { Doctor } from "../../types";
import { useAuth } from "../../features/auth/AuthContext";

export default function DoctorsScreen() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["doctors", search],
    queryFn: () =>
      apiClient<{ data: Doctor[] }>(
        `/doctors?search=${encodeURIComponent(search)}&limit=50`
      ),
  });

  const doctors = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/doctors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      Alert.alert("Success", "Doctor deleted");
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message || "Failed to delete doctor");
    },
  });

  const handleDelete = (doctor: Doctor) => {
    Alert.alert(
      "Delete Doctor",
      `Delete ${doctor.name}? All their patients will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(doctor.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.search}
          placeholder="Search doctors..."
          value={search}
          onChangeText={setSearch}
        />
        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("DoctorForm", { mode: "create" })}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("DoctorPatients", {
                  doctorId: item.id,
                  name: item.name,
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.spec}>{item.specialization}</Text>
                <Text style={styles.meta}>{item.hospital}</Text>
                <Text style={styles.meta}>{item.phone}</Text>
              </View>

              {isAdmin && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("DoctorForm", {
                        mode: "edit",
                        doctor: item,
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={22} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={22} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No doctors found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  topBar: { flexDirection: "row", gap: 10, marginBottom: 12 },
  search: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addBtn: {
    backgroundColor: "#2563eb",
    width: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  name: { fontSize: 17, fontWeight: "600", color: "#0f172a" },
  spec: { fontSize: 14, color: "#2563eb", marginTop: 2 },
  meta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  actions: { flexDirection: "row", gap: 16, marginLeft: 12 },
  empty: { textAlign: "center", marginTop: 40, color: "#94a3b8" },
});