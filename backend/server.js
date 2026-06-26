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
    password: 'teste123',
    port: 5432,
});

app.use(cors());
app.use(express.json());

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
        
        // Formata os dados para o formato que o App espera
        const formattedData = result.rows.map(row => ({
            id: row.id,
            leito: row.bed_number,
            status: row.status,
            paciente: row.patient_id ? {
                id: row.patient_id,
                nome: row.patient_name,
                diagnostico: row.patient_diagnosis,
                sexo: row.patient_gender,
                idade: row.patient_dob // No front você calcula a idade
            } : null
        }));
        
        res.json(formattedData);
    } catch (err) {
        console.error(err);
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
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. Admitir Paciente (POST)
app.post('/admitir', async (req, res) => {
    const { leitoId, nome, sexo, diagnostico, status } = req.body;
    try {
        // Inserir Paciente
        const pResult = await pool.query(
            'INSERT INTO Patients (name, gender, diagnosis) VALUES ($1, $2, $3) RETURNING id',
            [nome, sexo, diagnostico]
        );
        const pacienteId = pResult.rows[0].id;
        
        // Atualizar Leito
        await pool.query(
            'UPDATE Beds SET patient_id = $1, status = $2 WHERE id = $3',
            [pacienteId, status || 'estavel', leitoId]
        );
        
        res.send("Paciente admitido com sucesso");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4. Vagar Leito (PUT)
app.put('/vagar/:id', async (req, res) => {
    try {
        await pool.query('UPDATE Beds SET patient_id = NULL, status = $1 WHERE id = $2', ['vago', req.params.id]);
        res.send("Leito liberado");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 5. Remover Leito (DELETE)
app.delete('/leitos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Beds WHERE id = $1', [req.params.id]);
        res.send("Leito removido");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});