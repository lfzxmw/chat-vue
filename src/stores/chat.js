import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // 状态：消息列表
  const messages = ref([
    { role: 'assistant', content: '你好！我是阿里百炼智能助手 (Qwen)，有什么可以帮你的吗？' }
  ])
  // 状态：是否正在加载
  const isLoading = ref(false)
  
  // 状态：当前模型
  const currentModel = ref('qwen-plus')
  
  // 可用模型列表
  const availableModels = [
    { id: 'qwen-turbo', name: 'Qwen Turbo (快速)' },
    { id: 'qwen-plus', name: 'Qwen Plus (均衡)' },
    { id: 'qwen-max', name: 'Qwen Max (最强)' }
  ]

  // 动作：切换模型
  function setModel(modelId) {
    currentModel.value = modelId
  }

  // 动作：发送消息
  async function sendMessage(content) {
    if (!content.trim() || isLoading.value) return

    // 1. 添加用户消息到列表
    const userMsg = { role: 'user', content }
    messages.value.push(userMsg)
    
    // 2. 开启加载状态
    isLoading.value = true

    try {
      // 从 .env 获取 Key
      const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY
      // 阿里百炼 (DashScope) 兼容 OpenAI 的 API 端点
      const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

      if (!API_KEY) {
         throw new Error('未找到 API Key，请检查 .env 文件')
      }

      // 3. 调用 API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: currentModel.value, // 使用当前选择的模型
          messages: messages.value.map(({ role, content }) => ({ role, content })), 
          temperature: 0.7,
          stream: false 
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        console.error('API Error:', errData)
        throw new Error(`API Request Failed: ${response.status} - ${errData?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const aiContent = data.choices[0].message.content
      
      // 4. 将 AI 回复添加到列表
      messages.value.push({ role: 'assistant', content: aiContent })

    } catch (error) {
      console.error(error)
      messages.value.push({ role: 'assistant', content: `出错了: ${error.message}` })
    } finally {
      isLoading.value = false
    }
  }

  return { 
    messages, 
    isLoading, 
    sendMessage,
    currentModel,
    availableModels,
    setModel
  }
})
