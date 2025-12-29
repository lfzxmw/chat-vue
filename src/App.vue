<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from './stores/chat'
import { storeToRefs } from 'pinia'

// 初始化 Store
const chatStore = useChatStore()
// 使用 storeToRefs 保持解构后的状态响应性 (availableModels 是常量，直接从 store 获取)
const { messages, isLoading, currentModel } = storeToRefs(chatStore)
const { availableModels } = chatStore

// 本地输入框状态
const inputValue = ref('')
// 滚动到底部的引用
const messagesEndRef = ref(null)

// 发送处理
const handleSend = async () => {
  if (!inputValue.value.trim()) return
  
  const content = inputValue.value
  inputValue.value = '' // 立即清空输入框
  
  // 调用 Store 中的 Action
  await chatStore.sendMessage(content)
}

// 切换模型
const switchModel = (modelId) => {
  chatStore.setModel(modelId)
}

// 监听消息列表变化，自动滚动到底部
watch(messages, async () => {
  await nextTick()
  messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
}, { deep: true })
</script>

<template>
  <div class="chat-container">
    <header>
      <h1>AI Chat Assistant</h1>
      <!-- 模型切换区域 -->
      <div class="model-switcher">
        <button 
          v-for="model in availableModels" 
          :key="model.id"
          class="model-btn"
          :class="{ active: currentModel === model.id }"
          @click="switchModel(model.id)"
        >
          {{ model.name }}
        </button>
      </div>
    </header>
    
    <!-- 聊天记录区域 -->
    <div class="messages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index" 
        class="message"
        :class="msg.role"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="bubble">
          {{ msg.content }}
        </div>
      </div>
      
      <!-- 加载中提示 -->
      <div v-if="isLoading" class="message assistant">
        <div class="avatar">🤖</div>
        <div class="bubble loading">Thinking...</div>
      </div>
      
      <!-- 滚动锚点 -->
      <div ref="messagesEndRef"></div>
    </div>

    <!-- 底部输入框 -->
    <div class="input-area">
      <input 
        v-model="inputValue" 
        @keydown.enter="handleSend"
        :disabled="isLoading"
        placeholder="输入消息..."
        type="text"
      />
      <button @click="handleSend" :disabled="isLoading">
        发送
      </button>
    </div>
  </div>
</template>
