import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Справочник типов обращений
const DEFAULT_TICKET_TYPES = [
  { id: 'incident', name: 'Инцидент', description: 'Сбой в работе сервиса', requiresComment: false },
  { id: 'service_request', name: 'Запрос на обслуживание', description: 'Стандартный запрос', requiresComment: false },
  { id: 'paid_work', name: 'Платная работа', description: 'Оплачиваемая услуга', requiresComment: false },
  { id: 'internal_task', name: 'Внутренняя задача', description: 'Задача для команды', requiresComment: false },
  { id: 'other', name: 'Другое', description: 'Прочее', requiresComment: true }
]

// Статусы заявок
const TICKET_STATUSES = [
  { id: 'new', name: 'Новая', color: '#4299e1' },
  { id: 'in_progress', name: 'В работе', color: '#ecc94b' },
  { id: 'waiting_client', name: 'Ожидание клиента', color: '#ed8936', isPause: true },
  { id: 'waiting_partner', name: 'Ожидание смежника', color: '#ed8936', isPause: true },
  { id: 'resolved', name: 'Решена', color: '#48bb78' },
  { id: 'closed', name: 'Закрыта', color: '#718096' }
]

// Каналы решения
const RESOLUTION_CHANNELS = [
  { id: 'remote', name: 'Удалённо' },
  { id: 'phone', name: 'Телефон' },
  { id: 'chat', name: 'Переписка' },
  { id: 'onsite', name: 'Выезд' }
]

// Роли пользователей
const USER_ROLES = [
  { id: 'operator', name: 'Оператор' },
  { id: 'engineer', name: 'Инженер' },
  { id: 'lead', name: 'Лид' },
  { id: 'auditor', name: 'Аудитор' },
  { id: 'admin', name: 'Администратор' }
]

export const useAppStore = defineStore('app', () => {
  // Инициализация данных
  const ticketTypes = ref([])
  const statuses = ref([...TICKET_STATUSES])
  const resolutionChannels = ref([...RESOLUTION_CHANNELS])
  const userRoles = ref([...USER_ROLES])
  
  // Загрузка из localStorage или использование значений по умолчанию
  const initialize = () => {
    const storedTypes = localStorage.getItem('helpdesk_ticket_types')
    if (storedTypes) {
      ticketTypes.value = JSON.parse(storedTypes)
    } else {
      ticketTypes.value = [...DEFAULT_TICKET_TYPES]
      saveTicketTypes()
    }
  }
  
  const saveTicketTypes = () => {
    localStorage.setItem('helpdesk_ticket_types', JSON.stringify(ticketTypes.value))
  }
  
  // Вычисляемые свойства
  const pauseStatuses = computed(() => 
    statuses.value.filter(s => s.isPause).map(s => s.id)
  )
  
  const getStatusById = (id) => {
    return statuses.value.find(s => s.id === id)
  }
  
  const getTypeById = (id) => {
    return ticketTypes.value.find(t => t.id === id)
  }
  
  const getChannelById = (id) => {
    return resolutionChannels.value.find(c => c.id === id)
  }
  
  return {
    ticketTypes,
    statuses,
    resolutionChannels,
    userRoles,
    pauseStatuses,
    initialize,
    saveTicketTypes,
    getStatusById,
    getTypeById,
    getChannelById
  }
})
