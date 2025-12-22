// 预算管理数据存储工具类
import apiService from './apiService'

class BudgetStorage {
  constructor() {
    this.storageKey = 'budget_settings'
    this.budgetHistoryKey = 'budget_history'
    this.startDate = new Date(2025, 11, 1) // 系统启用时间：2025年12月
  }

  // 获取所有预算设置
  async getBudgets() {
    try {
      // 尝试从后端获取预算数据
      const budgets = await apiService.getBudgets()
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      return budgets
    } catch (error) {
      console.error('从后端获取预算数据失败，回退到localStorage:', error)
      // 从localStorage获取预算数据
      const budgets = localStorage.getItem(this.storageKey)
      const defaultCategories = {
        food: 0, // 餐饮
        gifts: 0, // 人情
        medicalInsurance: 0, // 医疗保险
        transport: 0, // 交通
        housingUtilities: 0, // 居住水电
        entertainment: 0, // 娱乐
        dailyNecessities: 0, // 生活用品
        clothing: 0, // 服装
        pets: 0, // 宠物
        travel: 0 // 旅行
      }
      
      let parsedBudgets
      try {
        parsedBudgets = budgets ? JSON.parse(budgets) : {}
      } catch (e) {
        // 如果解析失败，使用默认结构
        parsedBudgets = {}
      }
      
      // 确保返回完整的预算结构
      const result = {
        monthly: parsedBudgets.monthly || {},
        default: {
          necessary: parsedBudgets.default?.necessary || {},
          discretionary: parsedBudgets.default?.discretionary || {},
          categories: parsedBudgets.default?.categories || { ...defaultCategories },
          total: parsedBudgets.default?.total || 0
        }
      }
      return result
    }
  }

  // 获取预算历史记录
  async getBudgetHistory() {
    try {
      // 尝试从后端获取预算历史记录
      const history = await apiService.getBudgetHistory()
      // 同步到localStorage作为备份
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      return history
    } catch (error) {
      console.error('从后端获取预算历史记录失败，回退到localStorage:', error)
      // 从localStorage获取预算历史记录
      const history = localStorage.getItem(this.budgetHistoryKey)
      return history ? JSON.parse(history) : []
    }
  }

  // 设置月度预算
  async setMonthlyBudget(month, category, amount) {
    // 验证月份格式 YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('月份格式错误，应为YYYY-MM')
    }
    
