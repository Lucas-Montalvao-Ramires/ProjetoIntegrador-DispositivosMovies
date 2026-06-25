import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useData } from "../context/DataContext";

/* ---------- Componentes auxiliares ---------- */

// Campo numérico com rótulo e unidade.
const Field = ({ label, unit, value, onChange, placeholder, keyboard = "numeric", flex = 1 }) => (
  <View style={[styles.field, { flex }]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldInputWrap}>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e0"
        keyboardType={keyboard}
      />
      {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
    </View>
  </View>
);

// Botão Sim/Não.
const SimNao = ({ value, onChange }) => (
  <View style={styles.simNaoRow}>
    {[
      { k: "sim", label: "Sim" },
      { k: "nao", label: "Não" },
    ].map((opt) => {
      const active = value === opt.k;
      return (
        <TouchableOpacity
          key={opt.k}
          style={[styles.simNaoBtn, active && (opt.k === "sim" ? styles.simActive : styles.naoActive)]}
          onPress={() => onChange(active ? null : opt.k)}
        >
          <Text style={[styles.simNaoText, active && styles.simNaoTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// Seleção múltipla por "chips".
const Chips = ({ options, selected, onToggle }) => (
  <View style={styles.chipsWrap}>
    {options.map((opt) => {
      const active = selected.includes(opt);
      return (
        <TouchableOpacity key={opt} style={[styles.chip, active && styles.chipActive]} onPress={() => onToggle(opt)}>
          <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// Cabeçalho de seção.
const SectionHead = ({ icon, color, title }) => (
  <View style={styles.sectionHead}>
    <View style={[styles.sectionIcon, { backgroundColor: color + "20" }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const SEDACAO_OPCOES = ["Fentanil", "Midazolam", "Precedex", "Propofol", "Outro"];
const VASO_OPCOES = ["Noradrenalina", "Dobutamina", "Tridil", "Vasopressina", "Nipride", "Amiodarona", "Outro"];
const VM_MODOS = ["VCV", "PCV", "PSV", "SIMV"];

/* ---------- Tela ---------- */

export default function MonitoringScreen({ navigation, route }) {
  const { bedId } = route.params || {};
  const { getLeito, salvarMonitoramento } = useData();
  const leito = getLeito(bedId);
  const m = leito?.monitoramento || {};

  // Dados vitais
  const [fc, setFc] = useState(m.vitais?.fc ?? "");
  const [sato2, setSato2] = useState(m.vitais?.sato2 ?? "");
  const [pa, setPa] = useState(m.vitais?.pa ?? "");
  const [fr, setFr] = useState(m.vitais?.fr ?? "");
  const [temp, setTemp] = useState(m.vitais?.temp ?? "");

  // Sedação
  const [sedUso, setSedUso] = useState(m.sedacao?.uso ?? null);
  const [sedDrogas, setSedDrogas] = useState(m.sedacao?.drogas ?? []);

  // Drogas vasoativas
  const [vasoUso, setVasoUso] = useState(m.vasoativas?.uso ?? null);
  const [vasoDrogas, setVasoDrogas] = useState(m.vasoativas?.drogas ?? []);

  // Gasometria
  const [fio2, setFio2] = useState(m.gasometria?.fio2 ?? "");
  const [ph, setPh] = useState(m.gasometria?.ph ?? "");
  const [paco2, setPaco2] = useState(m.gasometria?.paco2 ?? "");
  const [pao2, setPao2] = useState(m.gasometria?.pao2 ?? "");
  const [hco3, setHco3] = useState(m.gasometria?.hco3 ?? "");
  const [be, setBe] = useState(m.gasometria?.be ?? "");
  const [sao2, setSao2] = useState(m.gasometria?.sao2 ?? "");
  const [pf, setPf] = useState(m.gasometria?.pf ?? "");
  const [lactato, setLactato] = useState(m.gasometria?.lactato ?? "");

  // Avaliação respiratória / VM
  const [vm, setVm] = useState(m.respiratoria?.vm ?? null);
  const [vmModo, setVmModo] = useState(m.respiratoria?.modo ?? null);
  const [peep, setPeep] = useState(m.respiratoria?.peep ?? "");
  const [fio2vm, setFio2vm] = useState(m.respiratoria?.fio2vm ?? "");

  const toggle = (lista, set, item) =>
    set(lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item]);

  const montarDados = () => ({
    vitais: { fc, sato2, pa, fr, temp },
    sedacao: { uso: sedUso, drogas: sedDrogas },
    vasoativas: { uso: vasoUso, drogas: vasoDrogas },
    gasometria: { fio2, ph, paco2, pao2, hco3, be, sao2, pf, lactato },
    respiratoria: { vm, modo: vmModo, peep, fio2vm },
  });

  const salvar = () => {
    salvarMonitoramento(bedId, montarDados());
    Alert.alert("Ficha salva", "Os parâmetros de monitorização foram registrados.");
  };

  // Gera o texto pronto para a evolução (apenas com campos preenchidos).
  const gerarEvolucao = () => {
    const linhas = [];
    const p = leito?.paciente;
    linhas.push("FISIOTERAPIA - EVOLUÇÃO");
    if (p) {
      linhas.push(`Leito ${leito.leito} | ${p.nome}${p.idade ? `, ${p.idade} anos` : ""}`);
      if (p.diagnostico) linhas.push(`Diagnóstico: ${p.diagnostico}`);
    }
    linhas.push("");

    const vitais = [];
    if (fc) vitais.push(`FC ${fc} bpm`);
    if (sato2) vitais.push(`SatO2 ${sato2}%`);
    if (pa) vitais.push(`PA ${pa} mmHg`);
    if (fr) vitais.push(`FR ${fr} irpm`);
    if (temp) vitais.push(`Temp ${temp}°C`);
    if (vitais.length) linhas.push("Dados vitais: " + vitais.join(" | "));

    if (sedUso === "sim") linhas.push("Sedação: Sim" + (sedDrogas.length ? ` (${sedDrogas.join(", ")})` : ""));
    else if (sedUso === "nao") linhas.push("Sedação: Não");

    if (vasoUso === "sim") linhas.push("Drogas vasoativas: Sim" + (vasoDrogas.length ? ` (${vasoDrogas.join(", ")})` : ""));
    else if (vasoUso === "nao") linhas.push("Drogas vasoativas: Não");

    const gaso = [];
    if (ph) gaso.push(`pH ${ph}`);
    if (paco2) gaso.push(`PaCO2 ${paco2}`);
    if (pao2) gaso.push(`PaO2 ${pao2}`);
    if (hco3) gaso.push(`HCO3 ${hco3}`);
    if (be) gaso.push(`BE ${be}`);
    if (sao2) gaso.push(`SaO2 ${sao2}`);
    if (pf) gaso.push(`P/F ${pf}`);
    if (lactato) gaso.push(`Lactato ${lactato}`);
    if (fio2) gaso.push(`FiO2 ${fio2}%`);
    if (gaso.length) linhas.push("Gasometria: " + gaso.join(" | "));

    if (vm === "sim") {
      let resp = "Ventilação mecânica: Sim";
      const det = [];
      if (vmModo) det.push(`modo ${vmModo}`);
      if (peep) det.push(`PEEP ${peep}`);
      if (fio2vm) det.push(`FiO2 ${fio2vm}%`);
      if (det.length) resp += ` (${det.join(", ")})`;
      linhas.push(resp);
    } else if (vm === "nao") {
      linhas.push("Ventilação mecânica: Não");
    }

    return linhas.join("\n");
  };

  const [textoGerado, setTextoGerado] = useState(null);

  const gerar = () => {
    salvarMonitoramento(bedId, montarDados()); // salva antes de gerar
    setTextoGerado(gerarEvolucao());
  };

  if (!leito) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#718096" }}>Leito não encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#00a88e", fontWeight: "bold" }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1a202c" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.topBarTitle}>Ficha de Monitorização</Text>
          <Text style={styles.topBarSubtitle}>
            Leito {leito.leito} • {leito.paciente?.nome}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Dados vitais */}
        <View style={styles.card}>
          <SectionHead icon="heart-pulse" color="#e53e3e" title="Dados vitais" />
          <View style={styles.rowFields}>
            <Field label="FC" unit="bpm" value={fc} onChange={setFc} placeholder="—" />
            <Field label="SatO2" unit="%" value={sato2} onChange={setSato2} placeholder="—" />
          </View>
          <View style={styles.rowFields}>
            <Field label="PA" unit="mmHg" value={pa} onChange={setPa} placeholder="120/80" keyboard="default" />
            <Field label="FR" unit="irpm" value={fr} onChange={setFr} placeholder="—" />
          </View>
          <View style={styles.rowFields}>
            <Field label="Temperatura" unit="°C" value={temp} onChange={setTemp} placeholder="—" />
            <View style={{ flex: 1 }} />
          </View>
        </View>

        {/* Sedação */}
        <View style={styles.card}>
          <SectionHead icon="sleep" color="#805ad5" title="Uso de sedação" />
          <SimNao value={sedUso} onChange={setSedUso} />
          {sedUso === "sim" && <Chips options={SEDACAO_OPCOES} selected={sedDrogas} onToggle={(o) => toggle(sedDrogas, setSedDrogas, o)} />}
        </View>

        {/* Drogas vasoativas */}
        <View style={styles.card}>
          <SectionHead icon="iv-bag" color="#dd6b20" title="Uso de drogas vasoativas" />
          <SimNao value={vasoUso} onChange={setVasoUso} />
          {vasoUso === "sim" && <Chips options={VASO_OPCOES} selected={vasoDrogas} onToggle={(o) => toggle(vasoDrogas, setVasoDrogas, o)} />}
        </View>

        {/* Gasometria */}
        <View style={styles.card}>
          <SectionHead icon="test-tube" color="#3182ce" title="Gasometria" />
          <View style={styles.rowFields}>
            <Field label="FiO2" unit="%" value={fio2} onChange={setFio2} placeholder="—" />
            <Field label="pH" value={ph} onChange={setPh} placeholder="—" />
          </View>
          <View style={styles.rowFields}>
            <Field label="PaCO2" value={paco2} onChange={setPaco2} placeholder="—" />
            <Field label="PaO2" value={pao2} onChange={setPao2} placeholder="—" />
          </View>
          <View style={styles.rowFields}>
            <Field label="HCO3" value={hco3} onChange={setHco3} placeholder="—" />
            <Field label="BE" value={be} onChange={setBe} placeholder="—" keyboard="default" />
          </View>
          <View style={styles.rowFields}>
            <Field label="SaO2" unit="%" value={sao2} onChange={setSao2} placeholder="—" />
            <Field label="P/F" value={pf} onChange={setPf} placeholder="—" />
          </View>
          <View style={styles.rowFields}>
            <Field label="Lactato" value={lactato} onChange={setLactato} placeholder="—" />
            <View style={{ flex: 1 }} />
          </View>
        </View>

        {/* Avaliação respiratória / VM */}
        <View style={styles.card}>
          <SectionHead icon="lungs" color="#319795" title="Avaliação respiratória — Uso de VM" />
          <SimNao value={vm} onChange={setVm} />
          {vm === "sim" && (
            <>
              <Text style={styles.subLabel}>Modo ventilatório</Text>
              <View style={styles.chipsWrap}>
                {VM_MODOS.map((mo) => {
                  const active = vmModo === mo;
                  return (
                    <TouchableOpacity key={mo} style={[styles.chip, active && styles.chipActive]} onPress={() => setVmModo(active ? null : mo)}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{mo}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={[styles.rowFields, { marginTop: 12 }]}>
                <Field label="PEEP" unit="cmH2O" value={peep} onChange={setPeep} placeholder="—" />
                <Field label="FiO2 (VM)" unit="%" value={fio2vm} onChange={setFio2vm} placeholder="—" />
              </View>
            </>
          )}
        </View>

        {/* Ações */}
        <TouchableOpacity style={styles.generateBtn} onPress={gerar}>
          <MaterialCommunityIcons name="text-box-check-outline" size={22} color="#fff" />
          <Text style={styles.generateText}>Gerar texto da evolução</Text>
        </TouchableOpacity>

        {textoGerado && (
          <View style={styles.outputCard}>
            <Text style={styles.outputTitle}>Texto pronto para o sistema do hospital</Text>
            <Text style={styles.outputHint}>Pressione e segure o texto para copiar.</Text>
            <View style={styles.outputBox}>
              <Text selectable style={styles.outputText}>
                {textoGerado}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={salvar}>
          <Text style={styles.saveText}>Salvar ficha</Text>
        </TouchableOpacity>
      </ScrollView>
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
  topBarTitle: { fontSize: 18, fontWeight: "bold", color: "#1a202c" },
  topBarSubtitle: { fontSize: 12, color: "#718096" },
  scroll: { padding: 15 },
  card: { backgroundColor: "#fff", borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionIcon: { padding: 6, borderRadius: 8, marginRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3748", flex: 1 },
  rowFields: { flexDirection: "row", justifyContent: "space-between" },
  field: { marginBottom: 12, marginRight: 10 },
  fieldLabel: { fontSize: 12, color: "#718096", fontWeight: "600", marginBottom: 5 },
  fieldInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#edf2f7",
    borderRadius: 10,
    backgroundColor: "#f7fafc",
    paddingHorizontal: 12,
    height: 46,
  },
  fieldInput: { flex: 1, color: "#2d3748", fontSize: 15 },
  fieldUnit: { color: "#a0aec0", fontSize: 12, marginLeft: 4 },
  subLabel: { fontSize: 12, color: "#718096", fontWeight: "600", marginTop: 12, marginBottom: 4 },
  simNaoRow: { flexDirection: "row" },
  simNaoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#edf2f7",
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  simActive: { backgroundColor: "#f0fff4", borderColor: "#9ae6b4" },
  naoActive: { backgroundColor: "#fff5f5", borderColor: "#feb2b2" },
  simNaoText: { color: "#718096", fontWeight: "bold" },
  simNaoTextActive: { color: "#2d3748" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#edf2f7",
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: "#00a88e", borderColor: "#00a88e" },
  chipText: { color: "#4a5568", fontSize: 13 },
  chipTextActive: { color: "#fff", fontWeight: "bold" },
  generateBtn: {
    backgroundColor: "#051d3b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  generateText: { color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 10 },
  outputCard: { backgroundColor: "#fff", borderRadius: 15, padding: 16, marginTop: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05 },
  outputTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3748" },
  outputHint: { fontSize: 11, color: "#a0aec0", marginTop: 2, marginBottom: 10 },
  outputBox: { backgroundColor: "#f7fafc", borderRadius: 10, borderWidth: 1, borderColor: "#edf2f7", padding: 12 },
  outputText: { color: "#2d3748", fontSize: 13, lineHeight: 20 },
  saveBtn: { backgroundColor: "#00a88e", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 15, marginBottom: 30 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
