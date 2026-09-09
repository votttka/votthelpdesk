<template>
  <div id="app">
    <header class="header">
      <h1>🎫 HelpDesk Prototype</h1>
      <nav class="nav">
        <router-link to="/">Дашборд</router-link>
        <router-link to="/tickets">Заявки</router-link>
        <router-link to="/integrations">Интеграции</router-link>
      </nav>
      <div class="role-switcher">
        <label>Роль:</label>
        <select v-model="currentRole" @change="onRoleChange">
          <option value="operator">Оператор</option>
          <option value="engineer">Инженер</option>
          <option value="lead">Лид</option>
          <option value="auditor">Аудитор</option>
          <option value="admin">Администратор</option>
        </select>
        <span class="role-badge">Эмуляция</span>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>
    
    <footer class="footer">
      <p>HelpDesk Prototype — команда ИИ-агентов | Данные хранятся локально в браузере</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentRole = ref('operator')

const onRoleChange = () => {
  localStorage.setItem('helpdesk_current_role', currentRole.value)
  window.dispatchEvent(new CustomEvent('role-changed', { detail: currentRole.value }))
}

onMounted(() => {
  const savedRole = localStorage.getItem('helpdesk_current_role')
  if (savedRole) {
    currentRole.value = savedRole
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav a:hover,
.nav a.router-link-active {
  background: rgba(255,255,255,0.2);
}

.role-switcher {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-switcher select {
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
  background: white;
  color: #333;
  cursor: pointer;
}

.role-badge {
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.footer {
  background: #2d3748;
  color: #a0aec0;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
}
</style>
