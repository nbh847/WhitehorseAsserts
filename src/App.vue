<template>
  <div id="app">
    <h1>个人财务管理</h1>
    
    <!-- Tab切换 -->
    <div class="tabs">
      <div 
        class="tab" 
        :class="{ active: activeTab === 'asset' }"
        @click="activeTab = 'asset'"
      >
        资产页
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'expense' }"
        @click="activeTab = 'expense'"
      >
        生活费页面
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'review' }"
        @click="activeTab = 'review'"
      >
        温故知新
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'blueChip' }"
        @click="activeTab = 'blueChip'"
      >
        白马股
      </div>
      <div 
        class="tab" 
        :class="{ active: activeTab === 'randomWalk' }"
        @click="activeTab = 'randomWalk'"
      >
        随机漫步
      </div>

    </div>
    
    <!-- 资产页面内容 -->
    <div v-if="activeTab === 'asset'" class="tab-content">
      <!-- 数据管理功能 -->
      <div class="data-management">
        <button @click="exportRecords" class="export-btn">导出资产数据</button>
        <label class="import-btn-label">
          <span>导入资产数据</span>
          <input type="file" accept=".json" @change="importRecords" style="display: none;">
        </label>
      </div>
      
      <AssetInput 
        :latestRecord="latestRecord"
        @addRecord="handleAddRecord"
      />
      
      <AssetChart :records="records" />
      
      <AssetRatioTable :latestRecord="latestRecord" />
      
      <RecordsList 
        :records="records"
        @delete="handleDeleteRecord"
        @clearAll="handleClearAll"
      />
    </div>
    
    <!-- 生活费页面内容 -->
    <div v-if="activeTab === 'expense'" class="tab-content">
      <!-- 生活费输入组件 -->
      <ExpenseInput 
        :latestExpense="latestExpense"
        @addExpense="handleAddExpense"
        @budgetUpdated="handleBudgetUpdated"
      />
      
      <!-- 生活费展示组件 -->
      <ExpenseSummary 
        :expenses="expenses" 
        @deleteExpense="handleDeleteExpense" 
        @updateExpense="handleUpdateExpense" 
      />
    </div>
    
    <!-- 温故知新页面内容 -->
    <div v-if="activeTab === 'review'" class="tab-content">
      <ReviewBlogs />
    </div>
    
    <!-- 白马股页面内容 -->
    <div v-if="activeTab === 'blueChip'" class="tab-content">
      <StockTable />
    </div>
    
    <!-- 随机漫步页面内容 -->
    <div v-if="activeTab === 'randomWalk'" class="tab-content">
      <RandomWalk />
    </div>

  </div>
</template>

<script>
import AssetInput from './components/AssetInput.vue'
import AssetChart from './components/AssetChart.vue'
import RecordsList from './components/RecordsList.vue'
import AssetRatioTable from './components/AssetRatioTable.vue'
import storage from './utils/storage.js'
import ExpenseInput from './components/ExpenseInput.vue'
import ExpenseSummary from './components/ExpenseSummary.vue'
import expenseStorage from './utils/expenseStorage.js'
import budgetStorage from './utils/budgetStorage.js'
import ReviewBlogs from './components/ReviewBlogs.vue'
import StockTable from './components/StockTable.vue'
import RandomWalk from './components/RandomWalk.vue'

export default {
  name: 'App',
  components: {
    AssetInput,
    AssetChart,
    RecordsList,
    AssetRatioTable,
    ExpenseInput,
    ExpenseSummary,
    ReviewBlogs,
    StockTable,
    RandomWalk
  },
  mounted() {
    // 页面加载时从本地存储读取数据
    this.loadRecords()
    this.loadExpenses()
  },
  data() {
    return {
      activeTab: 'asset', // 默认显示资产页
      records: [],
      expenses: []
    }
  },
  computed: {
    latestRecord() {
      return this.records.length > 0 ? this.records[this.records.length - 1] : null
    },
    latestExpense() {
      return this.expenses.length > 0 ? this.expenses[this.expenses.length - 1] : null
    }
  },
  methods: {
    // 资产相关方法
    async loadRecords() {
      this.records = await storage.getRecordsSortedByDate()
    },
    async handleAddRecord(recordData) {
      // 添加新记录
      this.records = await storage.addRecord(recordData)
    },
    async handleDeleteRecord(id) {
      // 删除记录
      this.records = await storage.deleteRecord(id)
    },
    async handleClearAll() {
      // 清空所有记录
      this.records = await storage.clearAll()
    },
    // 导出资产数据
    exportRecords() {
      storage.exportRecords()
    },
    // 导入资产数据
    importRecords(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          await storage.importRecords(e.target.result)
          await this.loadRecords()
          alert('资产数据导入成功！')
        } catch (error) {
          alert('资产数据导入失败：' + error.message)
        }
      }
      reader.readAsText(file)
    },
    
    // 生活费相关方法
    async loadExpenses() {
      this.expenses = await expenseStorage.getExpensesSortedByDate()
    },
    async handleAddExpense(expenseData) {
      // 添加新生活费记录
      this.expenses = await expenseStorage.addExpense(expenseData)
    },
    async handleDeleteExpense(id) {
      // 删除生活费记录
      this.expenses = await expenseStorage.deleteExpense(id)
    },
    async handleUpdateExpense(id, data) {
      // 更新生活费记录
      this.expenses = await expenseStorage.updateExpense(id, data)
    },
    async handleClearExpenses() {
      // 清空所有生活费记录
      this.expenses = await expenseStorage.clearAll()
    },
    handleBudgetUpdated() {
      // 预算更新处理
      console.log('预算已更新')
      // 这里可以添加其他需要的逻辑，比如重新加载预算数据等
    }
  }
}
</script>

<style>
.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-right: 20px;
  transition: all 0.3s ease;
}

.tab:hover {
  color: #409eff;
}

.tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.tab-content {
  padding: 20px 0;
}
/* 数据管理按钮样式 */
.data-management {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
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
</style>