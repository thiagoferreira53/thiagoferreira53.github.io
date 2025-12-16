# Armazenamento de Dados de Usuários

## Onde os dados são salvos?

Os dados dos usuários criados através do formulário de registro são salvos **localmente no navegador** usando **localStorage**.

### O que é localStorage?

LocalStorage é uma tecnologia de armazenamento web que permite que sites armazenem dados no navegador do usuário. Os dados persistem mesmo após fechar o navegador.

### Localização dos Dados

Os dados ficam salvos em:
```
localStorage do navegador → chave: "registeredUsers"
```

### Como visualizar os dados salvos?

1. Abra o Console do Desenvolvedor (F12 ou Cmd+Option+I)
2. Vá para a aba **Application** (Chrome) ou **Storage** (Firefox)
3. No menu lateral, expanda **Local Storage**
4. Clique no domínio do site (ex: `http://localhost:8000`)
5. Procure pela chave `registeredUsers`

### Estrutura dos Dados

Os dados são salvos em formato JSON:

```json
{
  "username1": {
    "password": "senha123",
    "fullName": "João Silva",
    "email": "joao@email.com",
    "usage": "professional",
    "education": "master",
    "field": "Arquitetura",
    "registeredAt": "2025-12-16T10:30:00.000Z"
  },
  "username2": {
    "password": "outrasenha",
    "fullName": "Maria Santos",
    "email": "maria@email.com",
    "usage": "academic",
    "education": "phd",
    "field": "Engenharia Civil",
    "registeredAt": "2025-12-16T11:45:00.000Z"
  }
}
```

### Campos Armazenados

Para cada usuário, são salvos os seguintes campos:
- **username**: Nome de usuário escolhido
- **password**: Senha (⚠️ em texto plano - não recomendado para produção)
- **fullName**: Nome completo
- **email**: Endereço de e-mail
- **usage**: Finalidade de uso (academic, professional, education, personal, other)
- **education**: Nível de formação (undergraduate, graduate, bachelor, master, phd, other)
- **field**: Área de formação/trabalho
- **registeredAt**: Data e hora do registro

### Validações Implementadas

1. **Username único**: Não permite criar dois usuários com o mesmo username
2. **Email único**: Não permite cadastrar o mesmo email duas vezes
3. **Confirmação de senha**: Valida se as senhas digitadas são iguais
4. **Username válido**: Apenas letras, números e underscores (mínimo 3 caracteres)
5. **Senha segura**: Mínimo de 6 caracteres

### Limitações do Armazenamento Local

⚠️ **IMPORTANTE**: Esta é uma solução para desenvolvimento/demonstração. Para um sistema em produção:

1. **Segurança**: 
   - As senhas estão em texto plano (não criptografadas)
   - Qualquer pessoa com acesso ao navegador pode ver os dados
   
2. **Persistência**:
   - Os dados são específicos do navegador/dispositivo
   - Limpar os dados do navegador apaga todos os registros
   - Não há sincronização entre dispositivos

3. **Capacidade**:
   - localStorage tem limite de ~5-10MB dependendo do navegador

### Para Produção

Em um ambiente de produção, você deveria:

1. **Backend/Servidor**: Armazenar dados em um banco de dados (PostgreSQL, MongoDB, etc.)
2. **Criptografia**: Usar hash para senhas (bcrypt, argon2)
3. **Autenticação**: Implementar JWT ou sessions
4. **HTTPS**: Sempre usar conexões seguras
5. **Validação**: Validação server-side adicional
6. **GDPR/LGPD**: Conformidade com leis de proteção de dados

### Como apagar todos os usuários registrados?

No Console do Desenvolvedor, execute:
```javascript
localStorage.removeItem('registeredUsers');
```

Ou para limpar todos os dados:
```javascript
localStorage.clear();
```

### Como exportar os dados?

No Console do Desenvolvedor:
```javascript
console.log(localStorage.getItem('registeredUsers'));
// ou
copy(localStorage.getItem('registeredUsers')); // copia para área de transferência
```
