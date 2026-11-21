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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { apiClient } from "../../api/client";
import { Doctor } from "../../types";
import Dropdown from "../../components/Dropdown";

export default function PatientFormScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { mode, patient, doctorId: preselectedDoctorId } = route.params || {
    mode: "create",
  };

  const [name, setName] = useState(patient?.name || "");
  const [age, setAge] = useState(patient?.age?.toString() || "");
  const [gender, setGender] = useState(patient?.gender || "MALE");
  const [phone, setPhone] = useState(patient?.phone || "");
  const [email, setEmail] = useState(patient?.email || "");
  const [condition, setCondition] = useState(patient?.condition || "");
  const [notes, setNotes] = useState(patient?.notes || "");
  const [doctorId, setDoctorId] = useState(
    patient?.doctorId || preselectedDoctorId || ""
  );

  const { data: doctorsData } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: () => apiClient<{ data: Doctor[] }>("/doctors?limit=100"),
  });

  const { data: conditionOptions } = useQuery({
    queryKey: ["patient-filter-options"],
    queryFn: () =>
      apiClient<{ conditions: string[] }>("/patients/filter-options"),
  });

  const doctors = doctorsData?.data || [];
  const conditionsList = conditionOptions?.conditions || [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Heart Disease",
    "Fever",
    "Other",
  ];

  const genderOptions = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ];

  const conditionDropdownOptions = [
    { label: "Select condition...", value: "" },
    ...conditionsList.map((c) => ({ label: c, value: c })),
  ];

  const doctorOptions = [
    { label: "Select doctor...", value: "" },
    ...doctors.map((d) => ({
      label: `${d.name} (${d.specialization})`,
      value: d.id,
    })),
  ];

  const mutation = useMutation({
    mutationFn: (body: any) => {
      if (mode === "edit") {
        return apiClient(`/patients/${patient.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      return apiClient(`/doctors/${doctorId}/patients`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Something went wrong");
    },
  });

  const handleSubmit = () => {
    if (!name || !age || !phone || !condition || !doctorId) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const body: any = {
      name: name.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      condition: condition.trim(),
    };

    if (email) body.email = email.trim();
    if (notes) body.notes = notes.trim();
    if (mode === "edit") body.doctorId = doctorId;

    mutation.mutate(body);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Patient name"
      />

      <Text style={styles.label}>Age *</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        placeholder="Age"
      />

      {/* Gender Dropdown */}
      <Dropdown
        label="Gender *"
        options={genderOptions}
        value={gender}
        onChange={setGender}
      />

      <Text style={styles.label}>Phone *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Phone number"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email (optional)"
      />

      {/* Condition Dropdown */}
      <Dropdown
        label="Condition (select) *"
        placeholder="Select condition..."
        options={conditionDropdownOptions}
        value={condition}
        onChange={setCondition}
      />

      {/* Condition Input (custom type) */}
      <Text style={styles.label}>Or type condition *</Text>
      <TextInput
        style={styles.input}
        value={condition}
        onChangeText={setCondition}
        placeholder="Type custom condition"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Additional notes"
      />

      {/* Doctor Dropdown */}
      <Dropdown
        label="Doctor *"
        placeholder="Select doctor..."
        options={doctorOptions}
        value={doctorId}
        onChange={setDoctorId}
        disabled={!!preselectedDoctorId}
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
            {mode === "edit" ? "Update Patient" : "Create Patient"}
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