<template>
  <div class="container">
    <h2>生活费管理</h2>
    
    <!-- 月份选择器 -->
    <div class="form-group">
      <label for="month">选择月份</label>
      <input 
        type="month" 
        id="month" 
        v-model="selectedMonth" 
        required
      />
    </div>
    
    <!-- 标签页切换 -->
    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'expense' }" 
        @click="activeTab = 'expense'"
      >
        支出记录
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'budget' }" 
        @click="activeTab = 'budget'"
      >
        预算设置
      </div>
    </div>
    
    <!-- 支出记录表单 -->
    <div v-if="activeTab === 'expense'" class="tab-content">
      <h3>支出记录</h3>
      <form @submit.prevent="handleExpenseSubmit">
        <!-- 必须消费分类 -->
        <div class="category-section">
          <h4>必须消费</h4>
          <div class="form-group">
            <label for="food">餐饮</label>
            <input 
              type="number" 
              id="food" 
              v-model.number="expenseFormData.food" 
              placeholder="请输入餐饮费用" 
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="gifts">人情</label>
            <input 
              type="number" 
              id="gifts" 
              v-model.number="expenseFormData.gifts" 
              placeholder="请输入人情费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="medicalInsurance">医疗保险</label>
            <input 
              type="number" 
              id="medicalInsurance" 
              v-model.number="expenseFormData.medicalInsurance" 
              placeholder="请输入医疗保险费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="transport">交通</label>
            <input 
              type="number" 
              id="transport" 
              v-model.number="expenseFormData.transport" 
              placeholder="请输入交通费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="housingUtilities">居住水电</label>
            <input 
              type="number" 
              id="housingUtilities" 
              v-model.number="expenseFormData.housingUtilities" 
              placeholder="请输入居住水电费用"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <!-- 可选消费分类 -->
        <div class="category-section">
          <h4>可选消费</h4>
          <div class="form-group">
            <label for="entertainment">娱乐</label>
            <input 
              type="number" 
              id="entertainment" 
              v-model.number="expenseFormData.entertainment" 
              placeholder="请输入娱乐费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="dailyNecessities">生活用品</label>
            <input 
              type="number" 
              id="dailyNecessities" 
              v-model.number="expenseFormData.dailyNecessities" 
              placeholder="请输入生活用品费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="clothing">服装</label>
            <input 
              type="number" 
              id="clothing" 
              v-model.number="expenseFormData.clothing" 
              placeholder="请输入服装费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="pets">宠物</label>
            <input 
              type="number" 
              id="pets" 
              v-model.number="expenseFormData.pets" 
              placeholder="请输入宠物费用"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="travel">旅行</label>
            <input 
              type="number" 
              id="travel" 
              v-model.number="expenseFormData.travel" 
              placeholder="请输入旅行费用"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary">保存支出记录</button>
      </form>
      
      <div v-if="latestExpense" class="total-expense">
        最新总支出: {{ calculateTotal(latestExpense) }} 元
      </div>
    </div>
    
    <!-- 预算设置表单 -->
    <div v-if="activeTab === 'budget'" class="tab-content">
      <h3>预算设置</h3>
      <form @submit.prevent="handleBudgetSubmit">
        <!-- 必须消费分类 -->
        <div class="category-section">
          <h4>必须消费</h4>
          <div class="form-group">
            <label for="food-budget">餐饮</label>
            <input 
              type="number" 
              id="food-budget" 
              v-model.number="budgetFormData.food" 
              placeholder="请输入餐饮预算" 
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="gifts-budget">人情</label>
            <input 
              type="number" 
              id="gifts-budget" 
              v-model.number="budgetFormData.gifts" 
              placeholder="请输入人情预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="medicalInsurance-budget">医疗保险</label>
            <input 
              type="number" 
              id="medicalInsurance-budget" 
              v-model.number="budgetFormData.medicalInsurance" 
              placeholder="请输入医疗保险预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="transport-budget">交通</label>
            <input 
              type="number" 
              id="transport-budget" 
              v-model.number="budgetFormData.transport" 
              placeholder="请输入交通预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="housingUtilities-budget">居住水电</label>
            <input 
              type="number" 
              id="housingUtilities-budget" 
              v-model.number="budgetFormData.housingUtilities" 
              placeholder="请输入居住水电预算"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <!-- 可选消费分类 -->
        <div class="category-section">
          <h4>可选消费</h4>
          <div class="form-group">
            <label for="entertainment-budget">娱乐</label>
            <input 
              type="number" 
              id="entertainment-budget" 
              v-model.number="budgetFormData.entertainment" 
              placeholder="请输入娱乐预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="dailyNecessities-budget">生活用品</label>
            <input 
              type="number" 
              id="dailyNecessities-budget" 
              v-model.number="budgetFormData.dailyNecessities" 
              placeholder="请输入生活用品预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="clothing-budget">服装</label>
            <input 
              type="number" 
              id="clothing-budget" 
              v-model.number="budgetFormData.clothing" 
              placeholder="请输入服装预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="pets-budget">宠物</label>
            <input 
              type="number" 
              id="pets-budget" 
              v-model.number="budgetFormData.pets" 
              placeholder="请输入宠物预算"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label for="travel-budget">旅行</label>
            <input 
              type="number" 
              id="travel-budget" 
              v-model.number="budgetFormData.travel" 
              placeholder="请输入旅行预算"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary">保存预算设置</button>
      </form>
      
      <div v-if="monthlyBudget" class="budget-summary">
        <h4>当前月份预算概览</h4>
        <div class="summary-row">
          <span>必须消费总预算:</span>
          <span>{{ monthlyBudget.necessary.total || 0 }} 元</span>
        </div>
        <div class="summary-row">
          <span>可选消费总预算:</span>
          <span>{{ monthlyBudget.discretionary.total || 0 }} 元</span>
        </div>
        <div class="summary-row total">
          <span>月度总预算:</span>
          <span>{{ monthlyBudget.total || 0 }} 元</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import budgetStorage from '../utils/budgetStorage.js'

