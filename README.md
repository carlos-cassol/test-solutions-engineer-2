# 🎯 Test Radar - Control Tower

Sistema de monitoramento em tempo real para processos operacionais seguindo o framework RIDEC (Receive, Identify, Decide, Execute, Conclude).

## 🏗️ Arquitetura

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **IA**: OpenAI GPT-4 para insights preditivos
- **Containerização**: Docker + Docker Compose
- **Cache**: Redis (opcional)

## 🚀 Quick Start

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd test-solutions-engineer-2
```

### 2. Configure as variáveis de ambiente
```bash
# Backend
cp backend/env.example backend/.env
# Edite backend/.env com suas configurações
```

### 3. Execute com Docker
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Database**: localhost:5432

## 📋 Funcionalidades

### ✅ Backend (Implementado)
- [x] Sistema de webhooks para manutenção
- [x] Processamento RIDEC com estágios
- [x] Cálculo automático de SLA
- [x] Sistema de alertas (4 níveis)
- [x] Integração com OpenAI para insights
- [x] Logging completo de eventos
- [x] API REST documentada com Swagger

### ✅ Frontend (Implementado)
- [x] Dashboard principal com métricas
- [x] Lista de processos em tempo real
- [x] Visualização RIDEC com timeline
- [x] Painel de alertas
- [x] Detalhes do processo com insights de IA
- [x] Interface responsiva e moderna

## 🔧 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📡 API Endpoints

### Webhooks
- `POST /webhooks/maintenance` - Receber eventos de manutenção

### Processos
- `GET /processes` - Listar todos os processos
- `GET /processes/:id` - Detalhes do processo
- `GET /processes/:id/alerts` - Alertas do processo
- `GET /processes/:id/events` - Eventos do processo
- `POST /processes/test-webhook` - Testar webhook
- `GET /processes/test-sla/:processId` - Testar cenários de SLA

## 🎯 Framework RIDEC

Todos os processos seguem o padrão RIDEC:

1. **R**eceive - Recebimento inicial
2. **I**dentify - Identificação e análise
3. **D**ecide - Decisão e aprovação
4. **E**xecute - Execução da ação
5. **C**onclude - Conclusão e registro

## 🚨 Sistema de Alertas

- **Nível 1**: Recuperação (processo voltou ao normal)
- **Nível 2**: Inconsistência (estágios pulados)
- **Nível 3**: Risco (SLA > 80%)
- **Nível 4**: Vencido (SLA > 100%)

## 🤖 Integração com IA

O sistema utiliza OpenAI para:
- Análise preditiva de processos
- Detecção de anomalias
- Recomendações de otimização
- Cálculo de score de risco

## 📊 Exemplo de Webhook

```json
{
  "event": "maintenance.created",
  "data": {
    "processId": "123",
    "vehicleId": "ABC123",
    "maintenanceType": "preventive",
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

## 🧪 Testes

```bash
# Backend
cd backend
npm run test:all

# Frontend
cd frontend
npm test
```

## 📁 Estrutura do Projeto

```
test-solutions-engineer-2/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── processes/      # Lógica de processos
│   │   ├── webhooks/       # Endpoints de webhook
│   │   ├── AI/            # Integração com IA
│   │   ├── alerts/        # Sistema de alertas
│   │   └── event/         # Logging de eventos
│   ├── prisma/            # Schema do banco
│   └── Dockerfile
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   └── types/         # Tipos TypeScript
│   └── Dockerfile
├── docker-compose.yml      # Orquestração
└── README.md
```

## 🔒 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_radar
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

## 📈 Métricas e Monitoramento

O dashboard exibe:
- Total de processos
- Processos ativos
- Processos em risco
- Processos vencidos
- Alertas críticos
- Insights de IA

## 🚀 Deploy

O projeto está configurado para deploy com Docker:

```bash
# Build e deploy
docker-compose up -d --build

# Verificar status
docker-compose ps

# Logs em tempo real
docker-compose logs -f backend
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para o teste técnico da Billor.

---

**Test Radar** - Control Tower para monitoramento de processos operacionais 🎯 