    // 验证金额
    const budgetAmount = parseFloat(amount)
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      throw new Error('预算金额必须为非负数字')
    }
    
    // 构建预算数据
    const budgetData = {
      month,
      category,
      amount: budgetAmount
    }
    
    try {
      // 尝试通过后端API设置预算
      const updatedBudgets = await apiService.setMonthlyBudget(budgetData)
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(updatedBudgets))
      // 更新历史记录
      const history = await this.getBudgetHistory()
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      return updatedBudgets
    } catch (error) {
      console.error('通过后端API设置预算失败，回退到localStorage:', error)
      // 回退到localStorage实现
      const budgets = await this.getBudgets()
      const history = await this.getBudgetHistory()
      
      // 根据支出类别确定是必须消费还是可选消费
      const necessaryCategories = ['food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities']
      const categoryType = necessaryCategories.includes(category) ? 'necessary' : 'discretionary'
      
      // 获取当前时间和月份
      const currentDate = new Date()
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      
      // 如果设置的是过去的月份，只更新该月份的预算
      // 如果设置的是当前或未来月份，更新该月份及之后的默认预算
      if (month < currentMonth) {
        // 更新历史月份的预算
        if (!budgets.monthly[month]) {
          // 如果该月份没有预算记录，创建一个新的记录，基于之前的预算或默认预算
          const previousMonth = this.getPreviousMonth(month)
          budgets.monthly[month] = this.createMonthBudgetRecord(previousMonth)
        }
        
        // 记录旧金额
        const oldAmount = budgets.monthly[month].categories[category] || 0
        
        // 更新分类预算
        budgets.monthly[month].categories[category] = budgetAmount
        
        // 更新总预算
        this.updateTotalBudgetForMonth(budgets, month, categoryType)
        
        // 记录预算变更历史
        history.push({
          id: Date.now(),
          month: month,
          category: category,
          oldAmount: oldAmount,
          newAmount: budgetAmount,
          timestamp: new Date().toISOString(),
          type: 'historical_budget_change'
        })
      } else {
        // 更新默认预算（影响当前及未来月份）
        const oldAmount = budgets.default.categories[category] || 0
        
        // 更新分类预算
        budgets.default.categories[category] = budgetAmount
        
        // 更新默认总预算
        this.updateTotalBudget(budgets.default)
        
        // 记录预算变更历史
        history.push({
          id: Date.now(),
          month: month,
          category: category,
          oldAmount: oldAmount,
          newAmount: budgetAmount,
          timestamp: new Date().toISOString(),
          type: 'default_budget_change'
        })
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      
      return budgets
    }
  }

  // 更新总预算
  updateTotalBudget(budgetData) {
    const necessaryCategories = ['food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities']
    const discretionaryCategories = ['entertainment', 'dailyNecessities', 'clothing', 'pets', 'travel']
    const defaultCategories = {
      food: 0, // 餐饮
      gifts: 0, // 人情
      medicalInsurance: 0, // 医疗保险
      transport: 0, // 交通
      housingUtilities: 0, // 居住水电
      entertainment: 0, // 娱乐
      dailyNecessities: 0, // 生活用品
      clothing: 0, // 服装
      pets: 0, // 宠物
      travel: 0 // 旅行
    }
    
    // 确保categories字段存在
    budgetData.categories = budgetData.categories || { ...defaultCategories }
    
    // 计算必须消费总预算
    budgetData.necessary.total = necessaryCategories.reduce((sum, cat) => sum + (budgetData.categories[cat] || 0), 0)
    
    // 计算可选消费总预算
    budgetData.discretionary.total = discretionaryCategories.reduce((sum, cat) => sum + (budgetData.categories[cat] || 0), 0)
    
    // 计算总预算
    budgetData.total = budgetData.necessary.total + budgetData.discretionary.total
  }
  
  // 更新指定月份的总预算
  updateTotalBudgetForMonth(budgets, month, categoryType) {
    const necessaryCategories = ['food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities']
    const discretionaryCategories = ['entertainment', 'dailyNecessities', 'clothing', 'pets', 'travel']
    const defaultCategories = {
      food: 0, // 餐饮
      gifts: 0, // 人情
      medicalInsurance: 0, // 医疗保险
      transport: 0, // 交通
      housingUtilities: 0, // 居住水电
      entertainment: 0, // 娱乐
      dailyNecessities: 0, // 生活用品
      clothing: 0, // 服装
      pets: 0, // 宠物
      travel: 0 // 旅行
    }
    
    if (!budgets.monthly[month]) {
      return
    }
    
    const monthBudget = budgets.monthly[month]
    
    // 确保categories字段存在
    monthBudget.categories = monthBudget.categories || { ...defaultCategories }
    
    // 计算必须消费总预算
    monthBudget.necessary.total = necessaryCategories.reduce((sum, cat) => sum + (monthBudget.categories[cat] || 0), 0)
    
    // 计算可选消费总预算
    monthBudget.discretionary.total = discretionaryCategories.reduce((sum, cat) => sum + (monthBudget.categories[cat] || 0), 0)
    
    // 计算总预算
    monthBudget.total = monthBudget.necessary.total + monthBudget.discretionary.total
  }
  
  // 获取上一个月份
  getPreviousMonth(month) {
    const [year, monthNum] = month.split('-').map(Number)
    const date = new Date(year, monthNum - 1, 1)
    date.setMonth(date.getMonth() - 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }
  
  // 创建月份预算记录
  async createMonthBudgetRecord(previousMonth) {
    const budgets = await this.getBudgets()
    
    // 如果有上一个月份的预算记录，基于上一个月份创建
    if (budgets.monthly[previousMonth]) {
      return {
        ...budgets.monthly[previousMonth],
        updatedAt: new Date().toISOString()
      }
    }
    
    // 否则基于默认预算创建
    return {
      necessary: {
        total: budgets.default.necessary.total || 0
      },
      discretionary: {
        total: budgets.default.discretionary.total || 0
      },
      categories: {
        ...budgets.default.categories
      },
      total: budgets.default.total || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  // 获取指定月份的预算
  async getMonthlyBudget(month, category = null) {
    const budgets = await this.getBudgets()
    const defaultCategories = {
      food: 0, // 餐饮
      gifts: 0, // 人情
      medicalInsurance: 0, // 医疗保险
      transport: 0, // 交通
      housingUtilities: 0, // 居住水电
      entertainment: 0, // 娱乐
      dailyNecessities: 0, // 生活用品
      clothing: 0, // 服装
      pets: 0, // 宠物
      travel: 0 // 旅行
    }
    
    // 验证月份格式 YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('月份格式错误，应为YYYY-MM')
    }
    
    // 确定使用哪个预算来源
    // 1. 如果该月份有明确的预算记录，直接使用
    if (budgets.monthly[month]) {
      let budgetSource = budgets.monthly[month]
      
      // 确保budgetSource总是包含categories字段
      budgetSource = {
        ...budgetSource,
        categories: budgetSource.categories || { ...defaultCategories }
      }
      
      if (category) {
        return budgetSource.categories[category] || 0
      }
      
      return budgetSource
    }
    
    // 2. 如果该月份没有明确的预算记录，查找离它最近的已设置预算
    const monthDates = Object.keys(budgets.monthly)
    let closestMonth = null
    let minDiff = Infinity
    
    for (const existingMonth of monthDates) {
      const diff = Math.abs(new Date(month + '-01') - new Date(existingMonth + '-01'))
      if (diff < minDiff) {
        minDiff = diff
        closestMonth = existingMonth
      }
    }
    
    // 3. 如果找到了最近的预算记录，使用它；否则使用默认预算
    let budgetSource = closestMonth ? budgets.monthly[closestMonth] : budgets.default
    
    // 确保budgetSource总是包含categories字段
    budgetSource = {
      ...budgetSource,
      categories: budgetSource.categories || { ...defaultCategories }
    }
    
    if (category) {
      return budgetSource.categories[category] || 0
    }
    
    return budgetSource
  }

  // 计算预算滚动（结转和抵扣）
  async calculateBudgetRoll(month) {
    // 验证月份格式 YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('月份格式错误，应为YYYY-MM')
    }
    
    // 解析月份
    const [year, monthNum] = month.split('-').map(Number)
    const currentMonth = new Date(year, monthNum - 1, 1)
    
    // 获取上一个月
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(currentMonth.getMonth() - 1)
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`
    
    // 如果是系统启用的第一个月（2025年12月），没有上一个月的预算
    if (lastMonth < this.startDate) {
      const currentMonthBudget = await this.getMonthlyBudget(month)
      return {
        carriedForward: {
          necessary: 0,
          discretionary: 0,
          total: 0
        },
        currentBudget: {
          necessary: currentMonthBudget.necessary.total || 0,
          discretionary: currentMonthBudget.discretionary.total || 0,
          total: currentMonthBudget.total || 0
        },
        availableBudget: {
          necessary: currentMonthBudget.necessary.total || 0,
          discretionary: currentMonthBudget.discretionary.total || 0,
          total: currentMonthBudget.total || 0
        }
      }
    }
    
    // 从localStorage获取支出记录（未来可考虑迁移到后端）
    const records = JSON.parse(localStorage.getItem('expense_records') || '[]')
    
    // 获取上一个月的支出记录
    const lastMonthExpenses = records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === lastMonth.getFullYear() && recordDate.getMonth() === lastMonth.getMonth()
    })
    
    // 计算上一个月的实际支出
    const lastMonthActual = {
      necessary: 0,
      discretionary: 0,
      total: 0
    }
    
    lastMonthExpenses.forEach(record => {
      lastMonthActual.necessary += (record.food || 0) + (record.gifts || 0) + (record.medicalInsurance || 0) + (record.transport || 0) + (record.housingUtilities || 0)
      lastMonthActual.discretionary += (record.entertainment || 0) + (record.dailyNecessities || 0) + (record.clothing || 0) + (record.pets || 0) + (record.travel || 0)
    })
    
    lastMonthActual.total = lastMonthActual.necessary + lastMonthActual.discretionary
    
    // 获取上一个月的预算
    const lastMonthBudget = await this.getMonthlyBudget(lastMonthStr)
    
    // 计算结转和抵扣金额
    const carriedForward = {
      necessary: Math.max(0, lastMonthBudget.necessary.total - lastMonthActual.necessary), // 未使用的预算结转
      discretionary: Math.max(0, lastMonthBudget.discretionary.total - lastMonthActual.discretionary),
      total: Math.max(0, lastMonthBudget.total - lastMonthActual.total)
    }
    
    const deficit = {
      necessary: Math.max(0, lastMonthActual.necessary - lastMonthBudget.necessary.total), // 超支部分
      discretionary: Math.max(0, lastMonthActual.discretionary - lastMonthBudget.discretionary.total),
      total: Math.max(0, lastMonthActual.total - lastMonthBudget.total)
    }
    
    // 计算当前月份的可用预算（预算 + 结转 - 超支抵扣）
    const currentMonthBudget = await this.getMonthlyBudget(month)
    const currentBudget = {
      necessary: currentMonthBudget.necessary.total || 0,
      discretionary: currentMonthBudget.discretionary.total || 0,
      total: currentMonthBudget.total || 0
    }
    
    const availableBudget = {
      necessary: Math.max(0, currentBudget.necessary + carriedForward.necessary - deficit.necessary),
      discretionary: Math.max(0, currentBudget.discretionary + carriedForward.discretionary - deficit.discretionary),
      total: Math.max(0, currentBudget.total + carriedForward.total - deficit.total)
    }
    
    return {
      carriedForward,
      deficit,
      currentBudget,
      availableBudget
    }
  }

  // 获取预算历史记录
  async getBudgetHistoryByMonth(month) {
    const history = await this.getBudgetHistory()
    return history.filter(item => item.month === month)
  }
  
  // 编辑预算历史记录
  async updateBudgetHistoryRecord(id, updates) {
    try {
      // 尝试通过后端API更新预算历史记录
      const updatedRecord = await apiService.updateBudgetHistoryRecord(id, updates)
      // 更新localStorage
      const history = await this.getBudgetHistory()
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      const budgets = await this.getBudgets()
      localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      return updatedRecord
    } catch (error) {
      console.error('通过后端API更新预算历史记录失败，回退到localStorage:', error)
      // 回退到localStorage实现
      const history = await this.getBudgetHistory()
      const index = history.findIndex(item => item.id === id)
      
      if (index === -1) {
        throw new Error('找不到要编辑的预算记录')
      }
      
      const oldRecord = { ...history[index] }
      const updatedRecord = { ...oldRecord, ...updates, updatedAt: new Date().toISOString() }
      
      history[index] = updatedRecord
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      
      // 如果修改的是历史月份的预算，还需要更新对应的月度预算
      if (updatedRecord.type === 'historical_budget_change') {
        const budgets = await this.getBudgets()
        
        if (!budgets.monthly[updatedRecord.month]) {
          budgets.monthly[updatedRecord.month] = await this.createMonthBudgetRecord(this.getPreviousMonth(updatedRecord.month))
        }
        
        budgets.monthly[updatedRecord.month].categories[updatedRecord.category] = updatedRecord.newAmount
        this.updateTotalBudgetForMonth(budgets, updatedRecord.month)
        
        localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      }
      // 如果修改的是默认预算，还需要更新默认预算
      else if (updatedRecord.type === 'default_budget_change') {
        const budgets = await this.getBudgets()
        budgets.default.categories[updatedRecord.category] = updatedRecord.newAmount
        this.updateTotalBudget(budgets.default)
        localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      }
      
      return updatedRecord
    }
  }
  
  // 删除预算历史记录
  async deleteBudgetHistoryRecord(id) {
    try {
      // 尝试通过后端API删除预算历史记录
      const deletedRecord = await apiService.deleteBudgetHistoryRecord(id)
      // 更新localStorage
      const history = await this.getBudgetHistory()
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      const budgets = await this.getBudgets()
      localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      return deletedRecord
    } catch (error) {
      console.error('通过后端API删除预算历史记录失败，回退到localStorage:', error)
      // 回退到localStorage实现
      const history = await this.getBudgetHistory()
      const index = history.findIndex(item => item.id === id)
      
      if (index === -1) {
        throw new Error('找不到要删除的预算记录')
      }
      
      const deletedRecord = history.splice(index, 1)[0]
      localStorage.setItem(this.budgetHistoryKey, JSON.stringify(history))
      
      // 如果删除的是历史月份的预算，需要重新计算该月份的预算
      if (deletedRecord.type === 'historical_budget_change') {
        const budgets = await this.getBudgets()
        
        // 查找该月份剩余的最新预算记录
        const remainingRecords = history
          .filter(item => item.type === 'historical_budget_change' && item.month === deletedRecord.month && item.category === deletedRecord.category)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        
        if (remainingRecords.length > 0) {
          // 使用剩余的最新记录恢复预算
          budgets.monthly[deletedRecord.month].categories[deletedRecord.category] = remainingRecords[0].newAmount
        } else {
          // 没有剩余记录，使用默认预算
          const previousMonth = this.getPreviousMonth(deletedRecord.month)
          const defaultBudget = await this.getMonthlyBudget(previousMonth, deletedRecord.category)
          budgets.monthly[deletedRecord.month].categories[deletedRecord.category] = defaultBudget
        }
        
        this.updateTotalBudgetForMonth(budgets, deletedRecord.month)
        localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      }
      // 如果删除的是默认预算，需要重新计算默认预算
      else if (deletedRecord.type === 'default_budget_change') {
        const budgets = await this.getBudgets()
        
        // 查找剩余的最新默认预算记录
        const remainingRecords = history
          .filter(item => item.type === 'default_budget_change' && item.category === deletedRecord.category)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        
        if (remainingRecords.length > 0) {
          // 使用剩余的最新记录恢复默认预算
          budgets.default.categories[deletedRecord.category] = remainingRecords[0].newAmount
        } else {
          // 没有剩余记录，重置为0
          budgets.default.categories[deletedRecord.category] = 0
        }
        
        this.updateTotalBudget(budgets.default)
        localStorage.setItem(this.storageKey, JSON.stringify(budgets))
      }
      
      return deletedRecord
    }
  }

  // 清空所有预算数据
  clearAll() {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.budgetHistoryKey)
    return { budgets: {}, history: [] }
  }

  // 获取预算使用情况统计
  getBudgetStats(month) {
    const records = JSON.parse(localStorage.getItem('expense_records') || '[]')
    
    // 验证月份格式 YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('月份格式错误，应为YYYY-MM')
    }
    
    // 解析月份
    const [year, monthNum] = month.split('-').map(Number)
    
    // 获取当月支出记录
    const monthExpenses = records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === year && recordDate.getMonth() === monthNum - 1
    })
    
    // 计算当月实际支出
    const actual = {
      food: 0,
      gifts: 0,
      medicalInsurance: 0,
      transport: 0,
      housingUtilities: 0,
      entertainment: 0,
      dailyNecessities: 0,
      clothing: 0,
      pets: 0,
      travel: 0
    }
    
    monthExpenses.forEach(record => {
      actual.food += record.food || 0
      actual.gifts += record.gifts || 0
      actual.medicalInsurance += record.medicalInsurance || 0
      actual.transport += record.transport || 0
      actual.housingUtilities += record.housingUtilities || 0
      actual.entertainment += record.entertainment || 0
      actual.dailyNecessities += record.dailyNecessities || 0
      actual.clothing += record.clothing || 0
      actual.pets += record.pets || 0
      actual.travel += record.travel || 0
    })
    
    // 获取指定月份的预算
    const monthlyBudget = this.getMonthlyBudget(month)
    
    // 计算预算使用情况
    const stats = {
      categories: {},
      necessary: {
        budget: monthlyBudget.necessary.total || 0,
        actual: actual.food + actual.gifts + actual.medicalInsurance + actual.transport + actual.housingUtilities,
        remaining: 0
      },
      discretionary: {
        budget: monthlyBudget.discretionary.total || 0,
        actual: actual.entertainment + actual.dailyNecessities + actual.clothing + actual.pets + actual.travel,
        remaining: 0
      },
      total: {
        budget: monthlyBudget.total || 0,
        actual: 0,
        remaining: 0
      }
    }
    
    // 计算各分类的预算使用情况
    Object.keys(actual).forEach(category => {
      stats.categories[category] = {
        budget: monthlyBudget.categories[category] || 0,
        actual: actual[category],
        remaining: (monthlyBudget.categories[category] || 0) - actual[category]
      }
    })
    
    // 计算总预算使用情况
    stats.necessary.remaining = stats.necessary.budget - stats.necessary.actual
    stats.discretionary.remaining = stats.discretionary.budget - stats.discretionary.actual
    stats.total.actual = stats.necessary.actual + stats.discretionary.actual
    stats.total.remaining = stats.total.budget - stats.total.actual
    
    // 获取预算滚动信息
    const budgetRoll = this.calculateBudgetRoll(month)
    
    return {
      ...stats,
      availableBudget: budgetRoll.availableBudget
    }
  }
  
  // 导出所有数据到本地文件
  exportAllData() {
    // 获取所有数据
    const budgets = this.getBudgets()
    const budgetHistory = this.getBudgetHistory()
    const expenseRecords = JSON.parse(localStorage.getItem('expense_records') || '[]')
    const assetsData = JSON.parse(localStorage.getItem('assets_data') || '{}')
    
    // 构建导出数据结构
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        budgets,
        budgetHistory,
        expenseRecords,
        assetsData
      }
    }
    
    // 转换为JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // 创建下载链接
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-finance-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)
    
    return exportData
  }
  
  // 从本地文件导入数据
  importDataFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          
          // 验证数据结构
          if (!importData.data || !importData.data.budgets || !importData.data.expenseRecords) {
            throw new Error('无效的数据文件格式')
          }
          
          // 保存导入的数据
          localStorage.setItem(this.storageKey, JSON.stringify(importData.data.budgets))
          localStorage.setItem(this.budgetHistoryKey, JSON.stringify(importData.data.budgetHistory || []))
          localStorage.setItem('expense_records', JSON.stringify(importData.data.expenseRecords))
          
          // 保存资产数据（如果有）
          if (importData.data.assetsData) {
            localStorage.setItem('assets_data', JSON.stringify(importData.data.assetsData))
          }
          
          resolve({
            success: true,
            message: '数据导入成功',
            importedData: importData
          })
        } catch (error) {
          reject(new Error(`数据解析失败: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      reader.readAsText(file)
    })
  }
}

// 导出单例实例
export default new BudgetStorage()