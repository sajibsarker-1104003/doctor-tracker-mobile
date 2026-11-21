import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { apiClient } from "../../api/client";

export default function DoctorFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { mode, doctor } = route.params || { mode: "create" };

  const [name, setName] = useState(doctor?.name || "");
  const [specialization, setSpecialization] = useState(
    doctor?.specialization || ""
  );
  const [hospital, setHospital] = useState(doctor?.hospital || "");
  const [phone, setPhone] = useState(doctor?.phone || "");
  const [email, setEmail] = useState(doctor?.email || "");

  // Filter options for dropdowns
  const { data: filterOptions } = useQuery({
    queryKey: ["doctor-filter-options"],
    queryFn: () =>
      apiClient<{ specializations: string[]; hospitals: string[] }>(
        "/doctors/filter-options"
      ),
  });

  const specializations = filterOptions?.specializations || [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
  ];

  const hospitals = filterOptions?.hospitals || [
    "City Hospital",
    "General Hospital",
    "Medical Center",
  ];

  const mutation = useMutation({
    mutationFn: (body: any) => {
      if (mode === "edit") {
        return apiClient(`/doctors/${doctor.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      return apiClient("/doctors", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-filter-options"] });
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Something went wrong");
    },
  });

  const handleSubmit = () => {
    if (!name || !specialization || !hospital || !phone || !email) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    mutation.mutate({
      name: name.trim(),
      specialization: specialization.trim(),
      hospital: hospital.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Doctor name"
      />

      {/* Specialization Dropdown */}
      <Text style={styles.label}>Specialization *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={specialization}
          onValueChange={(value) => setSpecialization(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select specialization..." value="" />
          {specializations.map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Or type custom specialization</Text>
      <TextInput
        style={styles.input}
        value={specialization}
        onChangeText={setSpecialization}
        placeholder="Custom specialization"
      />

      {/* Hospital Dropdown */}
      <Text style={styles.label}>Hospital *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={hospital}
          onValueChange={(value) => setHospital(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select hospital..." value="" />
          {hospitals.map((h) => (
            <Picker.Item key={h} label={h} value={h} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Or type custom hospital</Text>
      <TextInput
        style={styles.input}
        value={hospital}
        onChangeText={setHospital}
        placeholder="Custom hospital"
      />

      <Text style={styles.label}>Phone *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Phone number"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
      />

      <TouchableOpacity
        style={[styles.button, mutation.isPending && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === "edit" ? "Update Doctor" : "Create Doctor"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});