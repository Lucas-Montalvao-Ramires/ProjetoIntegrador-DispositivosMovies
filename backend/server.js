const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fisio_hospital',
    password: 'teste123', // Senha fornecida pelo usuário
    port: 5432,
});

app.use(cors());
app.use(express.json());

// --- LOG DE REQUISIÇÕES ---
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// --- ENDPOINTS ---

// 1. Listar Leitos com Pacientes (GET)
app.get('/leitos', async (req, res) => {
    try {
        const query = `
            SELECT b.*, 
                   p.name as patient_name, p.diagnosis as patient_diagnosis, 
                   p.gender as patient_gender, p.date_of_birth as patient_dob
            FROM Beds b
            LEFT JOIN Patients p ON b.patient_id = p.id
            ORDER BY b.bed_number ASC
        `;
        const result = await pool.query(query);
        
        const formattedData = result.rows.map(row => ({
            id: row.id,
            leito: row.bed_number,
            status: row.status,
            paciente: row.patient_id ? {
                id: row.patient_id,
                nome: row.patient_name,
                diagnostico: row.patient_diagnosis,
                sexo: row.patient_gender,
                idade: row.patient_dob
            } : null
        }));
        
        res.json(formattedData);
    } catch (err) {
        console.error("Erro no GET /leitos:", err);
        res.status(500).send("Erro no servidor");
    }
});

// 2. Criar Leito (POST)
app.post('/leitos', async (req, res) => {
    const { numero } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Beds (bed_number, status) VALUES ($1, $2) RETURNING *',
            [numero, 'vago']
        );
        console.log(`Leito ${numero} criado com sucesso.`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erro no POST /leitos:", err);
        res.status(500).send(err.message);
    }
});

// 3. Admitir Paciente (POST)
app.post('/admitir', async (req, res) => {
    const { leitoId, nome, sexo, diagnostico, status } = req.body;
    try {
        const pResult = await pool.query(
            'INSERT INTO Patients (name, gender, diagnosis) VALUES ($1, $2, $3) RETURNING id',
            [nome, sexo, diagnostico]
        );
        const pacienteId = pResult.rows[0].id;
        
        await pool.query(
            'UPDATE Beds SET patient_id = $1, status = $2 WHERE id = $3',
            [pacienteId, status || 'estavel', leitoId]
        );
        
        console.log(`Paciente ${nome} admitido no leito ID ${leitoId}.`);
        res.send("Paciente admitido com sucesso");
    } catch (err) {
        console.error("Erro no POST /admitir:", err);
        res.status(500).send(err.message);
    }
});

// 4. Vagar Leito (PUT)
app.put('/vagar/:id', async (req, res) => {
    try {
        await pool.query('UPDATE Beds SET patient_id = NULL, status = $1 WHERE id = $2', ['vago', req.params.id]);
        console.log(`Leito ID ${req.params.id} liberado.`);
        res.send("Leito liberado");
    } catch (err) {
        console.error("Erro no PUT /vagar:", err);
        res.status(500).send(err.message);
    }
});

// 5. Editar Paciente (PUT) - NOVO
app.put('/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, diagnostico } = req.body;
    try {
        await pool.query(
            'UPDATE Patients SET name = $1, diagnosis = $2 WHERE id = $3',
            [nome, diagnostico, id]
        );
        console.log(`Dados do paciente ID ${id} atualizados.`);
        res.send("Paciente atualizado com sucesso");
    } catch (err) {
        console.error("Erro no PUT /pacientes:", err);
        res.status(500).send(err.message);
    }
});

// 6. Remover Leito (DELETE)
app.delete('/leitos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Primeiro, desvinculamos o paciente do leito
        await pool.query('UPDATE Beds SET patient_id = NULL WHERE id = $1', [id]);
        
        // 2. Apagamos o leito
        const result = await pool.query('DELETE FROM Beds WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            console.log(`Tentativa de apagar leito ID ${id}, mas não foi encontrado.`);
            return res.status(404).send("Leito não encontrado");
        }
        
        console.log(`Leito ID ${id} removido com sucesso.`);
        res.send("Leito removido");
    } catch (err) {
        console.error("Erro no DELETE /leitos:", err);
        res.status(500).send("Erro ao remover leito: " + err.message);
    }
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});