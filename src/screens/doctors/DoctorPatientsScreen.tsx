import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../../api/client";
import { Patient } from "../../types";
import { useAuth } from "../../features/auth/AuthContext";

export default function DoctorPatientsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { doctorId, name } = route.params || {};
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["doctor-patients", doctorId],
    queryFn: () => apiClient<any>(`/doctors/${doctorId}/patients?limit=50`),
    enabled: !!doctorId,
  });

  const patients: Patient[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const deleteMutation = useMutation({
    mutationFn: (patientId: string) =>
      apiClient(`/doctors/${doctorId}/patients/${patientId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patients", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      Alert.alert("Success", "Patient deleted");
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.message || "Failed to delete patient");
    },
  });

  const handleDelete = (patient: Patient) => {
    Alert.alert(
      "Delete Patient",
      `Are you sure you want to delete ${patient.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(patient.id),
        },
      ]
    );
  };

  const handleAdd = () => {
    navigation.navigate("PatientForm", {
      mode: "create",
      doctorId: doctorId,
    });
  };

  const handleEdit = (patient: Patient) => {
    navigation.navigate("PatientForm", {
      mode: "edit",
      patient: patient,
      doctorId: doctorId,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {name || "Doctor"}'s Patients
        </Text>

        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addText}>Add Patient</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.age} yrs • {item.gender} • {item.condition}
                </Text>
                {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
              </View>

              {isAdmin && (
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Ionicons name="create-outline" size={22} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={22} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.empty}>No patients yet</Text>
              {isAdmin && (
                <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAdd}>
                  <Text style={styles.emptyAddText}>+ Add First Patient</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a", flex: 1 },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  addText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  meta: { fontSize: 13, color: "#64748b", marginTop: 3 },
  actions: { flexDirection: "row", gap: 14, marginLeft: 10 },
  emptyBox: { alignItems: "center", marginTop: 50 },
  empty: { color: "#94a3b8", fontSize: 15 },
  emptyAddBtn: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddText: { color: "#fff", fontWeight: "600" },
});