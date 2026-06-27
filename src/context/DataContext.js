import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import axios from "axios";

const API_URL = "http://localhost:3000"; 

const DataContext = createContext(null);

export const STATUS = {
    CRITICO: "critico",
    ESTAVEL: "estavel",
    OBSERVACAO: "observacao",
    VAGO: "vago",
};

export const STATUS_INFO = {
    critico: { label: "Crítico", bg: "#FFE5E5", border: "#FF4D4D", text: "#B30000" },
    estavel: { label: "Estável", bg: "#E5FFE5", border: "#4DFF4D", text: "#006600" },
    observacao: { label: "Observação", bg: "#FFF9E5", border: "#FFD633", text: "#997A00" },
    vago: { label: "Vago", bg: "#F2F2F2", border: "#D9D9D9", text: "#666666" },
};

export function DataProvider({ children }) {
    const [leitos, setLeitos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeitos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/leitos`);
            const mappedData = response.data.map(item => ({
                ...item,
                leito: item.leito || item.bed_number
            }));
            setLeitos(mappedData);
        } catch (error) {
            console.error("Erro na API:", error);
            if (typeof window !== 'undefined' && window.alert) {
                window.alert("FALHA NA CONEXÃO: O servidor da API está desligado ou inacessível.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeitos();
    }, [fetchLeitos]);

    const addLeito = useCallback(async (numero) => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/leitos`, { numero });
            await fetchLeitos();
        } catch (error) {
            window.alert("Erro ao adicionar leito.");
        } finally {
            setLoading(false);
        }
    }, [fetchLeitos]);

    const removeLeito = useCallback(async (id) => {
        // DIAGNÓSTICO: Ver se a função é chamada
        console.log("Tentando remover leito ID:", id);
        if (typeof window !== 'undefined') {
            window.alert("Iniciando remoção do leito ID: " + id);
        }

        setLoading(true);
        try {
            const response = await axios.delete(`${API_URL}/leitos/${id}`);
            console.log("Resposta da deleção:", response.data);
            
            // Forçar atualização da lista
            await fetchLeitos();
            
            if (typeof window !== 'undefined') {
                window.alert("Leito removido com sucesso do banco!");
            }
        } catch (error) {
            console.error("Erro ao remover leito:", error);
            if (typeof window !== 'undefined') {
                window.alert("ERRO AO REMOVER: " + (error.response?.data || error.message));
            }
        } finally {
            setLoading(false);
        }
    }, [fetchLeitos]);

    const admitirPaciente = useCallback(async (leitoId, dados) => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/admitir`, { leitoId, ...dados });
            await fetchLeitos();
        } catch (error) {
            window.alert("Erro ao admitir paciente.");
        } finally {
            setLoading(false);
        }
    }, [fetchLeitos]);

    const vagarLeito = useCallback(async (id) => {
        setLoading(true);
        try {
            await axios.put(`${API_URL}/vagar/${id}`);
            await fetchLeitos();
        } catch (error) {
            window.alert("Erro ao liberar leito.");
        } finally {
            setLoading(false);
        }
    }, [fetchLeitos]);

    const getLeito = useCallback((id) => leitos.find((l) => l.id === id), [leitos]);

    const value = {
        leitos,
        loading,
        addLeito,
        removeLeito,
        admitirPaciente,
        vagarLeito,
        getLeito,
    };

    return (
        <DataContext.Provider value={value}>
            {loading && (
                <View style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(0,0,0,0.4)', 
                    zIndex: 9999 
                }}>
                    <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 15, elevation: 5 }}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                </View>
            )}
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData() deve ser usado dentro de <DataProvider>.");
    return ctx;
}