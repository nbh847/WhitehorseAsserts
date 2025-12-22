import apiService from './apiService.js'

// 数据存储工具类
class AssetStorage {
  constructor() {
    this.storageKey = 'asset_records'
    this.backupReminderKey = 'assetRecords_lastBackup'
    this.autoBackupEnabled = true
    this.setupAutoBackupReminder()
  }

  // 获取所有资产记录
  async getRecords() {
    try {
      return await apiService.getAssets()
    } catch (error) {
      console.error('获取资产记录失败:', error)
      // 后端失败时回退到localStorage
      const records = localStorage.getItem(this.storageKey)
      return records ? JSON.parse(records) : []
    }
  }

  // 添加资产记录
  async addRecord(record) {
    try {
      const result = await apiService.addAsset(record)
      // 备份到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(result))
      return result
    } catch (error) {
      console.error('添加资产记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      const newRecord = {
        ...record,
        id: Date.now(), // 生成唯一ID
        date: new Date().toISOString().split('T')[0] // 格式化为YYYY-MM-DD
      }
      records.push(newRecord)
      // 按日期排序（最新日期在最后）
      records.sort((a, b) => new Date(a.date) - new Date(b.date))
      localStorage.setItem(this.storageKey, JSON.stringify(records))
      return records
    }
  }

  // 删除资产记录
  async deleteRecord(id) {
    try {
      const result = await apiService.deleteAsset(id)
      // 备份到localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(result))
      return result
    } catch (error) {
      console.error('删除资产记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      const updatedRecords = records.filter(record => record.id !== id)
      // 按日期排序（最新日期在最后）
      updatedRecords.sort((a, b) => new Date(a.date) - new Date(b.date))
      localStorage.setItem(this.storageKey, JSON.stringify(updatedRecords))
      return updatedRecords
    }
  }

  // 清空所有记录
  async clearAll() {
    try {
      const result = await apiService.clearAssets()
      // 清空localStorage
      localStorage.removeItem(this.storageKey)
      return result
    } catch (error) {
      console.error('清空资产记录失败:', error)
      // 后端失败时回退到localStorage
      localStorage.removeItem(this.storageKey)
      return []
    }
  }

  // 获取最新记录
  async getLatestRecord() {
    try {
      return await apiService.getLatestAsset()
    } catch (error) {
      console.error('获取最新资产记录失败:', error)
      // 后端失败时回退到localStorage
      const records = await this.getRecords()
      return records.length > 0 ? records[records.length - 1] : null
    }
  }

  // 获取按日期排序的记录
  async getRecordsSortedByDate() {
    try {
      return await apiService.getAssets()
    } catch (error) {
      console.error('获取排序的资产记录失败:', error)
      // 后端失败时回退到localStorage
      const records = this.getRecords()
      // 返回新的排序数组，避免原地排序修改原数组
      return [...records].sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  }

  // 设置自动备份提醒
  setupAutoBackupReminder() {
    const lastBackup = localStorage.getItem(this.backupReminderKey)
    const now = Date.now()
    
    // 如果7天没有备份，提醒用户
    if (!lastBackup || now - parseInt(lastBackup) > 7 * 24 * 60 * 60 * 1000) {
      this.showBackupReminder()
    }
  }
  
  // 显示备份提醒
  showBackupReminder() {
    if (confirm('您已经7天没有备份资产数据了！\n\n建议您立即导出数据备份，避免数据丢失。\n\n点击"确定"立即导出，点击"取消"稍后再说。')) {
      this.exportRecords()
    }
  }
  
  // 更新备份时间戳
  updateBackupTimestamp() {
    localStorage.setItem(this.backupReminderKey, Date.now().toString())
  }
  
  // 导出资产记录到JSON文件
  async exportRecords() {
    try {
      const records = await this.getRecords()
      const dataStr = JSON.stringify(records, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `assetRecords_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      // 更新备份时间戳
      this.updateBackupTimestamp()
      console.log('资产数据已成功导出到本地文件:', exportFileDefaultName)
    } catch (error) {
      console.error('导出资产记录失败:', error)
      alert('导出资产记录失败，请重试')
    }
  }
  
  // 从JSON文件导入资产记录
  async importRecords(jsonData) {
    try {
      const records = JSON.parse(jsonData)
      
      // 验证数据格式是否为数组
      if (!Array.isArray(records)) {
        throw new Error('导入的数据格式不正确，必须是资产记录数组')
      }
      
      // 检查必要字段
      const requiredFields = ['liveMoney', 'investMoney', 'bondMoney']
      records.forEach((record, index) => {
        const missingFields = requiredFields.filter(field => !(field in record))
        if (missingFields.length > 0) {
          throw new Error(`第${index + 1}条记录数据缺少必要字段: ${missingFields.join(', ')}`)
        }
      })
      
      // 清空现有数据并逐条添加
      await this.clearAll()
      for (const record of records) {
        // 移除ID和日期，由后端生成
        const { id, date, ...recordData } = record
        await this.addRecord(recordData)
      }
      
      this.updateBackupTimestamp()
      console.log('资产数据已成功从本地文件导入:', records.length, '条记录')
      
      // 重新获取最新数据
      return await this.getRecords()
    } catch (e) {
      console.error('导入资产记录失败:', e)
      throw new Error('导入资产记录失败，请检查文件格式是否正确\n\n错误详情: ' + e.message)
    }
  }
}

// 导出单例实例
export default new AssetStorage()