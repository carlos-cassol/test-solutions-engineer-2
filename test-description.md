# BILLOR Test - Technical Brief for Developers

## Project Overview

**Test Radar** is a real-time monitoring system for operational processes in a logistics/transportation company. The goal is to create a "Control Tower" that tracks all company processes through webhooks and intelligent alerts.

## Technical Architecture

### Preferred Stack (Google/Open Source)
- **Backend**: NestJs
- **Database**: PostgreSQL + Redis (a plus)
- **Frontend**: Your Choice
- **Infrastructure**: Docker

### Core Components
1. **Webhook Ingestion Engine** - Receives events from external systems  
2. **RIDEC Processor** - Maps events to process stages (R→I→D→E→C)  
3. **SLA Monitor** - Controls deadlines and calculates metrics  
4. **Alert Engine** - Intelligent notification system with AI predictions  
5. **Real-time Dashboard** - Web interface with charts and metrics  
6. **AI Assistant** - Smart recommendations and anomaly detection  

## RIDEC Framework

All processes follow the **RIDEC** pattern:
- **R**eceive: Initial input/request  
- **I**dentify: Analysis and diagnosis  
- **D**ecide: Approval/direction  
- **E**xecute: Action implementation  
- **C**onclude: Closure and registration  

Each stage has specific SLA and generates alerts when approaching deadline.

## AI Integration Opportunities

### 1. **Predictive Analytics**
- Predict SLA violations before they happen  
- Identify bottleneck patterns  
- Forecast resource needs  

### 2. **Intelligent Alerting**
- Smart alert prioritization (reduce noise)  
- Context-aware notifications  
- Auto-escalation optimization  

### 3. **Process Optimization**
- Suggest process improvements  
- Detect anomalies in workflows  
- Resource allocation recommendations  

---

## TECHNICAL CHALLENGE SPECIFICATION

### **Challenge Objective**
Create a **simplified MVP** of Test Radar demonstrating core concepts with NestJs, process and AI integration.

---

## **Part 1: Backend (Webhook + Processing + AI)**

### Core API Requirements:
1. **Webhook Endpoint** (`POST /webhooks/maintenance`)  
   - Receive simulated maintenance events  
   - Validate payload structure  
   - Process events through RIDEC pipeline  

2. **RIDEC Engine**  
   - Map events to stages (R→I→D→E→C)  
   - Control SLA for each stage  
   - Calculate time consumption percentage  

3. **Alert System with AI**  
   - Generate alerts when SLA > 80%  
   - **AI Feature**: Predict potential delays
   - Auto-escalation when SLA > 100%  
   - Structured logging of all events  

4. **AI Integration** (Choose ONE):  
   - **Option A**: Simple anomaly detection  
   - **Option B**: Basic prediction model  
   - **Option C**: Smart alert scoring  

---

##**Part 2: Frontend (Dashboard + AI Insights)**

### Dashboard Requirements:
1. **Main Dashboard**
   - List active processes  
   - Visual status (traffic light)  
   - Basic metrics  
   - **AI Insight Panel**  

2. **Process Visualization**
   - RIDEC timeline  
   - Elapsed time vs SLA  
   - Event history  
   - **AI Feature**: Predicted completion time  

3. **Alerts & AI**
   - Active alerts list  
   - Real-time notifications  
   - **AI Priority Score**  

---

## **Suggested Data Structure**

```typescript
interface Process {
  id: string;
  title: string;
  type: 'maintenance' | 'financial' | 'supply';
  vehicleId?: string;
  currentStage: 'R' | 'I' | 'D' | 'E' | 'C';
  status: 'active' | 'completed' | 'overdue' | 'at_risk';
  createdAt: Date;
  predictedCompletionTime?: Date;
  riskScore?: number;
  stages: {
    R: { startTime?: Date; endTime?: Date; sla: number; };
    I: { startTime?: Date; endTime?: Date; sla: number; };
    D: { startTime?: Date; endTime?: Date; sla: number; };
    E: { startTime?: Date; endTime?: Date; sla: number; };
    C: { startTime?: Date; endTime?: Date; sla: number; };
  };
}

interface AIInsight {
  type: 'prediction' | 'anomaly' | 'recommendation';
  confidence: number;
  message: string;
  processId: string;
  timestamp: Date;
}

interface MaintenanceWebhook {
  event: 'maintenance.created' | 'maintenance.identified' | 'maintenance.approved' | 'maintenance.completed';
  data: {
    processId: string;
    vehicleId: string;
    type: 'preventive' | 'corrective' | 'emergency';
    timestamp: string;
    metadata?: any;
  };
}
