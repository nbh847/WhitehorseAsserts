import apiService from './apiService';

class StockStorage {
  constructor() {
    this.storageKey = 'blueChipStocks';
    this.backupReminderKey = 'blueChipStocks_lastBackup';
    this.autoBackupEnabled = true;
    this.setupAutoBackupReminder();
  }

  // 获取所有股票
  async getStocks() {
    try {
      const stocks = await apiService.getStocks();
      // 保存到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      return stocks;
    } catch (error) {
      console.error('从后端获取股票数据失败，回退到localStorage:', error);
      const stocks = localStorage.getItem(this.storageKey);
      if (!stocks) return [];
      try {
        return JSON.parse(stocks);
      } catch (e) {
        console.error('解析股票数据失败:', e);
        return [];
      }
    }
  }

  // 添加股票
  async addStock(stock) {
    const newStock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      code: stock.code,
      name: stock.name,
      buyPoint: stock.buyPoint,
      sellPoint: stock.sellPoint,
      shares: stock.shares,
      currentPrice: stock.currentPrice,
      ma51: stock.ma51,
      ma120: stock.ma120,
      ma250: stock.ma250,
      ma850: stock.ma850,
      pe: stock.pe,
      pb: stock.pb,
      totalShareCapital: stock.totalShareCapital,
      dividendYield: stock.dividendYield,
      addedAt: new Date().toISOString()
    };

    try {
      const stocks = await apiService.addStock(newStock);
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      return stocks;
    } catch (error) {
      console.error('添加股票到后端失败，回退到localStorage:', error);
      const stocks = await this.getStocks();
      stocks.push(newStock);
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      return stocks;
    }
  }

  // 删除股票
  async deleteStock(id) {
    try {
      const stocks = await apiService.deleteStock(id);
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      return stocks;
    } catch (error) {
      console.error('从后端删除股票失败，回退到localStorage:', error);
      const stocks = await this.getStocks();
      const updatedStocks = stocks.filter(stock => stock.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedStocks));
      return updatedStocks;
    }
  }

  // 更新股票
  async updateStock(id, stock) {
    try {
      const stocks = await apiService.updateStock(id, stock);
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      return stocks;
    } catch (error) {
      console.error('更新后端股票数据失败，回退到localStorage:', error);
      const stocks = await this.getStocks();
      const updatedStocks = stocks.map(item => {
        if (item.id === id) {
          return { ...item, ...stock };
        }
        return item;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(updatedStocks));
      return updatedStocks;
    }
  }

  // 清空所有股票
  async clearAll() {
    try {
      const stocks = await apiService.clearStocks();
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      this.updateBackupTimestamp();
      return stocks;
    } catch (error) {
      console.error('清空后端股票数据失败，回退到localStorage:', error);
      localStorage.removeItem(this.storageKey);
      this.updateBackupTimestamp();
      return [];
    }
  }
  
  // 设置自动备份提醒
  setupAutoBackupReminder() {
    const lastBackup = localStorage.getItem(this.backupReminderKey);
    const now = Date.now();
    
    // 如果7天没有备份，提醒用户
    if (!lastBackup || now - parseInt(lastBackup) > 7 * 24 * 60 * 60 * 1000) {
      this.showBackupReminder();
    }
  }
  
  // 显示备份提醒
  showBackupReminder() {
    if (confirm('您已经7天没有备份股票数据了！\n\n建议您立即导出数据备份，避免数据丢失。\n\n点击"确定"立即导出，点击"取消"稍后再说。')) {
      this.exportStocks();
    }
  }
  
  // 更新备份时间戳
  updateBackupTimestamp() {
    localStorage.setItem(this.backupReminderKey, Date.now().toString());
  }
  
  // 检查数据是否有变更
  async hasDataChanged(previousData) {
    const currentData = await this.getStocks();
    return JSON.stringify(currentData) !== JSON.stringify(previousData);
  }
  
  // 自动备份到本地文件（浏览器环境下模拟）
  autoBackup() {
    if (this.autoBackupEnabled) {
      console.log('自动备份功能已启用，建议您手动点击"导出数据"按钮进行备份');
      // 浏览器环境下无法自动保存到本地文件系统
      // 这里只能提醒用户手动导出
    }
  }

  // 导出股票数据到JSON文件
  async exportStocks() {
    const stocks = await this.getStocks();
    const dataStr = JSON.stringify(stocks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `blueChipStocks_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // 更新备份时间戳
    this.updateBackupTimestamp();
    console.log('股票数据已成功导出到本地文件:', exportFileDefaultName);
  }

  // 从JSON文件导入股票数据
  async importStocks(jsonData) {
    try {
      const stocks = JSON.parse(jsonData);
      
      // 验证导入的数据格式
      if (!Array.isArray(stocks)) {
        throw new Error('导入的数据格式不正确，必须是股票数据数组');
      }
      
      // 检查每个股票对象是否包含必要字段
      const requiredFields = ['id', 'code', 'name', 'buyPoint', 'sellPoint', 'shares', 'currentPrice'];
      stocks.forEach((stock, index) => {
        const missingFields = requiredFields.filter(field => !(field in stock));
        if (missingFields.length > 0) {
          throw new Error(`第${index + 1}个股票数据缺少必要字段: ${missingFields.join(', ')}`);
        }
      });
      
      // 先清空后端数据
      await apiService.clearStocks();
      
      // 逐个添加到后端
      for (const stock of stocks) {
        await apiService.addStock(stock);
      }
      
      // 同步到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(stocks));
      
      this.updateBackupTimestamp();
      console.log('股票数据已成功从本地文件导入:', stocks.length, '只股票');
      return stocks;
    } catch (e) {
      console.error('导入股票数据失败:', e);
      throw new Error('导入股票数据失败，请检查文件格式是否正确\n\n错误详情: ' + e.message);
    }
  }
}

export default new StockStorage();