<template>
  <div class="dashboard">
    <h2>📊 Дашборд</h2>
    
    <div class="stats-grid" v-if="stats">
      <div class="stat-card total">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Всего заявок</div>
      </div>
      
      <div class="stat-card client">
        <div class="stat-value">{{ stats.clientCount }}</div>
        <div class="stat-label">Клиентские</div>
      </div>
      
      <div class="stat-card internal">
        <div class="stat-value">{{ stats.internalCount }}</div>
        <div class="stat-label">Внутренние</div>
      </div>
      
      <div class="stat-card paused">
        <div class="stat-value">{{ stats.pausedCount }}</div>
        <div class="stat-label">На паузе</div>
      </div>
      
      <div class="stat-card other">
        <div class="stat-value">{{ stats.otherTypeCount }}</div>
        <div class="stat-label">Тип "Другое"</div>
      </div>
    </div>
    
    <div class="charts-section">
      <div class="chart-card">
        <h3>По статусам</h3>
        <div class="status-bars">
          <div 
            v-for="status in appStore.statuses" 
            :key="status.id"
            class="status-bar-row"
          >
            <span class="status-name" :style="{ color: status.color }">{{ status.name }}</span>
            <div class="status-bar-bg">
              <div 
                class="status-bar-fill"
                :style="{ 
                  width: getPercentage(stats.byStatus[status.id]) + '%',
                  backgroundColor: status.color
                }"
              ></div>
            </div>
            <span class="status-count">{{ stats.byStatus[status.id] || 0 }}</span>
          </div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>По типам</h3>
        <div class="type-list">
          <div 
            v-for="type in appStore.ticketTypes" 
            :key="type.id"
            class="type-item"
          >
            <span class="type-name">{{ type.name }}</span>
            <span class="type-count">{{ stats.byType[type.id] || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <router-link to="/tickets/new" class="btn btn-primary">
        ➕ Новая заявка
      </router-link>
      <router-link to="/tickets" class="btn btn-secondary">
        📋 Все заявки
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useTicketStore } from '../stores/ticket'

const appStore = useAppStore()
const ticketStore = useTicketStore()

onMounted(() => {
  appStore.initialize()
  ticketStore.initialize()
})

const stats = computed(() => ticketStore.getStats())

const getPercentage = (value) => {
  if (!stats.value.total) return 0
  return Math.round((value / stats.value.total) * 100)
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.dashboard h2 {
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4a5568;
}

.stat-label {
  color: #718096;
  margin-top: 0.5rem;
}

.stat-card.total .stat-value { color: #667eea; }
.stat-card.client .stat-value { color: #48bb78; }
.stat-card.internal .stat-value { color: #ed8936; }
.stat-card.paused .stat-value { color: #ecc94b; }
.stat-card.other .stat-value { color: #f56565; }

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-card h3 {
  margin-bottom: 1rem;
  color: #4a5568;
  font-size: 1.1rem;
}

.status-bar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.status-name {
  width: 140px;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-bar-bg {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.status-count {
  width: 40px;
  text-align: right;
  font-weight: 600;
  color: #4a5568;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 4px;
}

.type-name {
  color: #4a5568;
}

.type-count {
  font-weight: 600;
  color: #667eea;
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}
</style>
