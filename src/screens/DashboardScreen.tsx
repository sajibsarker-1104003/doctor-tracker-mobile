import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { BarChart, PieChart } from "react-native-chart-kit";
import { apiClient } from "../api/client";
import { DashboardSummary } from "../types";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiClient<DashboardSummary>("/dashboard/summary"),
  });

  const perDoctor = useQuery({
    queryKey: ["patients-per-doctor"],
    queryFn: () =>
      apiClient<any>("/dashboard/patients-per-doctor?limit=6"),
  });

  const conditions = useQuery({
    queryKey: ["conditions"],
    queryFn: () => apiClient<any>("/dashboard/conditions"),
  });

  if (summary.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Safely extract arrays from different possible response shapes
  const perDoctorData = Array.isArray(perDoctor.data)
    ? perDoctor.data
    : Array.isArray(perDoctor.data?.data)
    ? perDoctor.data.data
    : [];

  const conditionData = Array.isArray(conditions.data)
    ? conditions.data
    : Array.isArray(conditions.data?.data)
    ? conditions.data.data
    : [];

  const barData = {
    labels: perDoctorData.map((d: any) => {
      const name = d?.doctorName || d?.name || "Unknown";
      return String(name).split(" ")[0];
    }),
    datasets: [
      {
        data:
          perDoctorData.length > 0
            ? perDoctorData.map((d: any) => Number(d?.count) || 0)
            : [0],
      },
    ],
  };

  const pieColors = [
    "#2563eb",
    "#16a34a",
    "#ca8a04",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
  ];

  const pieData = conditionData.slice(0, 5).map((c: any, i: number) => ({
    name: c?.condition || c?.name || "Unknown",
    population: Number(c?.count) || 0,
    color: pieColors[i % pieColors.length],
    legendFontColor: "#334155",
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Clinical Overview</Text>

      {/* Stat Cards */}
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.cardValue}>
            {summary.data?.totalDoctors ?? 0}
          </Text>
          <Text style={styles.cardLabel}>Doctors</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#dcfce7" }]}>
          <Text style={styles.cardValue}>
            {summary.data?.totalPatients ?? 0}
          </Text>
          <Text style={styles.cardLabel}>Patients</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#fef3c7" }]}>
          <Text style={styles.cardValue}>
            {summary.data?.avgPatientsPerDoctor?.toFixed(1) ?? "0"}
          </Text>
          <Text style={styles.cardLabel}>Avg / Doctor</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#fce7f3" }]}>
          <Text style={styles.cardValue}>
            {summary.data?.newPatientsLast30Days ?? 0}
          </Text>
          <Text style={styles.cardLabel}>New (30 days)</Text>
        </View>
      </View>

      {/* Patients per Doctor Chart */}
      {perDoctorData.length > 0 && (
        <>
          <Text style={styles.section}>Patients per Doctor</Text>
          <BarChart
            data={barData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => "#64748b",
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </>
      )}

      {/* Conditions Pie Chart */}
      {pieData.length > 0 && (
        <>
          <Text style={styles.section}>Conditions</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            absolute
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardLabel: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  section: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1e293b",
  },
  chart: {
    borderRadius: 12,
    marginBottom: 24,
  },
});