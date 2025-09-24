const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Teste OK'));

app.listen(8080, () => {
  console.log('Servidor teste rodando na porta 8080');
});