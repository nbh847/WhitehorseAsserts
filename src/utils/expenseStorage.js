import apiService from './apiService.js'

// 生活费数据存储工具类
class ExpenseStorage {
  constructor() {
    this.storageKey = 'expense_records'
  }

  // 获取所有生活费记录
  async getRecords() {
    try {
      return await apiService.getExpenses()
    } catch (error) {
      console.error('获取生活费记录失败:', error)
      // 后端失败时回退到localStorage
      const records = localStorage.getItem(this.storageKey)
      return records ? JSON.parse(records) : []
    }
  }

  // 添加生活费记录
  async addExpense(record) {
    try {
      const result = await apiService.addExpense(record)
      // 备份到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(result))
      return result
    } catch (error) {
      console.error('添加生活费记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      
      // 如果记录包含month字段，将其转换为该月的最后一天作为日期
      let date = new Date().toISOString().split('T')[0] // 默认当前日期
      
      if (record.month) {
        const [year, month] = record.month.split('-')
        // 创建该月的第一天，然后减去一天得到上个月的最后一天，再加一个月得到本月的最后一天
        date = new Date(year, month, 0).toISOString().split('T')[0]
      }
      
      const newRecord = {
        ...record,
        id: Date.now(), // 生成唯一ID
        date: date // 格式化为YYYY-MM-DD
      }
      
      // 确保所有金额字段都存在且为数字
      const requiredFields = [
        'food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities',
        'entertainment', 'dailyNecessities', 'clothing', 'pets', 'travel', 'total'
      ]
      
      requiredFields.forEach(field => {
        if (typeof newRecord[field] !== 'number') {
          newRecord[field] = parseFloat(newRecord[field]) || 0
        }
      })
      
      records.push(newRecord)
      // 按日期排序（最新日期在最后）
      records.sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // 保存到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(records))
      
      return records
    }
  }

  // 删除生活费记录
  async deleteExpense(id) {
    try {
      const result = await apiService.deleteExpense(id)
      // 备份到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(result))
      return result
    } catch (error) {
      console.error('删除生活费记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      const updatedRecords = records.filter(record => record.id !== id)
      // 按日期排序（最新日期在最后）
      updatedRecords.sort((a, b) => new Date(a.date) - new Date(b.date))
      localStorage.setItem(this.storageKey, JSON.stringify(updatedRecords))
      return updatedRecords
    }
  }
  
  // 更新生活费记录
  async updateExpense(id, updatedData) {
    try {
      const result = await apiService.updateExpense(id, updatedData)
      // 备份到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(result))
      return result
    } catch (error) {
      console.error('更新生活费记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      const index = records.findIndex(record => record.id === id)
      
      if (index !== -1) {
        // 如果记录包含month字段，将其转换为该月的最后一天作为日期
        let date = records[index].date // 默认使用原记录的日期
        
        if (updatedData.month) {
          const [year, month] = updatedData.month.split('-')
          // 创建该月的第一天，然后减去一天得到上个月的最后一天，再加一个月得到本月的最后一天
          date = new Date(year, month, 0).toISOString().split('T')[0]
        }
        
        const updatedRecord = {
          ...records[index],
          ...updatedData,
          date: date // 更新日期
        }
        
        // 确保所有金额字段都存在且为数字
        const requiredFields = [
          'food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities',
          'entertainment', 'dailyNecessities', 'clothing', 'pets', 'travel', 'total'
        ]
        
        requiredFields.forEach(field => {
          if (typeof updatedRecord[field] !== 'number') {
            updatedRecord[field] = parseFloat(updatedRecord[field]) || 0
          }
        })
        
        records[index] = updatedRecord
        // 按日期排序（最新日期在最后）
        records.sort((a, b) => new Date(a.date) - new Date(b.date))
        
        localStorage.setItem(this.storageKey, JSON.stringify(records))
      }
      
      return records
    }
  }

  // 清空所有记录
  async clearAll() {
    try {
      const result = await apiService.clearExpenses()
      // 清空localStorage
      localStorage.removeItem(this.storageKey)
      return result
    } catch (error) {
      console.error('清空生活费记录失败:', error)
      // 后端失败时回退到localStorage
      localStorage.removeItem(this.storageKey)
      return []
    }
  }

  // 获取最新记录
  async getLatestRecord() {
    try {
      return await apiService.getLatestExpense()
    } catch (error) {
      console.error('获取最新生活费记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      return records.length > 0 ? records[records.length - 1] : null
    }
  }

  // 获取按日期排序的记录
  async getExpensesSortedByDate() {
    try {
      return await apiService.getExpenses()
    } catch (error) {
      console.error('获取排序的生活费记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      // 返回新的排序数组，避免原地排序修改原数组
      return [...records].sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  }

  // 按年份分组统计生活费
  async getExpensesGroupedByYear() {
    const records = await this.getExpensesSortedByDate()
    const grouped = {}
    
    records.forEach(record => {
      const year = new Date(record.date).getFullYear().toString()
      if (!grouped[year]) {
        grouped[year] = {
          total: 0,
          monthly: {},
          records: []
        }
      }
      
      grouped[year].total += record.total
      grouped[year].records.push(record)
      
      const month = new Date(record.date).getMonth() + 1
      const monthKey = month.toString().padStart(2, '0')
      if (!grouped[year].monthly[monthKey]) {
        grouped[year].monthly[monthKey] = 0
      }
      grouped[year].monthly[monthKey] += record.total
    })
    
    return grouped
  }
}

// 导出单例实例
export default new ExpenseStorage()