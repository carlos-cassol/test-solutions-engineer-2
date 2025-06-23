# Test Radar - Process Monitoring & AI Insights System

## 1. System Overview

Test Radar is a comprehensive process monitoring system that tracks operational processes using the RIDEC model (Request, Identify, Decide, Execute, Complete). The system provides real-time monitoring, SLA tracking, AI-powered insights, and automated alerting for process optimization.

### Architecture
| Component           | Description                                    | Port  |
|---------------------|------------------------------------------------|-------|
| `backend`           | NestJS API with Prisma ORM                     | 3000  |
| `frontend`          | React TypeScript Dashboard                     | 3001  |

**Communication:** RESTful API between frontend and backend.

---

## 2. Backend Services

**Location:** `backend/`

### Core Services
- **ProcessesService**: Manages process lifecycle and RIDEC stage transitions
- **AlertsService**: Handles alert generation and management
- **AiService**: Provides AI-powered insights and predictions
- **WebhooksService**: Processes external system integrations
- **EventService**: Logs and tracks process events

### Features
- RIDEC process model implementation
- SLA monitoring and breach detection
- AI-powered risk assessment and predictions
- Real-time alerting system
- Webhook integration for external systems
- Comprehensive event logging
- Prisma ORM with PostgreSQL

---

## 3. Frontend Dashboard

**Location:** `frontend/`

### Components
- **Dashboard**: Overview of all processes and key metrics
- **ProcessDetails**: Detailed view of individual processes
- **AlertsPanel**: Real-time alert management
- **AIInsights**: AI-generated insights and recommendations
- **WebhookTester**: Test webhook integrations.

### Features
- Real-time process monitoring
- Interactive charts and visualizations
- Alert management interface
- AI insights display
- Webhook testing tools
- Responsive design

---

## 4. Database Schema

**Used:** PostgreSQL + Prisma ORM

### Core Tables
- `process` - Main process records
- `processStage` - RIDEC stage tracking
- `alerts` - Alert management
- `processEvent` - Event logging
- `aiInsight` - AI-generated insights

### Connection
Defined in `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```
---

## 5. Environment Configuration

Only backend requires a `.env` file at its root for configuration.

### `backend/.env`
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# OpenAI API Key (for AI insights)
OPENAI_API_KEY="your_openai_api_key"
```

### Folder Structure
```
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── ...
└── README.md
```

---

## 6. Setup Instructions

```bash
# Clone the repository
git clone https://github.com/carlos-cassol/test-solutions-engineer-2.git
cd test-solutions-engineer-2

# Using docker {
    #Build and start
    docker-compose up --build -d
}

#Without docker{
    # Backend Setup
    cd backend
    npm install
    npx prisma migrate dev
    npm run start

    # Frontend Setup (in a new terminal)
    cd ../frontend
    npm install
    npm start
}
```
### Access http://localhost:3001 to open the frontend app
### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key (for AI features)

---

## 7. Run Tests
 - Access backend folder and execute in terminal:
 ```bash
    npm test
```

## 8. API Endpoints

### Processes
- `GET /processes` - Get all processes
- `GET /processes/:id` - Get process by ID
- `POST /processes/test-webhook` - Test webhook processing
- `GET /processes/:id/alerts` - Get process alerts
- `GET /processes/:id/events` - Get process events

### Webhooks
- `POST /webhooks/maintenance` - Process maintenance webhooks
- `POST /webhooks/financial` - Process financial webhooks
- `POST /webhooks/supply` - Process supply webhooks

### Try out the swagger
* Make sure that the backend is running!
- http://localhost:3000/api
---

## Request example

```json
{
  "event": "maintenance.created", (maintenance.created' | 'maintenance.identified' | 'maintenance.approved' | 'maintenance.completed)
  "data": {
    "processId": "fd3be649-afbc-4abe-8507-572baaa83dc0", (Or empty. If not found, create new process)
    "vehicleId": "VEH001",
    "maintenanceType": "preventive", ('preventive' | 'corrective' | 'emergency')
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {
      "priority": "high",
      "location": "garage_a",
      "hello": "world"
    }
  }
}
```

## 9. Process Lifecycle (RIDEC Model)

### Stages
1. **R (Request)**: Process initiation and request handling
2. **I (Identify)**: Problem identification and analysis
3. **D (Decide)**: Decision making and approval
4. **E (Execute)**: Implementation and execution
5. **C (Complete)**: Completion and closure

### SLA Monitoring
- Each stage has SLA time limits
- Automatic breach detection and alerting
- Risk score calculation based on SLA compliance
- AI-powered completion time predictions

---

## 10. AI Integration

### Features
- **Risk Assessment**: Calculates process risk scores
- **Completion Prediction**: Predicts process completion times
- **Anomaly Detection**: Identifies unusual process patterns
- **Recommendations**: Provides optimization suggestions

### Configuration
AI insights require OpenAI API key configuration in `backend/.env`:
```env
OPENAI_API_KEY="your_openai_api_key"
```
---

## 11. Future Enhancements

### Planned Features
- Implement other 2 kinds of hooks
- Advanced analytics dashboard
- Implement websocket for live updates
- Machine learning model training
- Integration with external monitoring tools
- Export to excel (Being able to configure the file online and export it later)
