<template>
  <div class="tickets-page">
    <div class="page-header">
      <h2>📋 Заявки</h2>
      <router-link to="/tickets/new" class="btn btn-primary">➕ Новая заявка</router-link>
    </div>
    
    <div class="filters">
      <input 
        type="text" 
        v-model="filters.search"
        placeholder="🔍 Поиск по номеру, названию, контрагенту..."
        class="search-input"
      />
      
      <select v-model="filters.status" class="filter-select">
        <option value="">Все статусы</option>
        <option v-for="status in appStore.statuses" :key="status.id" :value="status.id">
          {{ status.name }}
        </option>
      </select>
      
      <select v-model="filters.type" class="filter-select">
        <option value="">Все типы</option>
        <option v-for="type in appStore.ticketTypes" :key="type.id" :value="type.id">
          {{ type.name }}
        </option>
      </select>
      
      <select v-model="filters.isClient" class="filter-select">
        <option value="">Все</option>
        <option :value="true">Клиентские</option>
        <option :value="false">Внутренние</option>
      </select>
    </div>
    
    <div class="tickets-table-container">
      <table class="tickets-table">
        <thead>
          <tr>
            <th>Номер</th>
            <th>Название</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Контрагент/Владелец</th>
            <th>Линия</th>
            <th>Создана</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="ticket in filteredTickets" 
            :key="ticket.id"
            @click="goToTicket(ticket.id)"
            class="ticket-row"
          >
            <td class="ticket-number">{{ ticket.number }}</td>
            <td class="ticket-title">{{ ticket.title }}</td>
            <td>
              <span class="badge badge-type">
                {{ appStore.getTypeById(ticket.type)?.name || ticket.type }}
              </span>
            </td>
            <td>
              <span 
                class="badge badge-status"
                :style="{ backgroundColor: appStore.getStatusById(ticket.status)?.color }"
              >
                {{ appStore.getStatusById(ticket.status)?.name || ticket.status }}
              </span>
            </td>
            <td>{{ ticket.isClient ? ticket.counterparty : (ticket.owner || '—') }}</td>
            <td>L{{ ticket.line }}</td>
            <td>{{ formatDate(ticket.createdAt) }}</td>
          </tr>
          <tr v-if="filteredTickets.length === 0">
            <td colspan="7" class="empty-state">
              Заявок не найдено
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useTicketStore } from '../stores/ticket'

const router = useRouter()
const appStore = useAppStore()
const ticketStore = useTicketStore()

const filters = ref({
  search: '',
  status: '',
  type: '',
  isClient: ''
})

onMounted(() => {
  appStore.initialize()
  ticketStore.initialize()
})

const filteredTickets = computed(() => {
  return ticketStore.getFilteredTickets({
    search: filters.value.search,
    status: filters.value.status,
    type: filters.value.type,
    isClient: filters.value.isClient !== '' ? filters.value.isClient === 'true' : undefined
  })
})

const goToTicket = (id) => {
  router.push(`/tickets/${id}`)
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.tickets-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  color: #2d3748;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.tickets-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tickets-table {
  width: 100%;
  border-collapse: collapse;
}

.tickets-table th {
  background: #f7fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.tickets-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.ticket-row {
  cursor: pointer;
  transition: background 0.2s;
}

.ticket-row:hover {
  background: #f7fafc;
}

.ticket-number {
  font-family: monospace;
  font-weight: 600;
  color: #667eea;
}

.ticket-title {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.badge-type {
  background: #4a5568;
}

.badge-status {
  transition: background 0.2s;
}

.empty-state {
  text-align: center;
  color: #a0aec0;
  padding: 3rem !important;
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
</style>
