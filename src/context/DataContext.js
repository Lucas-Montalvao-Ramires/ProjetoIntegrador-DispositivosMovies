import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * ============================================================================
 *  DataContext - Estado compartilhado do aplicativo (leitos + pacientes)
 * ============================================================================
 *
 *  Todas as telas leem e alteram os dados a partir daqui. Hoje os dados ficam
 *  em memória (mock). Quando o banco de dados estiver pronto, basta substituir
 *  o CORPO de cada função abaixo por uma chamada à API/DB (ex.: fetch/axios,
 *  Firebase, etc.). A "forma" dos dados e a assinatura das funções não precisam
 *  mudar - as telas continuam funcionando igual.
 *
 *  >>> PONTOS DE INTEGRAÇÃO COM O BANCO estão marcados com: // TODO(DB)
 * ============================================================================
 */

const DataContext = createContext(null);

// Status possíveis de um leito/paciente.
export const STATUS = {
  CRITICO: "critico",
  ESTAVEL: "estavel",
  OBSERVACAO: "observacao",
  VAGO: "vago",
};

// Metadados visuais de cada status (cores e rótulo) - usados nas telas.
export const STATUS_INFO = {
  critico: {
    bg: "#fff5f5",
    border: "#feb2b2",
    text: "#c53030",
    label: "Crítico",
  },
  estavel: {
    bg: "#f0fff4",
    border: "#9ae6b4",
    text: "#2f855a",
    label: "Estável",
  },
  observacao: {
    bg: "#fffaf0",
    border: "#fbd38d",
    text: "#975a16",
    label: "Observação",
  },
  vago: { bg: "#f7fafc", border: "#edf2f7", text: "#a0aec0", label: "Vago" },
};

// Dados iniciais (mock). Serão carregados do banco quando ele existir.
const LEITOS_INICIAIS = [
  {
    id: "1",
    leito: "L01",
    status: STATUS.CRITICO,
    paciente: {
      nome: "João Silva",
      idade: 68,
      sexo: "M",
      diagnostico: "DPOC agudizada",
    },
    avaliacao: null,
    monitoramento: null,
    atualizadoEm: null,
  },
  {
    id: "2",
    leito: "L02",
    status: STATUS.ESTAVEL,
    paciente: {
      nome: "Maria Santos",
      idade: 74,
      sexo: "F",
      diagnostico: "Pneumonia",
    },
    avaliacao: null,
    monitoramento: null,
    atualizadoEm: null,
  },
  {
    id: "3",
    leito: "L03",
    status: STATUS.OBSERVACAO,
    paciente: {
      nome: "Carlos Oliveira",
      idade: 59,
      sexo: "M",
      diagnostico: "Insuficiência respiratória",
    },
    avaliacao: null,
    monitoramento: null,
    atualizadoEm: null,
  },
  {
    id: "4",
    leito: "L04",
    status: STATUS.VAGO,
    paciente: null,
    avaliacao: null,
    monitoramento: null,
    atualizadoEm: null,
  },
  {
    id: "5",
    leito: "L05",
    status: STATUS.OBSERVACAO,
    paciente: {
      nome: "Lucia Fernandes",
      idade: 79,
      sexo: "F",
      diagnostico: "Sepse respiratória",
    },
    avaliacao: null,
    monitoramento: null,
    atualizadoEm: null,
  },
];

// Gerador simples de IDs locais (evita colisões enquanto não há banco).
let _seq = 1000;
const novoId = () => String(_seq++);

export function DataProvider({ children }) {
  const [leitos, setLeitos] = useState(LEITOS_INICIAIS);

  // ---- LEITOS ----------------------------------------------------------------

  const addLeito = useCallback((numero) => {
    const num = String(numero || "").trim();
    if (!num) return;
    // TODO(DB): INSERT de um novo leito e usar o id retornado pelo banco.
    setLeitos((prev) => [
      ...prev,
      {
        id: novoId(),
        leito: num,
        status: STATUS.VAGO,
        paciente: null,
        avaliacao: null,
        monitoramento: null,
        atualizadoEm: null,
      },
    ]);
  }, []);

  const removeLeito = useCallback((id) => {
    // TODO(DB): DELETE do leito pelo id.
    setLeitos((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // ---- PACIENTES -------------------------------------------------------------

  const admitirPaciente = useCallback((id, dados) => {
    // TODO(DB): vincular paciente ao leito (UPDATE leito SET paciente=..., status=...).
    setLeitos((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: dados.status || STATUS.ESTAVEL,
              paciente: {
                nome: dados.nome,
                idade: dados.idade ? Number(dados.idade) : null,
                sexo: dados.sexo || null,
                diagnostico: dados.diagnostico || "",
              },
              avaliacao: null,
              monitoramento: null,
              atualizadoEm: Date.now(),
            }
          : l,
      ),
    );
  }, []);

  const vagarLeito = useCallback((id) => {
    // TODO(DB): dar alta / liberar leito (UPDATE leito SET paciente=NULL, status='vago').
    setLeitos((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: STATUS.VAGO,
              paciente: null,
              avaliacao: null,
              monitoramento: null,
              atualizadoEm: null,
            }
          : l,
      ),
    );
  }, []);

  const atualizarStatus = useCallback((id, status) => {
    // TODO(DB): UPDATE leito SET status=? WHERE id=?
    setLeitos((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status, atualizadoEm: Date.now() } : l,
      ),
    );
  }, []);

  const editarPaciente = useCallback((id, dados) => {
    // TODO(DB): UPDATE dos dados cadastrais do paciente (nome, idade, diagnóstico).
    setLeitos((prev) =>
      prev.map((l) =>
        l.id === id && l.paciente
          ? {
              ...l,
              paciente: {
                ...l.paciente,
                nome: dados.nome,
                idade: dados.idade ? Number(dados.idade) : null,
                diagnostico: dados.diagnostico || "",
              },
              atualizadoEm: Date.now(),
            }
          : l,
      ),
    );
  }, []);

  // ---- AVALIAÇÃO FISIOTERAPÊUTICA (qualitativa) ------------------------------

  const salvarAvaliacao = useCallback((id, avaliacao) => {
    // TODO(DB): salvar avaliação fisioterapêutica do paciente.
    setLeitos((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, avaliacao, atualizadoEm: Date.now() } : l,
      ),
    );
  }, []);

  // ---- FICHA DE MONITORIZAÇÃO (parâmetros reais do hospital) -----------------

  const salvarMonitoramento = useCallback((id, monitoramento) => {
    // TODO(DB): salvar a ficha de monitorização (vitais, sedação, gasometria...).
    setLeitos((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, monitoramento, atualizadoEm: Date.now() } : l,
      ),
    );
  }, []);

  // ---- LEITURA ---------------------------------------------------------------

  const getLeito = useCallback(
    (id) => leitos.find((l) => l.id === id),
    [leitos],
  );

  const value = {
    leitos,
    addLeito,
    removeLeito,
    admitirPaciente,
    vagarLeito,
    atualizarStatus,
    editarPaciente,
    salvarAvaliacao,
    salvarMonitoramento,
    getLeito,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Hook de acesso ao estado compartilhado.
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx)
    throw new Error("useData() deve ser usado dentro de <DataProvider>.");
  return ctx;
}
