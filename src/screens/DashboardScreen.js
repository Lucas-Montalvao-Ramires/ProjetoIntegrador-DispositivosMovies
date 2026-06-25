import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useData, STATUS_INFO } from "../context/DataContext";

export default function DashboardScreen({ navigation }) {
  // Lê os leitos do estado compartilhado (atualiza sozinho quando algo muda).
  const { leitos } = useData();

  const renderLeito = ({ item }) => {
    const isVago = item.status === "vago";
    const style = STATUS_INFO[item.status] || STATUS_INFO.vago;

    return (
      <TouchableOpacity
        style={[styles.bedCard, { backgroundColor: style.bg, borderColor: style.border }]}
        // Só abre os detalhes se houver paciente no leito.
        onPress={() => !isVago && navigation.navigate("PatientDetails", { bedId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.bedHeader}>
          <Text style={[styles.bedId, { color: style.text }]}>{item.leito}</Text>
          <Text style={[styles.statusBadge, { color: style.text }]}>{style.label}</Text>
        </View>

        {isVago ? (
          <View style={styles.vagoContent}>
            <Feather name="plus" size={24} color="#cbd5e0" />
            <Text style={styles.vagoText}>Leito disponível</Text>
          </View>
        ) : (
          <>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.paciente?.nome}
            </Text>
            <Text style={styles.diagnosis} numberOfLines={1}>
              {item.paciente?.diagnostico}
            </Text>
            <View style={styles.evalButton}>
              <Text style={styles.evalButtonText}>Avaliar Paciente</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.mainHeader}>
        <View style={styles.row}>
          <View style={styles.logoMini}>
            <MaterialCommunityIcons name="pulse" size={20} color="white" />
          </View>
          <Text style={styles.headerTitle}>Emergência - Fisioterapia</Text>
        </View>
      </View>

      <FlatList
        data={leitos}
        renderItem={renderLeito}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color="#cbd5e0" />
            <Text style={styles.emptyText}>Nenhum leito cadastrado.</Text>
            <Text style={styles.emptySub}>Use "Gerenciar leitos" para adicionar.</Text>
          </View>
        }
      />

      {/* Rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.manageFooterBtn} onPress={() => navigation.navigate("ManageBeds")}>
          <Feather name="settings" size={20} color="#00a88e" />
          <Text style={styles.manageFooterText}>Gerenciar leitos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutFooterBtn} onPress={() => navigation.goBack()}>
          <Feather name="log-out" size={20} color="#e53e3e" />
          <Text style={styles.logoutFooterText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  mainHeader: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  row: { flexDirection: "row", alignItems: "center" },
  logoMini: {
    backgroundColor: "#00a88e",
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1a202c" },
  listContent: { padding: 15 },
  columnWrapper: { justifyContent: "space-between" },
  bedCard: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderTopWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  bedHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  bedId: { fontWeight: "bold", fontSize: 16 },
  statusBadge: { fontSize: 10, fontWeight: "bold" },
  patientName: { fontSize: 14, fontWeight: "bold", color: "#2d3748" },
  diagnosis: { fontSize: 11, color: "#718096", marginTop: 4, marginBottom: 10 },
  evalButton: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#edf2f7",
  },
  evalButtonText: { fontSize: 10, fontWeight: "bold", color: "#4a5568" },
  vagoContent: { alignItems: "center", paddingVertical: 20 },
  vagoText: { color: "#a0aec0", fontSize: 10, marginTop: 5 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#718096", fontWeight: "bold", marginTop: 10 },
  emptySub: { color: "#a0aec0", fontSize: 12, marginTop: 4 },
  footer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#edf2f7",
    justifyContent: "space-between",
    alignItems: "center",
  },
  manageFooterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  manageFooterText: { marginLeft: 8, color: "#00a88e", fontWeight: "bold", fontSize: 14 },
  logoutFooterBtn: { flexDirection: "row", alignItems: "center", padding: 10 },
  logoutFooterText: { marginLeft: 8, color: "#e53e3e", fontWeight: "600", fontSize: 14 },
});
