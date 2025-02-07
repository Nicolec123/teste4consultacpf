const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configuração de CORS para permitir requisições de qualquer origem
app.use(cors(
    {
        origin: '*', // Permitir requisições de qualquer origem
        credentials: true, // Permitir que o token seja transmitido nas respostas
        allowedHeaders: ['Content-Type',], // Permitir os cabeçalhos 'Content-Type' e 'Authorization'
    }
));

// Para permitir apenas requisições de um domínio específico, descomente abaixo:
// app.use(cors({ origin: 'https://seusite.com' }));

// Middleware para parsing de JSON
app.use(express.json());

// Rota para autenticação
app.post('/autenticacao', async (req, res) => {
    console.log('Requisição recebida no proxy:', req.body); // Depuração
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api.jae.com.br/autenticacao', // URL da API externa
            headers: {
                'Content-Type': 'application/json',
            },
            data: req.body, // Passa os dados recebidos para a API externa
        });

        console.log('Resposta da API do joao:', response.data); // Depuração
        res.status(response.status).json(response.data); // Retorna a resposta da API externa
    } catch (error) {
        console.error('Erro ao redirecionar a requisição:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
        });
    }
});

// Rota de consulta de cadastro com JWT
app.post('/vt-gateway/cadastro/consulta', async (req, res) => {
  console.log("Dados recebidos do frontend:", req.body); // Exibe os dados enviados pelo frontend

  // Pega o header Authorization
  const authHeader = req.headers["authorization"];
  let authToken = authHeader;

  // Verifica se o JWT está presente no header
  console.log("Token do backend:", authToken); // Depuração
  if (!authToken) {
    return res.status(400).json({ error: "Requisição inválida. JWT ausente." });
  }

  try {
    // Reencaminha a requisição para a API externa com os dados do frontend
    const response = await axios.post('https://api.jae.com.br/vt-gateway/cadastro/consulta', req.body, {
      headers: {
        "Content-Type": "text/plain", 
        Authorization: authToken, 
      },
    });

    // Retorna a resposta da API externa para o frontend
    console.log("🔍 Resposta bruta da API externa:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error("Erro na requisição à API externa:", error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
});

// Inicia o servidor na porta 3000
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando na porta 3000 e acessível externamente');
});
