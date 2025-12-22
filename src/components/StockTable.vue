<template>
  <div class="stock-table-container">
    <h2>白马股监控</h2>
    
    <!-- 添加股票表单 -->
    <div class="add-stock-form">
      <h3>添加股票</h3>
      <div class="form-row">
        <div class="form-group">
          <label>股票代码</label>
          <input v-model="newStock.code" type="text" placeholder="请输入股票代码（如：IBM、AAPL）" required>
        </div>
        <div class="form-group">
          <label>股票名称</label>
          <input v-model="newStock.name" type="text" placeholder="自动获取" readonly>
        </div>
        <div class="form-group" style="justify-content: flex-end; margin-top: auto;">
          <button @click="fetchStockData" class="fetch-data-btn">获取数据</button>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>买点 *</label>
          <input v-model.number="newStock.buyPoint" type="number" step="0.01" placeholder="请输入买点价格" required>
        </div>
        <div class="form-group">
          <label>卖点 *</label>
          <input v-model.number="newStock.sellPoint" type="number" step="0.01" placeholder="请输入卖点价格" required>
        </div>
        <div class="form-group">
          <label>买入股数 *</label>
          <input v-model.number="newStock.shares" type="number" step="1" placeholder="请输入买入股数" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>当前股价</label>
          <input v-model.number="newStock.currentPrice" type="number" step="0.01" placeholder="自动获取" :disabled="true">
        </div>
        <div class="form-group">
          <label>51日均线</label>
          <input v-model.number="newStock.ma51" type="number" step="0.01" placeholder="自动获取" :disabled="true">
        </div>
        <div class="form-group">
          <label>120日均线</label>
          <input v-model.number="newStock.ma120" type="number" step="0.01" placeholder="自动获取" :disabled="true">
        </div>
        <div class="form-group">
          <label>250日均线</label>
          <input v-model.number="newStock.ma250" type="number" step="0.01" placeholder="自动获取" :disabled="true">
        </div>
        <div class="form-group">
          <label>850日均线</label>
          <input v-model.number="newStock.ma850" type="number" step="0.01" placeholder="自动获取" :disabled="true">
        </div>
      </div>
      
      <div class="form-actions">
        <button @click="addStock" class="add-btn">添加股票</button>
      </div>
    </div>
    
    <!-- 数据管理功能 -->
  <div class="data-management">
    <button @click="updateAllStocksData" class="update-all-btn">批量更新</button>
    <button @click="exportStocks" class="export-btn">导出数据</button>
    <label class="import-btn-label">
      <span>导入数据</span>
      <input type="file" accept=".json" @change="importStocks" style="display: none;">
    </label>
  </div>
    
    <!-- 股票表格 -->
    <table class="stock-table">
      <thead>
        <tr>
          <th>股票代码</th>
          <th>股票名称</th>
          <th>买点</th>
          <th>卖点</th>
          <th>买入股数</th>
          <th>当前股价</th>
          <th>51日均线</th>
          <th>120日均线</th>
          <th>250日均线</th>
          <th>850日均线</th>
          <th @click="sortTable('pe')" :class="['sortable', {'sort-asc': sortKey === 'pe' && sortOrder === 'asc', 'sort-desc': sortKey === 'pe' && sortOrder === 'desc'}]">PE</th>
          <th @click="sortTable('pb')" :class="['sortable', {'sort-asc': sortKey === 'pb' && sortOrder === 'asc', 'sort-desc': sortKey === 'pb' && sortOrder === 'desc'}]">PB</th>
          <th @click="sortTable('totalShareCapital')" :class="['sortable', {'sort-asc': sortKey === 'totalShareCapital' && sortOrder === 'asc', 'sort-desc': sortKey === 'totalShareCapital' && sortOrder === 'desc'}]">总股本</th>
          <th @click="sortTable('dividendYield')" :class="['sortable', {'sort-asc': sortKey === 'dividendYield' && sortOrder === 'asc', 'sort-desc': sortKey === 'dividendYield' && sortOrder === 'desc'}]">股息率</th>
          <th>1倍买入</th>
          <th>买入倍数</th>
          <th>距离买点</th>
          <th>距离卖点</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in stocks" :key="stock.id">
          <td>{{ stock.code }}</td>
          <td>{{ stock.name }}</td>
          <td>
            <input v-model.number="stock.buyPoint" type="number" step="0.01" @change="updateStock(stock)" class="edit-input">
          </td>
          <td>
            <input v-model.number="stock.sellPoint" type="number" step="0.01" @change="updateStock(stock)" class="edit-input">
          </td>
          <td>{{ stock.shares }}</td>
          <td>{{ stock.currentPrice.toFixed(2) }}</td>
          <td :class="{'above-price': stock.ma51 > stock.currentPrice, 'below-price': stock.ma51 < stock.currentPrice}">{{ stock.ma51.toFixed(2) }}</td>
          <td :class="{'above-price': stock.ma120 > stock.currentPrice, 'below-price': stock.ma120 < stock.currentPrice}">{{ stock.ma120.toFixed(2) }}</td>
          <td :class="{'above-price': stock.ma250 > stock.currentPrice, 'below-price': stock.ma250 < stock.currentPrice}">{{ stock.ma250.toFixed(2) }}</td>
          <td :class="{'above-price': stock.ma850 > stock.currentPrice, 'below-price': stock.ma850 < stock.currentPrice}">{{ stock.ma850.toFixed(2) }}</td>
          <td>{{ stock.pe ? stock.pe.toFixed(2) : '0.00' }}</td>
          <td>{{ stock.pb ? stock.pb.toFixed(2) : '0.00' }}</td>
          <td>{{ stock.totalShareCapital ? (stock.totalShareCapital / 100000000).toFixed(2) + '亿' : '0.00亿' }}</td>
          <td>{{ stock.dividendYield ? stock.dividendYield.toFixed(2) + '%' : '0.00%' }}</td>
          <td>{{ (stock.currentPrice * stock.shares).toFixed(2) }}</td>
          <td>{{ calculateBuyMultiple(stock) }}</td>
          <td>{{ ((stock.currentPrice - stock.buyPoint) / stock.buyPoint * 100).toFixed(2) }}%</td>
          <td>{{ ((stock.sellPoint - stock.currentPrice) / stock.currentPrice * 100).toFixed(2) }}%</td>
          <td>
            <button @click="manualUpdateStock(stock)" class="update-btn">更新</button>
            <button @click="deleteStock(stock.id)" class="delete-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import stockStorage from '../utils/stockStorage.js';
