import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Tickets from '../views/Tickets.vue'
import TicketDetail from '../views/TicketDetail.vue'
import Integrations from '../views/Integrations.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: Tickets
  },
  {
    path: '/tickets/:id',
    name: 'TicketDetail',
    component: TicketDetail
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: Integrations
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
