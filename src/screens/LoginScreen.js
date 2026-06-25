import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Para o teclado não cobrir os campos no iOS/Android */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* LOGO E HEADER */}
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="pulse" size={40} color="white" />
          </View>
          <Text style={styles.brandName}>FisioHospital</Text>
          <Text style={styles.brandSubtitle}>
            Sistema de Gestão de Fisioterapia
          </Text>
        </View>

        {/* CARD DE LOGIN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesso de Fisioterapeuta</Text>

          {/* Campo Usuário */}
          <Text style={styles.label}>Usuário</Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#999" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu usuário"
              placeholderTextColor="#999"
            />
          </View>

          {/* Campo Senha */}
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#999" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry // Esconde a senha
            />
          </View>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Dashboard")} // Comando para mudar de tela
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Esqueci a Senha */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Emergência • UTI • Enfermaria</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eff8fb", // Cor de fundo
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoIcon: {
    backgroundColor: "#00a88e",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#051d3b", // Azul escuro
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#6e85a0",
  },
  card: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 20,
    padding: 25,
    // Sombra para Android
    elevation: 5,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#051d3b",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#051d3b",
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dce4ec",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
  },
  button: {
    backgroundColor: "#00a88e",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    textAlign: "center",
    color: "#00a88e",
    marginTop: 20,
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
  },
  footerText: {
    color: "#6e85a0",
    fontSize: 12,
    letterSpacing: 1,
  },
});
