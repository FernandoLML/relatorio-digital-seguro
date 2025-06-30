// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// --- MUDANÇA 1: Importar o modelo de Utilizador ---
const User = require('./models/User'); 

// Importe todas as rotas
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const signatureRoutes = require('./routes/signatureRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares (sem alterações aqui)
app.use(helmet());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));


// --- MUDANÇA 2: Adicionar a função para criar os utilizadores ---
const createInitialUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Nenhum utilizador encontrado. A criar utilizadores iniciais...');
      await User.create([
        { name: 'Colaborador Teste', email: 'colaborador@test.com', password: '123456', role: 'colaborador' },
        { name: 'Gerente Teste', email: 'gerente@test.com', password: '123456', role: 'gerente' },
        { name: 'Diretor Teste', email: 'diretor@test.com', password: '123456', role: 'diretor' },
      ]);
      console.log('Utilizadores de teste criados com sucesso!');
    } else {
      console.log('A base de dados já contém utilizadores.');
    }
  } catch (error) {
    console.error('Erro ao criar utilizadores iniciais:', error);
    process.exit(1); // Sai da aplicação se não conseguir criar os utilizadores essenciais
  }
};


// Conexão ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('Conectado ao MongoDB');
    // --- MUDANÇA 3: Chamar a função DEPOIS da conexão ser bem-sucedida ---
    createInitialUsers();
})
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

mongoose.set('strictQuery', true);

// Rota de teste básica
app.get('/', (req, res) => {
  res.send('Backend de Gestão de Relatórios Online está a funcionar!');
});

// Uso das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/signatures', signatureRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo correu mal no servidor!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend a rodar na porta ${PORT}`);
});