# Sistema de Estados e Alertas - Test Radar

## Visão Geral

O sistema de estados do Test Radar segue a especificação do teste, implementando um controle automático de status baseado no consumo do SLA (Service Level Agreement) de cada estágio do processo RIDEC.

## Estados do Processo

### 1. **ACTIVE** (Padrão)

- **Condição**: SLA ≤ 80%
- **Descrição**: Processo funcionando normalmente dentro dos parâmetros aceitáveis
- **Ação**: Nenhum alerta gerado

### 2. **AT_RISK** (Em Risco)

- **Condição**: SLA > 80% e ≤ 100%
- **Descrição**: Processo está consumindo muito tempo, mas ainda dentro do limite
- **Ação**:
  - Status automaticamente alterado para `AT_RISK`
  - Alerta de nível 3 gerado
  - Evento `status.changed` registrado

### 3. **OVERDUE** (Vencido)

- **Condição**: SLA > 100%
- **Descrição**: Processo ultrapassou o tempo limite definido
- **Ação**:
  - Status automaticamente alterado para `OVERDUE`
  - Alerta de nível 4 gerado (vencido)
  - Evento `status.changed` registrado

### 4. **COMPLETED** (Concluído)

- **Condição**: Processo chegou ao estágio final (C)
- **Descrição**: Processo finalizado com sucesso
- **Ação**: Status manual alterado para `COMPLETED`

## Recuperação Automática

O sistema implementa **recuperação automática**:

- Se um processo estava em `AT_RISK` ou `OVERDUE` e o SLA volta para ≤ 80%
- Status automaticamente retorna para `ACTIVE`
- Alerta de nível 1 gerado informando a recuperação
- Evento `status.changed` registrado

## Níveis de Alerta

| Nível | Descrição      | Quando Gerado                                |
| ----- | -------------- | -------------------------------------------- |
| 1     | Recuperação    | Processo recuperou de estado crítico         |
| 2     | Inconsistência | Processo com estágios pulados/inconsistentes |
| 3     | Risco          | Processo em risco (SLA > 80%)                |
| 4     | Vencido        | Processo vencido (SLA > 100%)                |

## Exemplo de Fluxo

```
1. Processo criado → Status: ACTIVE
2. SLA atinge 85% → Status: AT_RISK + Alerta nível 3
3. SLA atinge 110% → Status: OVERDUE + Alerta nível 4
4. SLA volta para 75% → Status: ACTIVE + Alerta nível 1 (recuperação)
5. Estágio pulado → Alerta nível 2 (inconsistência)
```

## Endpoints de Teste

### 1. Criar Processo via Webhook

```bash
POST /processes/test-webhook
{
  "event": "maintenance.created",
  "data": {
    "processId": "123",
    "vehicleId": "ABC123",
    "maintenanceType": "preventive",
    "timestamp": "2024-01-01T10:00:00Z"
}

```

### 2. Testar Cenários de SLA

```bash
# Testar processo em risco (85% do SLA)
GET /processes/{processId}/test-sla?slaPercentage=85

# Testar processo vencido (110% do SLA)
GET /processes/{processId}/test-sla?slaPercentage=110

# Testar recuperação (75% do SLA)
GET /processes/{processId}/test-sla?slaPercentage=75
```

### 3. Consultar Alertas

```bash
GET /processes/{processId}/alerts
```

### 4. Consultar Eventos

```bash
GET /processes/{processId}/events
```

## Configuração de SLA

Os SLAs são definidos em `src/processes/constants/processes.constants.ts`:

```typescript
export const SLA_CONFIG = {
	MAINTENANCE: {
		R: 3600, // 1 hora
		I: 7200, // 2 horas
		D: 3600, // 1 hora
		E: 14400, // 4 horas
		C: 1800, // 30 minutos
	},
};
```

## Monitoramento em Tempo Real

O sistema calcula o SLA automaticamente:

- A cada webhook recebido
- Baseado no `startTime` do estágio atual
- Comparado com o SLA configurado para o estágio
- Status atualizado automaticamente

## Integração com IA

O sistema está preparado para integração com IA:

- `predictedCompletionTime`: Tempo previsto de conclusão
- `riskScore`: Pontuação de risco calculada pela IA
- `AIInsight`: Insights gerados pela IA sobre o processo

---

_Documentação criada em: 2024-01-01_
_Última atualização: 2024-01-01_
