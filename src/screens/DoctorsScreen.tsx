import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { Doctor } from "../types";

export default function DoctorsScreen() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", search],
    queryFn: () =>
      apiClient<{ data: Doctor[] }>(
        `/doctors?search=${encodeURIComponent(search)}&limit=50`
      ),
  });

  const doctors = data?.data || [];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search doctors..."
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.spec}>{item.specialization}</Text>
              <Text style={styles.hospital}>{item.hospital}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
  },
  spec: {
    fontSize: 14,
    color: "#2563eb",
    marginTop: 2,
  },
  hospital: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  phone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#94a3b8",
  },
});