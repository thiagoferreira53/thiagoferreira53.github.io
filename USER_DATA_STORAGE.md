# Armazenamento de Dados de Usuários

## Onde os dados são salvos?

Os dados dos usuários criados através do formulário de registro são salvos **localmente no navegador** usando **localStorage**.

### O que é localStorage?

LocalStorage é uma tecnologia de armazenamento web que permite que sites armazenem dados no navegador do usuário. Os dados persistem mesmo após fechar o navegador.

### Localização dos Dados

Os dados ficam salvos em:
```
localStorage do navegador → chave: "e3build_registeredUsers"
```

### Como visualizar os dados salvos?

1. Abra o Console do Desenvolvedor (F12 ou Cmd+Option+I)
2. Vá para a aba **Application** (Chrome) ou **Storage** (Firefox)
3. No menu lateral, expanda **Local Storage**
4. Clique no domínio do site (ex: `http://localhost:8000`)
5. Procure pela chave `e3build_registeredUsers`

### Estrutura dos Dados

Os dados são salvos em formato JSON, em uma lista de usuários:

```json
[
  {
    "username": "joao@email.com",
    "password": "senha123",
    "fullName": "João Silva",
    "email": "joao@email.com",
    "institution": "UFRGS",
    "field": "Arquitetura",
    "source": "professor",
    "newsletter": true,
    "terms": true,
    "registeredAt": "2026-08-06T10:30:00.000Z"
  }
]
```

### Campos Armazenados

Para cada usuário, são salvos os seguintes campos:
- **username**: identificador de acesso (é o próprio e-mail, em minúsculas)
- **password**: Senha (⚠️ em texto plano - não recomendado para produção)
- **fullName**: Nome
- **email**: Endereço de e-mail (usado para fazer login)
- **institution**: Instituição (universidade, escritório, empresa)
- **field**: Ramo de atuação
- **source**: Como ficou sabendo do BE³ Build (professor, colleague, social, event, publication, search, other)
- **newsletter**: Se aceitou receber novidades (true/false)
- **terms**: Aceite dos termos da plataforma (obrigatório para concluir o cadastro)
- **registeredAt**: Data e hora do registro

### Validações Implementadas

1. **E-mail único**: Não permite cadastrar o mesmo e-mail duas vezes (comparação sem diferenciar maiúsculas/minúsculas)
2. **Confirmação de senha**: Valida se as senhas digitadas são iguais
3. **Senha mínima**: Mínimo de 6 caracteres
4. **Termos da plataforma**: O cadastro só é concluído com o aceite marcado
5. **Campos obrigatórios**: Nome, e-mail, instituição, ramo de atuação e origem da indicação

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
localStorage.removeItem('e3build_registeredUsers');
```

Ou para limpar todos os dados:
```javascript
localStorage.clear();
```

### Como exportar os dados?

No Console do Desenvolvedor:
```javascript
console.log(localStorage.getItem('e3build_registeredUsers'));
// ou
copy(localStorage.getItem('e3build_registeredUsers')); // copia para área de transferência
```
