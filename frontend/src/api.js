import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 120000, // 2 minute timeout for LLM calls
    })
  }

  /**
   * Generate business names from a prompt
   */
  async generate(prompt, numResults = 50, categories = null, style = 'professional') {
    try {
      const response = await this.client.post('/api/generate', {
        prompt,
        num_results: numResults,
        categories,
        style,
      })
      return response.data
    } catch (error) {
      console.error('Generate error:', error)
      throw error
    }
  }

  /**
   * Go Deeper - explore a selected name across multiple dimensions
   */
  async goDeeper(name, context = '', dimensions = null) {
    try {
      const response = await this.client.post('/api/deeper', {
        name,
        context,
        dimensions: dimensions || [
          'same_family',
          'similar_meaning',
          'phonetic',
          'syllable_remix',
          'cross_cultural'
        ],
      })
      return response.data
    } catch (error) {
      console.error('Go Deeper error:', error)
      throw error
    }
  }

  /**
   * Get available categories for filtering
   */
  async getCategories() {
    try {
      const response = await this.client.get('/api/categories')
      return response.data
    } catch (error) {
      console.error('Categories error:', error)
      throw error
    }
  }

  /**
   * Get example prompts/suggestions
   */
  async getExamples() {
    try {
      const response = await this.client.get('/api/examples')
      return response.data
    } catch (error) {
      console.error('Examples error:', error)
      return {
        examples: [
          'A fintech startup for Gen Z',
          'Sustainable fashion brand',
          'AI-powered healthcare platform',
          'Premium coffee subscription'
        ]
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health')
      return response.data
    } catch (error) {
      console.error('Health check error:', error)
      return { status: 'error', error: error.message }
    }
  }
}

export default new ApiService()
