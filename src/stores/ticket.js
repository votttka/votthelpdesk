import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTicketStore = defineStore('tickets', () => {
  // Состояние
  const tickets = ref([])
  const auditLogs = ref([])
  
  // Инициализация
  const initialize = () => {
    const storedTickets = localStorage.getItem('helpdesk_tickets')
    const storedLogs = localStorage.getItem('helpdesk_audit_logs')
    
    if (storedTickets) {
      tickets.value = JSON.parse(storedTickets)
    }
    if (storedLogs) {
      auditLogs.value = JSON.parse(storedLogs)
    }
  }
  
  const persist = () => {
    localStorage.setItem('helpdesk_tickets', JSON.stringify(tickets.value))
    localStorage.setItem('helpdesk_audit_logs', JSON.stringify(auditLogs.value))
  }
  
  // Генерация номера заявки
  const generateTicketNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const num = String(tickets.value.length + 1).padStart(5, '0')
    return `HD-${year}${month}-${num}`
  }
  
  // Аудит-лог
  const logEvent = (ticketId, eventType, details = {}, userId = 'system', userName = 'Система') => {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      eventType,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      details
    }
    auditLogs.value.push(entry)
    persist()
    return entry
  }
  
  // Создание заявки
  const createTicket = (data, userId = 'user', userName = 'Пользователь') => {
    const ticket = {
      id: `ticket_${Date.now()}`,
      number: generateTicketNumber(),
      type: data.type,
      typeComment: data.typeComment || '',
      title: data.title,
      description: data.description,
      isClient: data.isClient,
      counterparty: data.counterparty || '',
      owner: data.owner || '',
      status: 'new',
      assignee: null,
      line: 1,
      resolutionChannel: null,
      pauseReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null
    }
    
    tickets.value.push(ticket)
    logEvent(ticket.id, 'ticket_created', { 
      title: ticket.title, 
      type: ticket.type,
      isClient: ticket.isClient 
    }, userId, userName)
    persist()
    
    return ticket
  }
  
  // Обновление статуса
  const updateStatus = (ticketId, newStatus, pauseReason = null, userId = 'user', userName = 'Пользователь') => {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (!ticket) return null
    
    const oldStatus = ticket.status
    ticket.status = newStatus
    ticket.updatedAt = new Date().toISOString()
    ticket.pauseReason = pauseReason
    
    if (newStatus === 'resolved' || newStatus === 'closed') {
      ticket.closedAt = new Date().toISOString()
    }
    
    logEvent(ticketId, 'status_changed', {
      from: oldStatus,
      to: newStatus,
      pauseReason
    }, userId, userName)
    
    persist()
    return ticket
  }
  
  // Установка канала решения
  const setResolutionChannel = (ticketId, channelId, userId = 'user', userName = 'Пользователь') => {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (!ticket) return null
    
    ticket.resolutionChannel = channelId
    ticket.updatedAt = new Date().toISOString()
    
    logEvent(ticketId, 'resolution_channel_set', {
      channelId
    }, userId, userName)
    
    persist()
    return ticket
  }
  
  // Передача между линиями
  const transferLine = (ticketId, newLine, comment, userId = 'user', userName = 'Пользователь') => {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (!ticket) return null
    
    const oldLine = ticket.line
    ticket.line = newLine
    ticket.updatedAt = new Date().toISOString()
    
    logEvent(ticketId, 'line_transferred', {
      from: oldLine,
      to: newLine,
      comment
    }, userId, userName)
    
    persist()
    return ticket
  }
  
  // Назначение исполнителя
  const assignTo = (ticketId, assigneeId, assigneeName, userId = 'user', userName = 'Пользователь') => {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (!ticket) return null
    
    const oldAssignee = ticket.assignee
    ticket.assignee = assigneeId ? { id: assigneeId, name: assigneeName } : null
    ticket.updatedAt = new Date().toISOString()
    
    logEvent(ticketId, 'assignee_changed', {
      from: oldAssignee,
      to: ticket.assignee
    }, userId, userName)
    
    persist()
    return ticket
  }
  
  // Поиск и фильтрация
  const getTicketById = (id) => {
    return tickets.value.find(t => t.id === id)
  }
  
  const getFilteredTickets = (filters = {}) => {
    let result = [...tickets.value]
    
    if (filters.status) {
      result = result.filter(t => t.status === filters.status)
    }
    if (filters.type) {
      result = result.filter(t => t.type === filters.type)
    }
    if (filters.isClient !== undefined) {
      result = result.filter(t => t.isClient === filters.isClient)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(t => 
        t.number.toLowerCase().includes(search) ||
        t.title.toLowerCase().includes(search) ||
        (t.counterparty && t.counterparty.toLowerCase().includes(search))
      )
    }
    
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  const getAuditLogByTicket = (ticketId) => {
    return auditLogs.value
      .filter(log => log.ticketId === ticketId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }
  
  // Статистика для дашборда
  const getStats = () => {
    const byStatus = {}
    const byType = {}
    let clientCount = 0
    let internalCount = 0
    let pausedCount = 0
    let otherTypeCount = 0
    
    statuses = ['new', 'in_progress', 'waiting_client', 'waiting_partner', 'resolved', 'closed']
    statuses.forEach(s => byStatus[s] = 0)
    
    tickets.value.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1
      byType[t.type] = (byType[t.type] || 0) + 1
      
      if (t.isClient) clientCount++
      else internalCount++
      
      if (['waiting_client', 'waiting_partner'].includes(t.status)) pausedCount++
      if (t.type === 'other') otherTypeCount++
    })
    
    return {
      total: tickets.value.length,
      byStatus,
      byType,
      clientCount,
      internalCount,
      pausedCount,
      otherTypeCount
    }
  }
  
  return {
    tickets,
    auditLogs,
    initialize,
    persist,
    createTicket,
    updateStatus,
    setResolutionChannel,
    transferLine,
    assignTo,
    getTicketById,
    getFilteredTickets,
    getAuditLogByTicket,
    getStats
  }
})
