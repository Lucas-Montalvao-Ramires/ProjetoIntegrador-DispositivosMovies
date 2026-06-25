import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useData, STATUS_INFO } from "../context/DataContext";

export default function ManageBedsScreen({ navigation }) {
  const { leitos, addLeito, removeLeito, vagarLeito, admitirPaciente } = useData();

  const [novoLeito, setNovoLeito] = useState("");

  // Estado do modal de admissão de paciente.
  const [modalVisible, setModalVisible] = useState(false);
  const [leitoAlvo, setLeitoAlvo] = useState(null);
  const [pNome, setPNome] = useState("");
  const [pIdade, setPIdade] = useState("");
  const [pDiag, setPDiag] = useState("");

  const adicionarLeito = () => {
    if (novoLeito.trim() === "") return;
    addLeito(novoLeito);
    Alert.alert("Sucesso", `Leito ${novoLeito} adicionado!`);
    setNovoLeito("");
  };

  const confirmarRemover = (item) => {
    const ocupado = item.status !== "vago";
    Alert.alert(
      "Remover leito",
      ocupado
        ? `O leito ${item.numero} está OCUPADO por ${item.paciente}. Remover o leito vai excluí-lo do sistema. Deseja continuar?`
        : `Deseja remover o leito ${item.numero}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removeLeito(item.id) },
      ]
    );
  };

  const confirmarVagar = (id, numero) => {
    Alert.alert("Vagar leito", `Remover o paciente do leito ${numero} e torná-lo vago?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => vagarLeito(id) },
    ]);
  };

  const abrirAdmissao = (id) => {
    setLeitoAlvo(id);
    setPNome("");
    setPIdade("");
    setPDiag("");
    setModalVisible(true);
  };

  const confirmarAdmissao = () => {
    if (pNome.trim() === "") {
      Alert.alert("Atenção", "Informe ao menos o nome do paciente.");
      return;
    }
    admitirPaciente(leitoAlvo, { nome: pNome.trim(), idade: pIdade, diagnostico: pDiag.trim() });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Leitos</Text>
      </View>

      <View style={styles.content}>
        {/* Cadastrar novo leito */}
        <View style={styles.card}>
          <Text style={styles.label}>Cadastrar Novo Leito</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="bed-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Ex: L09"
                value={novoLeito}
                onChangeText={setNovoLeito}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={adicionarLeito}>
              <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Leitos Atuais ({leitos.length})</Text>

        <FlatList
          data={leitos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const vago = item.status === "vago";
            const info = STATUS_INFO[item.status] || STATUS_INFO.vago;
            return (
              <View style={[styles.bedItem, { borderLeftColor: info.text }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bedNumber}>{item.leito}</Text>
                  <Text style={[styles.bedStatus, { color: vago ? "#38a169" : info.text }]}>
                    {vago ? "Livre" : `${info.label}: ${item.paciente?.nome}`}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {vago ? (
                    <TouchableOpacity style={styles.admitButton} onPress={() => abrirAdmissao(item.id)}>
                      <Feather name="user-plus" size={16} color="#00a88e" />
                      <Text style={styles.admitText}>Admitir</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.vacateButton} onPress={() => confirmarVagar(item.id, item.leito)}>
                      <Text style={styles.vacateButtonText}>Vagar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.trashButton}
                    onPress={() => confirmarRemover({ id: item.id, numero: item.leito, status: item.status, paciente: item.paciente?.nome })}
                  >
                    <Feather name="trash-2" size={18} color="#e53e3e" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum leito cadastrado ainda.</Text>}
        />
      </View>

      {/* Modal de admissão de paciente */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Admitir Paciente</Text>

            <Text style={styles.modalLabel}>Nome *</Text>
            <TextInput style={styles.modalInput} placeholder="Nome do paciente" value={pNome} onChangeText={setPNome} />

            <Text style={styles.modalLabel}>Idade</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 65"
              keyboardType="number-pad"
              value={pIdade}
              onChangeText={setPIdade}
            />

            <Text style={styles.modalLabel}>Diagnóstico clínico</Text>
            <TextInput style={styles.modalInput} placeholder="Ex: Pneumonia" value={pDiag} onChangeText={setPDiag} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmarAdmissao}>
                <Text style={styles.modalConfirmText}>Admitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 15 },
  content: { padding: 20, flex: 1 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 15, elevation: 3, marginBottom: 25 },
  label: { fontSize: 14, fontWeight: "bold", color: "#4a5568", marginBottom: 10 },
  inputRow: { flexDirection: "row", alignItems: "center" },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#edf2f7",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  input: { flex: 1, marginLeft: 10 },
  addButton: {
    backgroundColor: "#00a88e",
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3748", marginBottom: 15 },
  bedItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#00a88e",
  },
  bedNumber: { fontSize: 16, fontWeight: "bold", color: "#2d3748" },
  bedStatus: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center" },
  admitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#9ae6b4",
  },
  admitText: { color: "#00a88e", fontSize: 12, fontWeight: "bold", marginLeft: 5 },
  vacateButton: {
    backgroundColor: "#fff5f5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#feb2b2",
  },
  vacateButtonText: { color: "#c53030", fontSize: 12, fontWeight: "bold" },
  trashButton: { marginLeft: 10, padding: 6 },
  emptyText: { color: "#a0aec0", textAlign: "center", marginTop: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 25 },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 22 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#051d3b", marginBottom: 15 },
  modalLabel: { fontSize: 13, color: "#4a5568", fontWeight: "600", marginBottom: 6, marginTop: 8 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#dce4ec",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    color: "#2d3748",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 18, marginRight: 8 },
  modalCancelText: { color: "#718096", fontWeight: "bold" },
  modalConfirm: { backgroundColor: "#00a88e", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  modalConfirmText: { color: "#fff", fontWeight: "bold" },
});
