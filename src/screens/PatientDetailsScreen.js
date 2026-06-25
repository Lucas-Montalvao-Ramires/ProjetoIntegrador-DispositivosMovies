import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useData, STATUS, STATUS_INFO } from "../context/DataContext";

// Item de opção (radio)
const RadioOption = ({ label, selected, onSelect }) => (
  <TouchableOpacity style={[styles.radioItem, selected && styles.radioItemSelected]} onPress={onSelect}>
    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
      {selected && <View style={styles.radioInnerCircle} />}
    </View>
    <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
  </TouchableOpacity>
);

// Seção de avaliação (lista de opções)
const EvaluationSection = ({ title, icon, options, selectedValue, onValueChange, iconColor }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconBg, { backgroundColor: iconColor + "20" }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {options.map((option) => (
      <RadioOption
        key={option}
        label={option}
        selected={selectedValue === option}
        onSelect={() => onValueChange(option)}
      />
    ))}
  </View>
);

// Opções de status que o fisioterapeuta pode definir manualmente.
const STATUS_OPCOES = [STATUS.ESTAVEL, STATUS.OBSERVACAO, STATUS.CRITICO];

export default function PatientDetailsScreen({ navigation, route }) {
  const { bedId } = route.params || {};
  const { getLeito, atualizarStatus, salvarAvaliacao, editarPaciente } = useData();

  const leito = getLeito(bedId);
  const p = leito?.paciente;
  const av = leito?.avaliacao || {};

  // Todos os hooks ficam ANTES de qualquer "return" (regras dos Hooks).
  const [consciencia, setConsciencia] = useState(av.consciencia ?? null);
  const [ventilacao, setVentilacao] = useState(av.ventilacao ?? null);
  const [oxigenio, setOxigenio] = useState(av.oxigenio ?? null);
  const [secrecao, setSecrecao] = useState(av.secrecao ?? null);

  // Modal de edição dos dados do paciente.
  const [editVisible, setEditVisible] = useState(false);
  const [eNome, setENome] = useState("");
  const [eIdade, setEIdade] = useState("");
  const [eDiag, setEDiag] = useState("");

  // Se o leito não existir (ex.: foi removido), mostra um aviso.
  if (!leito || !p) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Feather name="alert-circle" size={40} color="#cbd5e0" />
        <Text style={{ color: "#718096", marginTop: 10 }}>Paciente não encontrado.</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const abrirEdicao = () => {
    setENome(p.nome ?? "");
    setEIdade(p.idade ? String(p.idade) : "");
    setEDiag(p.diagnostico ?? "");
    setEditVisible(true);
  };

  const salvarEdicao = () => {
    if (eNome.trim() === "") {
      Alert.alert("Atenção", "O nome do paciente não pode ficar vazio.");
      return;
    }
    editarPaciente(bedId, { nome: eNome.trim(), idade: eIdade, diagnostico: eDiag.trim() });
    setEditVisible(false);
    Alert.alert("Dados atualizados", "As informações do paciente foram salvas.");
  };

  const salvar = () => {
    salvarAvaliacao(bedId, { consciencia, ventilacao, oxigenio, secrecao });
    Alert.alert("Avaliação salva", "A avaliação fisioterapêutica foi registrada.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1a202c" />
        </TouchableOpacity>
        <View style={styles.topBarText}>
          <Text style={styles.topBarTitle}>Avaliação Fisioterapêutica</Text>
          <Text style={styles.topBarSubtitle}>
            Leito {leito.leito} • {p.nome}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card do paciente */}
        <View style={styles.patientCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={30} color="white" />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{p.nome}</Text>
            <Text style={styles.patientDetail}>
              {p.idade ? `${p.idade} anos • ` : ""}Leito {leito.leito}
            </Text>
            <Text style={styles.patientDiagnosis}>Diagnóstico: {p.diagnostico || "—"}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={abrirEdicao} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="edit-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Status do paciente (atualizável) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Status do paciente</Text>
          <View style={styles.statusRow}>
            {STATUS_OPCOES.map((s) => {
              const info = STATUS_INFO[s];
              const active = leito.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusChip,
                    { borderColor: info.border },
                    active && { backgroundColor: info.bg, borderColor: info.text },
                  ]}
                  onPress={() => atualizarStatus(bedId, s)}
                >
                  <Text style={[styles.statusChipText, { color: active ? info.text : "#718096" }]}>{info.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Atalho para a ficha de monitorização (parâmetros reais) */}
        <TouchableOpacity style={styles.monitorButton} onPress={() => navigation.navigate("Monitoring", { bedId })}>
          <MaterialCommunityIcons name="clipboard-pulse-outline" size={22} color="#fff" />
          <Text style={styles.monitorButtonText}>Ficha de Monitorização (parâmetros)</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Avaliação fisioterapêutica qualitativa */}
        <EvaluationSection
          title="Nível de Consciência"
          icon="brain"
          iconColor="#00a88e"
          options={["Consciente e orientado", "Confuso ou desorientado", "Sonolento", "Inconsciente"]}
          selectedValue={consciencia}
          onValueChange={setConsciencia}
        />

        <EvaluationSection
          title="Tipo de Ventilação"
          icon="weather-windy"
          iconColor="#4fd1c5"
          options={[
            "Ventilação espontânea",
            "Ventilação mecânica não invasiva (VMNI)",
            "Ventilação mecânica invasiva (VMI)",
            "Cateter nasal de alto fluxo (CNAF)",
          ]}
          selectedValue={ventilacao}
          onValueChange={setVentilacao}
        />

        <EvaluationSection
          title="Oxigenioterapia"
          icon="medical-bag"
          iconColor="#4fd1c5"
          options={[
            "Sem oxigênio suplementar",
            "Cateter nasal (até 5L/min)",
            "Máscara simples (5-10L/min)",
            "Máscara de Venturi",
            "Máscara com reservatório (>10L/min)",
          ]}
          selectedValue={oxigenio}
          onValueChange={setOxigenio}
        />

        <EvaluationSection
          title="Presença de Secreção"
          icon="stethoscope"
          iconColor="#4fd1c5"
          options={["Ausente", "Leve (fácil eliminação)", "Moderada", "Abundante (difícil eliminação)"]}
          selectedValue={secrecao}
          onValueChange={setSecrecao}
        />

        <TouchableOpacity style={styles.saveButton} onPress={salvar}>
          <Text style={styles.saveButtonText}>Salvar Avaliação</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de edição dos dados do paciente */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Paciente</Text>

            <Text style={styles.modalLabel}>Nome *</Text>
            <TextInput style={styles.modalInput} placeholder="Nome do paciente" value={eNome} onChangeText={setENome} />

            <Text style={styles.modalLabel}>Idade</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 65"
              keyboardType="number-pad"
              value={eIdade}
              onChangeText={setEIdade}
            />

            <Text style={styles.modalLabel}>Diagnóstico clínico</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputMultiline]}
              placeholder="Ex: Pneumonia"
              value={eDiag}
              onChangeText={setEDiag}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={salvarEdicao}>
                <Text style={styles.modalConfirmText}>Salvar</Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2f7",
  },
  topBarText: { marginLeft: 15 },
  topBarTitle: { fontSize: 18, fontWeight: "bold", color: "#1a202c" },
  topBarSubtitle: { fontSize: 12, color: "#718096" },
  scrollContent: { padding: 15 },
  patientCard: {
    backgroundColor: "#0066FF",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0066FF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: { backgroundColor: "rgba(255,255,255,0.2)", padding: 10, borderRadius: 50 },
  patientInfo: { marginLeft: 15, flex: 1 },
  patientName: { color: "white", fontSize: 20, fontWeight: "bold" },
  patientDetail: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  patientDiagnosis: { color: "white", fontSize: 13, fontWeight: "600", marginTop: 5 },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionIconBg: { padding: 6, borderRadius: 8, marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3748" },
  statusRow: { flexDirection: "row", marginTop: 12 },
  statusChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  statusChipText: { fontSize: 12, fontWeight: "bold" },
  monitorButton: {
    backgroundColor: "#051d3b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  monitorButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14, flex: 1, marginLeft: 10 },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#edf2f7",
    borderRadius: 10,
    marginBottom: 8,
  },
  radioItemSelected: { borderColor: "#00a88e", backgroundColor: "#f0fff4" },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioCircleSelected: { borderColor: "#00a88e" },
  radioInnerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: "#00a88e" },
  radioLabel: { fontSize: 14, color: "#4a5568", flex: 1 },
  radioLabelSelected: { color: "#2d3748", fontWeight: "500" },
  saveButton: {
    backgroundColor: "#00a88e",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backLink: { marginTop: 20 },
  backLinkText: { color: "#00a88e", fontWeight: "bold" },
  editButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal de edição
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
  modalInputMultiline: { height: 80, paddingTop: 12, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 18, marginRight: 8 },
  modalCancelText: { color: "#718096", fontWeight: "bold" },
  modalConfirm: { backgroundColor: "#00a88e", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  modalConfirmText: { color: "#fff", fontWeight: "bold" },
});
