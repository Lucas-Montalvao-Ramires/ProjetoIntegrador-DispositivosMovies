-- ============================================================================
-- SCHEMA FINAL CONSOLIDADO - PROJETO INTEGRADOR DISPOSITIVOS MÓVEIS
-- ============================================================================

-- 1. Criação da tabela de Usuários
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- 2. Criação da tabela de Pacientes
CREATE TABLE Patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    diagnosis VARCHAR(255), -- Novo campo adicionado para o diagnóstico
    contact_info VARCHAR(255),
    medical_history TEXT
);

-- 3. Criação da tabela de Leitos
CREATE TABLE Beds (
    id SERIAL PRIMARY KEY,
    bed_number VARCHAR(10) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'critico', 'estavel', 'observacao', 'vago'
    patient_id INTEGER REFERENCES Patients(id) ON DELETE SET NULL
);

-- 4. Criação da tabela de Avaliações de Pacientes (Qualitativa)
CREATE TABLE Patient_Evaluations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES Patients(id) ON DELETE CASCADE,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consciencia VARCHAR(50),
    ventilacao VARCHAR(50),
    oxigenio VARCHAR(50),
    secrecao VARCHAR(50),
    notes TEXT
);

-- 5. Criação da tabela de Monitoramento de Pacientes (Parâmetros Reais)
CREATE TABLE Patient_Monitorings (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES Patients(id) ON DELETE CASCADE,
    monitoring_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vitals JSONB, -- Ex: {"fc": 80, "sato2": 98, "pa": "120/80", "fr": 18, "temp": 36.5}
    sedation JSONB, -- Ex: {"uses": true, "drugs": ["Fentanil", "Midazolam"]}
    vasoactive_drugs JSONB, -- Ex: {"uses": false, "drugs": []}
    gasometry JSONB, -- Ex: {"fio2": 0.5, "ph": 7.35, "paco2": 40, "pao2": 80, "hco3": 24, "be": 0, "sao2": 95, "pf": 160, "lactate": 2.1}
    respiratory_assessment_vm JSONB -- Ex: {"uses_vm": true, "mode": "PCV", "peep": 5, "fio2": 0.5}
);

-- ============================================================================
-- INSERÇÃO DE DADOS INICIAIS (OPCIONAL)
-- ============================================================================

INSERT INTO Users (username, password, role) VALUES
('fisioterapeuta1', 'senha_hash_aqui', 'Fisioterapeuta'),
('admin', 'senha_admin_hash', 'Administrador');

INSERT INTO Patients (name, date_of_birth, gender, diagnosis, contact_info, medical_history) VALUES
('João Silva', '1980-01-15', 'Masculino', 'DPOC agudizada', 'joao.silva@email.com', 'Histórico médico de João Silva'),
('Maria Santos', '1992-05-20', 'Feminino', 'Pneumonia', 'maria.santos@email.com', 'Histórico médico de Maria Santos');

INSERT INTO Beds (bed_number, status, patient_id) VALUES
('L01', 'critico', 1),
('L02', 'estavel', 2),
('L03', 'vago', NULL),
('L04', 'vago', NULL);

INSERT INTO Patient_Evaluations (patient_id, consciencia, ventilacao, oxigenio, secrecao, notes) VALUES
(1, 'Alerta', 'Espontânea', 'Ar ambiente', 'Ausente', 'Primeira avaliação do paciente João Silva');

INSERT INTO Patient_Monitorings (patient_id, vitals, sedation, vasoactive_drugs, gasometry, respiratory_assessment_vm) VALUES
(1, '{"fc": 80, "sato2": 98, "pa": "120/80", "fr": 18, "temp": 36.5}', '{"uses": false, "drugs": []}', '{"uses": false, "drugs": []}', '{"fio2": 0.21, "ph": 7.4, "paco2": 40, "pao2": 95, "hco3": 24, "be": 0, "sao2": 98, "pf": 450, "lactate": 1.0}', '{"uses_vm": false}');