import stockApi from '../utils/stockApi.js';

export default {
  name: 'StockTable',
  data() {
    return {
      stocks: [],
      sortKey: '',
      sortOrder: 'asc',
      newStock: {
        code: '',
        name: '',
        buyPoint: 0,
        sellPoint: 0,
        shares: 0,
        currentPrice: 0,
        ma51: 0,
        ma120: 0,
        ma250: 0,
        ma850: 0,
        pe: 0,
        pb: 0,
        totalShareCapital: 0,
        dividendYield: 0
      },
      updateInterval: null
    };
  },
  mounted() {
    this.loadStocks();
  },
  
  beforeUnmount() {
    // 组件卸载时停止自动更新
    this.stopAutoUpdate();
  },
  methods: {
    async loadStocks() {
      this.stocks = await stockStorage.getStocks();
      // 如果有排序状态，重新应用排序
      if (this.sortKey) {
        this.sortTable(this.sortKey);
      }
      // 加载完股票数据后立即更新一次（包括股价和均线）
      if (this.stocks.length > 0) {
        this.updateAllStocksData();
      }
      // 不再启动定时更新
      // this.startAutoUpdate();
    },
    
    // 排序方法
    sortTable(key) {
      if (this.sortKey === key) {
        // 如果点击的是当前排序列，则切换排序顺序
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        // 如果点击的是新列，则设置为升序
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      
      // 执行排序
      this.stocks.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        
        // 处理undefined和null值，将它们视为0
        if (aVal === undefined || aVal === null) aVal = 0;
        if (bVal === undefined || bVal === null) bVal = 0;
        
        // 确保数值比较
        if (typeof aVal === 'string') aVal = parseFloat(aVal) || 0;
        if (typeof bVal === 'string') bVal = parseFloat(bVal) || 0;
        
        if (this.sortOrder === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      });
    },
    

    
    // 获取股票数据的API调用
    async fetchStockData() {
      if (!this.newStock.code) {
        alert('请输入股票代码');
        return;
      }
      
      try {
        // 使用真实API获取股票数据
        const stockData = await stockApi.getCompleteStockData(this.newStock.code);
        
        // 更新表单数据
        this.newStock.name = stockData.name;
        this.newStock.currentPrice = stockData.currentPrice;
        this.newStock.ma51 = stockData.ma51 || 0;
        this.newStock.ma120 = stockData.ma120 || 0;
        this.newStock.ma250 = stockData.ma250 || 0;
        this.newStock.ma850 = stockData.ma850 || 0;
        this.newStock.pe = stockData.pe || 0;
        this.newStock.pb = stockData.pb || 0;
        this.newStock.totalShareCapital = stockData.totalShareCapital || 0;
        this.newStock.dividendYield = stockData.dividendYield || 0;
        
        alert('股票数据获取成功！');
      } catch (error) {
        console.error('获取股票数据失败:', error);
        // 提供更详细的错误提示
        if (error.message.includes('API返回了错误信息或无法获取股票数据')) {
          alert('获取股票数据失败：该股票代码可能不受支持或API服务暂时不可用。\n\n建议：\n1. 尝试使用其他股票代码\n2. 检查网络连接\n3. 稍后再试');
        } else if (error.message.includes('API请求失败')) {
          alert('获取股票数据失败：API请求失败，请检查网络连接或稍后再试。');
        } else {
          alert('获取股票数据失败，请检查股票代码或网络连接。');
        }
      }
    },
    

    
    // 手动更新所有股票数据（包括股价和均线）
    async updateAllStocksData() {
      // 同时更新所有股票数据，不使用延迟
      const updatePromises = this.stocks.map(async (stock) => {
        try {
          // 使用真实API获取股票数据
          const stockData = await stockApi.getCompleteStockData(stock.code);
          
          // 更新股票数据
          const updatedStock = {
            ...stock,
            currentPrice: stockData.currentPrice,
            ma51: stockData.ma51 !== undefined ? stockData.ma51 : stock.ma51,
            ma120: stockData.ma120 !== undefined ? stockData.ma120 : stock.ma120,
            ma250: stockData.ma250 !== undefined ? stockData.ma250 : stock.ma250,
            ma850: stockData.ma850 !== undefined ? stockData.ma850 : stock.ma850,
            pe: stockData.pe !== undefined ? stockData.pe : stock.pe,
            pb: stockData.pb !== undefined ? stockData.pb : stock.pb,
            totalShareCapital: stockData.totalShareCapital !== undefined ? stockData.totalShareCapital : stock.totalShareCapital,
            dividendYield: stockData.dividendYield !== undefined ? stockData.dividendYield : stock.dividendYield
          };
          
          // 更新本地存储
          stockStorage.updateStock(stock.id, updatedStock);
          
          return updatedStock;
        } catch (error) {
          console.error(`更新股票 ${stock.code} 数据失败:`, error);
          return stock; // 更新失败时返回原股票数据
        }
      });
      
      // 等待所有更新完成
      const updatedStocks = await Promise.all(updatePromises);
      
      // 更新UI
      this.stocks = updatedStocks;
    },
    
    // 启动自动更新
    startAutoUpdate() {
      // 每分钟自动更新一次数据
      if (!this.updateInterval) {
        this.updateInterval = setInterval(() => {
          this.updateStockData();
        }, 60000); // 1分钟 = 60000毫秒
      }
    },
    
    // 停止自动更新
    stopAutoUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },
    
    // 手动更新单只股票数据
    async manualUpdateStock(stock) {
      try {
        // 使用真实API获取最新股票数据
        const stockData = await stockApi.getCompleteStockData(stock.code);
        
        // 更新股票数据
        const updatedStock = {
          ...stock,
          currentPrice: stockData.currentPrice,
          ma51: stockData.ma51 !== undefined ? stockData.ma51 : stock.ma51,
          ma120: stockData.ma120 !== undefined ? stockData.ma120 : stock.ma120,
          ma250: stockData.ma250 !== undefined ? stockData.ma250 : stock.ma250,
          ma850: stockData.ma850 !== undefined ? stockData.ma850 : stock.ma850,
          pe: stockData.pe !== undefined ? stockData.pe : stock.pe,
          pb: stockData.pb !== undefined ? stockData.pb : stock.pb,
          totalShareCapital: stockData.totalShareCapital !== undefined ? stockData.totalShareCapital : stock.totalShareCapital,
          dividendYield: stockData.dividendYield !== undefined ? stockData.dividendYield : stock.dividendYield
        };
        
        // 更新本地存储
        stockStorage.updateStock(stock.id, updatedStock);
        
        // 更新UI
        const index = this.stocks.findIndex(s => s.id === stock.id);
        if (index !== -1) {
          this.stocks[index] = updatedStock;
        }
        
        alert(`股票 ${stock.code} 更新成功！`);
      } catch (error) {
        console.error(`更新股票 ${stock.code} 数据失败:`, error);
        alert(`更新股票 ${stock.code} 数据失败: ${error.message}`);
      }
    },
    
    // 更新股票数据
    async updateStock(stock) {
      try {
        // 验证买点和卖点是否为有效数值
        if (stock.buyPoint <= 0 || stock.sellPoint <= 0) {
          alert('买点和卖点价格必须大于0');
          // 重新加载数据以恢复之前的有效数值
          await this.loadStocks();
          return;
        }
        
        // 更新本地存储
        stockStorage.updateStock(stock.id, stock);
        
        // 重新加载数据以确保UI显示正确
        await this.loadStocks();
        
        alert('股票数据更新成功！');
      } catch (error) {
        console.error('更新股票数据失败:', error);
        alert('更新股票数据失败，请重试');
        // 重新加载数据以恢复之前的有效数值
        await this.loadStocks();
      }
    },
    
    async addStock() {
      // 验证必填字段
      if (!this.newStock.code) {
        alert('请输入股票代码');
        return;
      }
      
      // 检查股票代码是否已存在
      const existingStock = this.stocks.find(stock => stock.code === this.newStock.code);
      if (existingStock) {
        alert('该股票代码已存在，无法重复添加');
        return;
      }
      
      if (!this.newStock.buyPoint || this.newStock.buyPoint <= 0) {
        alert('请输入有效的买点价格');
        return;
      }
      
      if (!this.newStock.sellPoint || this.newStock.sellPoint <= 0) {
        alert('请输入有效的卖点价格');
        return;
      }
      
      if (!this.newStock.shares || this.newStock.shares <= 0) {
        alert('请输入有效的买入股数');
        return;
      }
      
      try {
        // 如果没有获取股票数据，自动获取
        if (!this.newStock.currentPrice) {
          await this.fetchStockData();
        }
        
        // 创建新股票对象，确保包含所有必要字段
        const newStockObj = {
          ...this.newStock,
          id: String(Date.now()),  // 生成唯一ID
          addedAt: new Date().toISOString()
        };
        
        // 添加到本地存储
        stockStorage.addStock(newStockObj);
        
        // 直接添加到股票列表，无需重新加载
        this.stocks.push(newStockObj);
        
        // 如果有排序状态，重新应用排序
        if (this.sortKey) {
          this.sortTable(this.sortKey);
        }
        
        // 清空表单
        this.newStock = {
          code: '',
          name: '',
          buyPoint: 0,
          sellPoint: 0,
          shares: 0,
          currentPrice: 0,
          ma51: 0,
          ma120: 0,
          ma250: 0,
          ma850: 0,
          pe: 0,
          pb: 0,
          totalShareCapital: 0,
          dividendYield: 0
        };
        
        alert('股票添加成功！');
      } catch (error) {
        console.error('添加股票失败:', error);
        alert('添加股票失败，请重试');
      }
    },
    deleteStock(id) {
      if (confirm('确定要删除这只股票吗？')) {
        stockStorage.deleteStock(id);
        this.loadStocks();
      }
    },
    // 导出股票数据
    exportStocks() {
      stockStorage.exportStocks();
    },
    // 导入股票数据
    importStocks(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          stockStorage.importStocks(e.target.result);
          this.loadStocks();
          alert('数据导入成功！');
        } catch (error) {
          alert('数据导入失败：' + error.message);
        }
      };
      reader.readAsText(file);
    },
    calculateBuyMultiple(stock) {
      const { currentPrice, ma51, ma120, ma250, ma850 } = stock;
      // 确保所有移动平均线都有有效值，否则不参与计算
      const movingAverages = [
        ma51 || 0,
        ma120 || 0,
        ma250 || 0,
        ma850 || 0
      ];
      
      // 计算当前价格低于移动平均线的数量
      const negatives = movingAverages.filter(ma => {
        // 只有当移动平均线大于0时才参与比较，避免0值导致错误
        return ma > 0 && currentPrice - ma < 0;
      }).length;
      
      switch(negatives) {
        case 4: return 2;
        case 3: return 1.5;
        case 2: return 1;
        default: return 0;
      }
    }
  }
};
</script>