export default {
  name: 'ExpenseInput',
  props: {
    latestExpense: Object
  },
  data() {
    // 获取当前月份作为默认值
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    return {
      selectedMonth: `${year}-${month}`, // 默认当前月份
      activeTab: 'expense', // 默认选中支出记录标签
      expenseFormData: {
        // 必须消费
        food: 0,            // 餐饮
        gifts: 0,           // 人情
        medicalInsurance: 0, // 医疗保险
        transport: 0,       // 交通
        housingUtilities: 0, // 居住水电
        // 可选消费
        entertainment: 0,   // 娱乐
        dailyNecessities: 0, // 生活用品
        clothing: 0,        // 服装
        pets: 0,            // 宠物
        travel: 0           // 旅行
      },
      budgetFormData: {
        // 必须消费
        food: 0,            // 餐饮
        gifts: 0,           // 人情
        medicalInsurance: 0, // 医疗保险
        transport: 0,       // 交通
        housingUtilities: 0, // 居住水电
        // 可选消费
        entertainment: 0,   // 娱乐
        dailyNecessities: 0, // 生活用品
        clothing: 0,        // 服装
        pets: 0,            // 宠物
        travel: 0           // 旅行
      },
      monthlyBudget: null
    }
  },
  mounted() {
    this.loadCurrentBudget()
  },
  methods: {
    handleExpenseSubmit() {
      // 确保所有值都被转换为数字，默认为0
      const sanitizedData = {
        // 必须消费
        food: parseFloat(this.expenseFormData.food) || 0,
        gifts: parseFloat(this.expenseFormData.gifts) || 0,
        medicalInsurance: parseFloat(this.expenseFormData.medicalInsurance) || 0,
        transport: parseFloat(this.expenseFormData.transport) || 0,
        housingUtilities: parseFloat(this.expenseFormData.housingUtilities) || 0,
        // 可选消费
        entertainment: parseFloat(this.expenseFormData.entertainment) || 0,
        dailyNecessities: parseFloat(this.expenseFormData.dailyNecessities) || 0,
        clothing: parseFloat(this.expenseFormData.clothing) || 0,
        pets: parseFloat(this.expenseFormData.pets) || 0,
        travel: parseFloat(this.expenseFormData.travel) || 0
      }
      
      // 计算总支出
      const total = Object.values(sanitizedData).reduce((sum, value) => sum + value, 0)
      
      // 验证至少有一个支出金额大于0
      if (total === 0) {
        alert('请至少输入一个大于0的支出金额')
        return
      }
      
      // 添加总支出字段和月份
      sanitizedData.total = total
      sanitizedData.month = this.selectedMonth
      
      this.$emit('addExpense', sanitizedData)
      
      // 清空表单
      this.expenseFormData = {
        // 必须消费
        food: 0,
        gifts: 0,
        medicalInsurance: 0,
        transport: 0,
        housingUtilities: 0,
        // 可选消费
        entertainment: 0,
        dailyNecessities: 0,
        clothing: 0,
        pets: 0,
        travel: 0
      }
    },
    loadCurrentBudget() {
      try {
        this.monthlyBudget = budgetStorage.getMonthlyBudget(this.selectedMonth)
        // 设置表单数据
        Object.keys(this.budgetFormData).forEach(category => {
          this.budgetFormData[category] = this.monthlyBudget.categories[category] || 0
        })
      } catch (error) {
        console.error('加载预算失败:', error)
      }
    },
    handleBudgetSubmit() {
      // 确保所有值都被转换为数字，默认为0
      const sanitizedData = {}
      Object.keys(this.budgetFormData).forEach(category => {
        sanitizedData[category] = parseFloat(this.budgetFormData[category]) || 0
      })
      
      try {
        // 保存每个类别的预算
        Object.keys(sanitizedData).forEach(category => {
          budgetStorage.setMonthlyBudget(this.selectedMonth, category, sanitizedData[category])
        })
        
        // 刷新当前预算显示
        this.loadCurrentBudget()
        
        alert('预算设置保存成功！')
        this.$emit('budgetUpdated')
      } catch (error) {
        console.error('保存预算失败:', error)
        alert('保存预算失败：' + error.message)
      }
    },
    calculateTotal(record) {
      return record.total ? record.total.toFixed(2) : 0.00
    }
  },
  watch: {
    selectedMonth() {
      this.loadCurrentBudget()
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 10px;
}

h4 {
  margin-bottom: 15px;
  color: #409eff;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

label {
  display: block;
  margin-right: 15px;
  font-weight: bold;
  color: #555;
  width: 120px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input[type="month"] {
  width: 200px;
}

.category-section {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 300px;
}

button:hover {
  background-color: #66b1ff;
}

.total-expense {
  margin-top: 20px;
  padding: 10px;
  background-color: #e6f7ff;
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  color: #1890ff;
}

/* 标签页样式 */
.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-right: 10px;
  font-weight: bold;
  color: #666;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background-color: #fff;
  border-radius: 4px 4px 0 0;
}

.tab-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 0 4px 4px 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 预算概览样式 */
.budget-summary {
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.summary-row.total {
  font-weight: bold;
  border-top: 1px solid #e8e8e8;
  padding-top: 10px;
  margin-top: 10px;
}
</style>