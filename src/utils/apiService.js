// API服务类，用于与后端Flask服务通信

class ApiService {
  constructor() {
    // 后端API基础URL
    this.baseUrl = 'http://localhost:5001/api';
  }

  // 通用请求方法
  async request(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // 资产记录相关方法

  // 获取所有资产记录
  async getAssets() {
    return await this.request('/assets');
  }

  // 添加资产记录
  async addAsset(assetData) {
    return await this.request('/assets', 'POST', assetData);
  }

  // 删除资产记录
  async deleteAsset(id) {
    return await this.request(`/assets/${id}`, 'DELETE');
  }

  // 清空所有资产记录
  async clearAssets() {
    return await this.request('/assets', 'DELETE');
  }

  // 获取最新资产记录
  async getLatestAsset() {
    return await this.request('/assets/latest');
  }

  // 股票数据相关方法

  // 获取所有股票数据
  async getStocks() {
    return await this.request('/stocks');
  }

  // 添加股票数据
  async addStock(stockData) {
    return await this.request('/stocks', 'POST', stockData);
  }

  // 删除股票数据
  async deleteStock(id) {
    return await this.request(`/stocks/${id}`, 'DELETE');
  }

  // 更新股票数据
  async updateStock(id, stockData) {
    return await this.request(`/stocks/${id}`, 'PUT', stockData);
  }

  // 清空所有股票数据
  async clearStocks() {
    return await this.request('/stocks', 'DELETE');
  }
  
  // 生活费记录相关方法
  
  // 获取所有生活费记录
  async getExpenses() {
    return await this.request('/expenses');
  }
  
  // 添加生活费记录
  async addExpense(expenseData) {
    return await this.request('/expenses', 'POST', expenseData);
  }
  
  // 删除生活费记录
  async deleteExpense(id) {
    return await this.request(`/expenses/${id}`, 'DELETE');
  }
  
  // 更新生活费记录
  async updateExpense(id, expenseData) {
    return await this.request(`/expenses/${id}`, 'PUT', expenseData);
  }
  
  // 清空所有生活费记录
  async clearExpenses() {
    return await this.request('/expenses', 'DELETE');
  }
  
  // 获取最新生活费记录
  async getLatestExpense() {
    return await this.request('/expenses/latest');
  }

  // 随机漫步相关方法

  // 获取所有随机漫步记录
  async getRandomWalkRecords() {
    return await this.request('/random-walk');
  }

  // 添加随机漫步记录
  async addRandomWalkRecord(record) {
    return await this.request('/random-walk', 'POST', record);
  }

  // 删除随机漫步记录
  async deleteRandomWalkRecord(id) {
    return await this.request(`/random-walk/${id}`, 'DELETE');
  }

  // 更新随机漫步记录
  async updateRandomWalkRecord(id, record) {
    return await this.request(`/random-walk/${id}`, 'PUT', record);
  }

  // 获取随机推荐
  async recommendRandomWalk() {
    return await this.request('/random-walk/recommend');
  }

  // 获取随机漫步元数据
  async getRandomWalkMetadata() {
    return await this.request('/random-walk/metadata');
  }

  // 更新已读计数和阅读时间
  async updateRandomWalkReadCount(id) {
    return await this.request(`/random-walk/${id}/read`, 'POST');
  }

  // 清空所有随机漫步记录
  async clearRandomWalkRecords() {
    return await this.request('/random-walk', 'DELETE');
  }

  // 温故知新相关方法

  // 获取所有博客数据
  async getBlogs() {
    return await this.request('/blogs');
  }

  // 添加博客数据
  async addBlog(blogData) {
    return await this.request('/blogs', 'POST', blogData);
  }

  // 删除博客数据
  async deleteBlog(id) {
    return await this.request(`/blogs/${id}`, 'DELETE');
  }

  // 获取随机推荐博客
  async recommendBlog() {
    return await this.request('/blogs/recommend');
  }

  // 清空所有博客数据
  async clearBlogs() {
    return await this.request('/blogs', 'DELETE');
  }

  // 更新博客推荐计数和阅读时间
  async updateBlogReadInfo(id) {
    return await this.request(`/blogs/${id}/read`, 'POST');
  }

  // 预算管理相关方法

  // 获取所有预算设置
  async getBudgets() {
    return await this.request('/budgets');
  }

  // 获取预算历史记录
  async getBudgetHistory() {
    return await this.request('/budgets/history');
  }

  // 设置月度预算
  async setMonthlyBudget(budgetData) {
    return await this.request('/budgets', 'POST', budgetData);
  }

  // 清空所有预算数据
  async clearBudgets() {
    return await this.request('/budgets', 'DELETE');
  }

  // 更新预算历史记录
  async updateBudgetHistoryRecord(id, updates) {
    return await this.request(`/budgets/history/${id}`, 'PUT', updates);
  }

  // 删除预算历史记录
  async deleteBudgetHistoryRecord(id) {
    return await this.request(`/budgets/history/${id}`, 'DELETE');
  }
}

export default new ApiService();