<style scoped>
.stock-table-container {
  padding: 20px;
}

.add-stock-form {
  background-color: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.add-stock-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  flex: 1;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.advanced-btn {
  background-color: #909399;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.advanced-btn:hover {
  background-color: #a6a9ad;
}

.advanced-options {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ccc;
}

.add-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.add-btn:hover {
  background-color: #66b1ff;
}

.fetch-data-btn {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.fetch-data-btn:hover {
  background-color: #85ce61;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.stock-table th,
.stock-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.stock-table th {
  background-color: #f0f0f0;
  font-weight: bold;
}

.stock-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
    background-color: #f78989;
  }
  
  /* 数据管理按钮样式 */
  .data-management {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .update-all-btn {
    background-color: #409eff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .update-all-btn:hover {
    background-color: #66b1ff;
  }
  
  .export-btn {
    background-color: #67c23a;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .export-btn:hover {
    background-color: #85ce61;
  }
  
  .import-btn-label {
    background-color: #409eff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    display: inline-block;
  }
  
  .import-btn-label:hover {
    background-color: #66b1ff;
  }
  
  /* 均线颜色样式 */
  .above-price {
    color: red;
    font-weight: bold;
  }
  
  .below-price {
    color: green;
    font-weight: bold;
  }
  
  /* 编辑输入框样式 */
  .edit-input {
    width: 80px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: right;
  }
  
  /* 更新按钮样式 */
  .update-btn {
    background-color: #409eff;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
  }
  
  .update-btn:hover {
    background-color: #66b1ff;
  }
  
  /* 排序功能样式 */
  .sortable {
    cursor: pointer;
    position: relative;
    user-select: none;
  }
  
  .sortable:hover {
    background-color: #e0e0e0;
  }
  
  .sortable::after {
    content: '↕';
    font-size: 0.8em;
    margin-left: 5px;
    opacity: 0.5;
  }
  
  .sortable.sort-asc::after {
    content: '↑';
    opacity: 1;
    color: #409eff;
  }
  
  .sortable.sort-desc::after {
    content: '↓';
    opacity: 1;
    color: #409eff;
  }
</style>