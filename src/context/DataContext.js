import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import axios from "axios";

const API_URL = "http://SUA_IP_LOCAL:3000"; // Use o IP da sua máquina, não localhost no mobile

const DataContext = createContext(null);

export const STATUS = {
    CRITICO: "critico",
    ESTAVEL: "estavel",
    OBSERVACAO: "observacao",
    VAGO: "vago",
};

export function DataProvider({ children }) {
    const [leitos, setLeitos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeitos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/leitos`);
            setLeitos(response.data);
        } catch (error) {
            Alert.alert("Erro de Conexão", "Não foi possível carregar os dados da API.");
            console.error(error);
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
            Alert.alert("Erro", "Falha ao adicionar leito.");
        } finally {
            setLoading(false);
        }
    }, [fetchLeitos]);

    const removeLeito = useCallback(async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/leitos/${id}`);
            await fetchLeitos();
        } catch (error) {
            Alert.alert("Erro", "Falha ao remover leito.");
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
            Alert.alert("Erro", "Falha ao admitir paciente.");
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
            Alert.alert("Erro", "Falha ao liberar leito.");
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
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 999 }}>
                    <ActivityIndicator size="large" color="#0000ff" />
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