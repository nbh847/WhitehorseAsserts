<template>
  <div class="container">
    <h2>生活费支出分析</h2>
    
    <!-- 年份选择器 -->
    <div class="year-selector">
      <label for="year-select">选择年份：</label>
      <select id="year-select" v-model="selectedYear" @change="updateYearlyData">
        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>
    
    <!-- 按年总结 -->
    <div class="yearly-summary">
      <h3>按年总结</h3>
      <table v-if="yearlyData.length > 0" class="summary-table">
        <thead>
          <tr>
            <th>年份</th>
            <th>必须消费</th>
            <th>占比</th>
            <th>可选消费</th>
            <th>占比</th>
            <th>总支出</th>
            <th>月均支出</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="year in yearlyData" :key="year.year">
            <td>{{ year.year }}</td>
            <td>{{ year.necessaryExpense.toFixed(2) }}</td>
            <td>{{ calculateRatio(year.necessaryExpense, year.total).toFixed(2) }}%</td>
            <td>{{ year.discretionaryExpense.toFixed(2) }}</td>
            <td>{{ calculateRatio(year.discretionaryExpense, year.total).toFixed(2) }}%</td>
            <td class="total">{{ year.total.toFixed(2) }}</td>
            <td>{{ (year.total / 12).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        暂无生活费记录，请先添加记录
      </div>
    </div>
    
    <!-- 详细记录列表 -->
    <div class="records-list">
      <h3>详细记录</h3>
      <table v-if="expenses.length > 0" class="records-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>月份</th>
            <th>餐饮</th>
            <th>人情</th>
            <th>医疗保险</th>
            <th>交通</th>
            <th>居住水电</th>
            <th>娱乐</th>
            <th>生活用品</th>
            <th>服装</th>
            <th>宠物</th>
            <th>旅行</th>
            <th>总支出</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in expenses" :key="record.id">
            <td>{{ record.date }}</td>
            <td>{{ record.month || record.date.slice(0, 7) }}</td>
            <td>{{ record.food.toFixed(2) }}</td>
            <td>{{ (record.gifts || 0).toFixed(2) }}</td>
            <td>{{ (record.medicalInsurance || 0).toFixed(2) }}</td>
            <td>{{ record.transport.toFixed(2) }}</td>
            <td>{{ (record.housingUtilities || 0).toFixed(2) }}</td>
            <td>{{ record.entertainment.toFixed(2) }}</td>
            <td>{{ (record.dailyNecessities || 0).toFixed(2) }}</td>
            <td>{{ (record.clothing || 0).toFixed(2) }}</td>
            <td>{{ (record.pets || 0).toFixed(2) }}</td>
            <td>{{ (record.travel || 0).toFixed(2) }}</td>
            <td class="total">{{ record.total.toFixed(2) }}</td>
            <td>
              <button class="edit-btn" @click="handleEditExpense(record)">
                编辑
              </button>
              <button class="delete-btn" @click="handleDeleteExpense(record.id)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        暂无生活费记录，请先添加记录
      </div>
    </div>
    
    <!-- 支出趋势图 -->
    <div class="expense-chart">
      <h3>支出趋势</h3>
      <div ref="chartRef" class="chart-container"></div>
    </div>
    
    <!-- 支出比例分析 -->
    <div class="ratio-analysis">
      <h3>支出比例分析</h3>
      <div v-if="expensesBySelectedYear.length > 0">
        <!-- 年度总支出分析 -->
        <div class="annual-total-analysis">
          <h4>{{ selectedYear }}年总支出分析</h4>
          <table class="ratio-table">
            <thead>
              <tr>
                <th>支出类别</th>
                <th>年度总额（元）</th>
                <th>占比</th>
                <th>比例图</th>
              </tr>
            </thead>
            <tbody>
              <!-- 计算年度总额 -->
              <template v-if="calculateYearlyTotal() > 0">
                <!-- 必须消费 -->
                <tr>
                  <td>餐饮</td>
                  <td>{{ calculateYearlyCategory('food').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('food'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar food" :style="{ width: calculateRatio(calculateYearlyCategory('food'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>人情</td>
                  <td>{{ calculateYearlyCategory('gifts').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('gifts'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar gifts" :style="{ width: calculateRatio(calculateYearlyCategory('gifts'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>医疗保险</td>
                  <td>{{ calculateYearlyCategory('medicalInsurance').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('medicalInsurance'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar medicalInsurance" :style="{ width: calculateRatio(calculateYearlyCategory('medicalInsurance'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>交通</td>
                  <td>{{ calculateYearlyCategory('transport').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('transport'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar transport" :style="{ width: calculateRatio(calculateYearlyCategory('transport'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>居住水电</td>
                  <td>{{ calculateYearlyCategory('housingUtilities').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('housingUtilities'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar housingUtilities" :style="{ width: calculateRatio(calculateYearlyCategory('housingUtilities'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr class="subtotal-row necessary-subtotal">
                  <td>必须消费小计</td>
                  <td>{{ calculateYearlyNecessaryExpense().toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyNecessaryExpense(), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar necessary" :style="{ width: calculateRatio(calculateYearlyNecessaryExpense(), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                
                <!-- 可选消费 -->
                <tr>
                  <td>娱乐</td>
                  <td>{{ calculateYearlyCategory('entertainment').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('entertainment'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar entertainment" :style="{ width: calculateRatio(calculateYearlyCategory('entertainment'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>生活用品</td>
                  <td>{{ calculateYearlyCategory('dailyNecessities').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('dailyNecessities'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar dailyNecessities" :style="{ width: calculateRatio(calculateYearlyCategory('dailyNecessities'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>服装</td>
                  <td>{{ calculateYearlyCategory('clothing').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('clothing'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar clothing" :style="{ width: calculateRatio(calculateYearlyCategory('clothing'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>宠物</td>
                  <td>{{ calculateYearlyCategory('pets').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('pets'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar pets" :style="{ width: calculateRatio(calculateYearlyCategory('pets'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>旅行</td>
                  <td>{{ calculateYearlyCategory('travel').toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyCategory('travel'), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar travel" :style="{ width: calculateRatio(calculateYearlyCategory('travel'), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                <tr class="subtotal-row discretionary-subtotal">
                  <td>可选消费小计</td>
                  <td>{{ calculateYearlyDiscretionaryExpense().toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateYearlyDiscretionaryExpense(), calculateYearlyTotal()).toFixed(2) }}%</td>
                  <td><div class="ratio-bar discretionary" :style="{ width: calculateRatio(calculateYearlyDiscretionaryExpense(), calculateYearlyTotal()) + '%' }"></div></td>
                </tr>
                
                <!-- 总支出 -->
                <tr class="total-row">
                  <td>总支出</td>
                  <td>{{ calculateYearlyTotal().toFixed(2) }}</td>
                  <td>100.00%</td>
                  <td></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        
        <!-- 月度明细 -->
        <div class="monthly-detail">
          <div class="monthly-header">
            <h4>{{ selectedYear }}年月度支出明细</h4>
            <div class="month-filter">
              <label for="month-select">选择月份：</label>
              <select id="month-select" v-model="selectedMonth">
                <option value="all">全部月份</option>
                <option v-for="monthlyExpense in monthlyExpensesByYear" :key="monthlyExpense.month" :value="monthlyExpense.month">
                  {{ monthlyExpense.month }}
                </option>
              </select>
            </div>
          </div>
          
          <div v-if="filteredMonthlyExpenses.length === 0" class="no-data">
            暂无该月份的支出数据
          </div>
          
          <div v-for="monthlyExpense in filteredMonthlyExpenses" :key="monthlyExpense.month" class="monthly-section">
            <div class="month-summary">
              <h5>{{ monthlyExpense.month }}</h5>
              <div class="month-totals">
                <span class="month-total-item">必须消费: {{ calculateMonthlyNecessaryExpense(monthlyExpense).toFixed(2) }}元 ({{ calculateRatio(calculateMonthlyNecessaryExpense(monthlyExpense), monthlyExpense.total).toFixed(2) }}%)</span>
                <span class="month-total-item">可选消费: {{ calculateMonthlyDiscretionaryExpense(monthlyExpense).toFixed(2) }}元 ({{ calculateRatio(calculateMonthlyDiscretionaryExpense(monthlyExpense), monthlyExpense.total).toFixed(2) }}%)</span>
                <span class="month-total-item total">总支出: {{ monthlyExpense.total.toFixed(2) }}元</span>
              </div>
            </div>
            
            <table class="ratio-table">
              <thead>
                <tr>
                  <th>支出类别</th>
                  <th>金额（元）</th>
                  <th>占比</th>
                  <th>比例图</th>
                </tr>
              </thead>
              <tbody>
                <!-- 必须消费 -->
                <tr>
                  <td>餐饮</td>
                  <td>{{ monthlyExpense.food.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.food, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar food" :style="{ width: calculateRatio(monthlyExpense.food, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>人情</td>
                  <td>{{ monthlyExpense.gifts.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.gifts, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar gifts" :style="{ width: calculateRatio(monthlyExpense.gifts, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>医疗保险</td>
                  <td>{{ monthlyExpense.medicalInsurance.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.medicalInsurance, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar medicalInsurance" :style="{ width: calculateRatio(monthlyExpense.medicalInsurance, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>交通</td>
                  <td>{{ monthlyExpense.transport.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.transport, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar transport" :style="{ width: calculateRatio(monthlyExpense.transport, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>居住水电</td>
                  <td>{{ monthlyExpense.housingUtilities.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.housingUtilities, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar housingUtilities" :style="{ width: calculateRatio(monthlyExpense.housingUtilities, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr class="subtotal-row necessary-subtotal">
                  <td>必须消费小计</td>
                  <td>{{ calculateMonthlyNecessaryExpense(monthlyExpense).toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateMonthlyNecessaryExpense(monthlyExpense), monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar necessary" :style="{ width: calculateRatio(calculateMonthlyNecessaryExpense(monthlyExpense), monthlyExpense.total) + '%' }"></div></td>
                </tr>
                
                <!-- 可选消费 -->
                <tr>
                  <td>娱乐</td>
                  <td>{{ monthlyExpense.entertainment.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.entertainment, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar entertainment" :style="{ width: calculateRatio(monthlyExpense.entertainment, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>生活用品</td>
                  <td>{{ monthlyExpense.dailyNecessities.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.dailyNecessities, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar dailyNecessities" :style="{ width: calculateRatio(monthlyExpense.dailyNecessities, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>服装</td>
                  <td>{{ monthlyExpense.clothing.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.clothing, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar clothing" :style="{ width: calculateRatio(monthlyExpense.clothing, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>宠物</td>
                  <td>{{ monthlyExpense.pets.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.pets, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar pets" :style="{ width: calculateRatio(monthlyExpense.pets, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr>
                  <td>旅行</td>
                  <td>{{ monthlyExpense.travel.toFixed(2) }}</td>
                  <td>{{ calculateRatio(monthlyExpense.travel, monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar travel" :style="{ width: calculateRatio(monthlyExpense.travel, monthlyExpense.total) + '%' }"></div></td>
                </tr>
                <tr class="subtotal-row discretionary-subtotal">
                  <td>可选消费小计</td>
                  <td>{{ calculateMonthlyDiscretionaryExpense(monthlyExpense).toFixed(2) }}</td>
                  <td>{{ calculateRatio(calculateMonthlyDiscretionaryExpense(monthlyExpense), monthlyExpense.total).toFixed(2) }}%</td>
                  <td><div class="ratio-bar discretionary" :style="{ width: calculateRatio(calculateMonthlyDiscretionaryExpense(monthlyExpense), monthlyExpense.total) + '%' }"></div></td>
                </tr>
                
                <!-- 总支出 -->
                <tr class="total-row">
                  <td>总支出</td>
                  <td>{{ monthlyExpense.total.toFixed(2) }}</td>
                  <td>100.00%</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        暂无该年份的支出数据
      </div>
    </div>
    
    <!-- 预算设置记录 -->
    <div class="budget-records">
      <h3>预算设置记录</h3>
      <table v-if="budgetHistory.length > 0" class="budget-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>月份</th>
            <th>支出类别</th>
            <th>旧金额</th>
            <th>新金额</th>
            <th>类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in budgetHistory" :key="record.id">
            <td>{{ new Date(record.timestamp).toLocaleString() }}</td>
            <td>{{ record.month }}</td>
            <td>{{ this.getCategoryName(record.category) }}</td>
            <td>{{ record.oldAmount.toFixed(2) }}</td>
            <td>{{ record.newAmount.toFixed(2) }}</td>
            <td>{{ record.type === 'historical_budget_change' ? '历史预算变更' : '默认预算变更' }}</td>
            <td>
              <button class="edit-btn" @click="handleEditBudget(record)">
                编辑
              </button>
              <button class="delete-btn" @click="handleDeleteBudget(record.id)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        暂无预算设置记录
      </div>
    </div>
    
    <!-- 编辑记录弹窗 -->
    <div v-if="isEditing" class="edit-modal">
      <div class="modal-content">
        <h3>编辑生活费记录</h3>
        <form @submit.prevent="handleUpdateExpense">
          <!-- 月份选择器 -->
          <div class="form-group">
            <label for="edit-month">选择月份</label>
            <input 
              type="month" 
              id="edit-month" 
              v-model="editFormData.month" 
              required
            />
          </div>
          
          <!-- 必须消费分类 -->
          <div class="category-section">
            <h4>必须消费</h4>
            <div class="form-group">
              <label for="edit-food">餐饮</label>
              <input 
                type="number" 
                id="edit-food" 
                v-model.number="editFormData.food" 
                placeholder="请输入餐饮费用" 
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-gifts">人情</label>
              <input 
                type="number" 
                id="edit-gifts" 
                v-model.number="editFormData.gifts" 
                placeholder="请输入人情费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-medicalInsurance">医疗保险</label>
              <input 
                type="number" 
                id="edit-medicalInsurance" 
                v-model.number="editFormData.medicalInsurance" 
                placeholder="请输入医疗保险费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-transport">交通</label>
              <input 
                type="number" 
                id="edit-transport" 
                v-model.number="editFormData.transport" 
                placeholder="请输入交通费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-housingUtilities">居住水电</label>
              <input 
                type="number" 
                id="edit-housingUtilities" 
                v-model.number="editFormData.housingUtilities" 
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
              <label for="edit-entertainment">娱乐</label>
              <input 
                type="number" 
                id="edit-entertainment" 
                v-model.number="editFormData.entertainment" 
                placeholder="请输入娱乐费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-dailyNecessities">生活用品</label>
              <input 
                type="number" 
                id="edit-dailyNecessities" 
                v-model.number="editFormData.dailyNecessities" 
                placeholder="请输入生活用品费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-clothing">服装</label>
              <input 
                type="number" 
                id="edit-clothing" 
                v-model.number="editFormData.clothing" 
                placeholder="请输入服装费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-pets">宠物</label>
              <input 
                type="number" 
                id="edit-pets" 
                v-model.number="editFormData.pets" 
                placeholder="请输入宠物费用"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label for="edit-travel">旅行</label>
              <input 
                type="number" 
                id="edit-travel" 
                v-model.number="editFormData.travel" 
                placeholder="请输入旅行费用"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">更新记录</button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">取消</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 编辑预算记录弹窗 -->
    <div v-if="isEditingBudget" class="edit-modal">
      <div class="modal-content">
        <h3>编辑预算记录</h3>
        <form @submit.prevent="handleUpdateBudget">
          <div class="form-group">
            <label for="edit-budget-month">月份</label>
            <input 
              type="month" 
              id="edit-budget-month" 
              v-model="editBudgetFormData.month" 
              required
              :disabled="true"
            />
          </div>
          
          <div class="form-group">
            <label for="edit-budget-category">支出类别</label>
            <select 
              id="edit-budget-category" 
              v-model="editBudgetFormData.category" 
              required
              :disabled="true"
            >
              <option value="food">餐饮</option>
              <option value="gifts">人情</option>
              <option value="medicalInsurance">医疗保险</option>
              <option value="transport">交通</option>
              <option value="housingUtilities">居住水电</option>
              <option value="entertainment">娱乐</option>
              <option value="dailyNecessities">生活用品</option>
              <option value="clothing">服装</option>
              <option value="pets">宠物</option>
              <option value="travel">旅行</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-budget-amount">新预算金额</label>
            <input 
              type="number" 
              id="edit-budget-amount" 
              v-model.number="editBudgetFormData.newAmount" 
              placeholder="请输入预算金额"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">更新预算</button>
            <button type="button" class="btn btn-secondary" @click="cancelEditBudget">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import expenseStorage from '../utils/expenseStorage.js'
import budgetStorage from '../utils/budgetStorage.js'

export default {
  name: 'ExpenseSummary',
  props: {
    expenses: Array
  },
  data() {
    return {
      chart: null,
      yearlyData: [],
      isEditing: false,
      editingRecord: null,
      editFormData: {
        month: '',
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
      },
      budgetData: null,
      budgetHistory: [],
      selectedYear: new Date().getFullYear().toString(),
      selectedMonth: 'all', // 添加月份选择器
      // 预算编辑相关
      isEditingBudget: false,
      editingBudgetRecord: null,
      editBudgetFormData: {
        month: '',
        category: '',
        newAmount: 0
      }
    }
  },
  computed: {
    latestExpense() {
      return this.expenses.length > 0 ? this.expenses[this.expenses.length - 1] : null
    },
    availableYears() {
      if (this.expenses.length === 0) {
        return [new Date().getFullYear().toString()]
      }
      
      // 获取所有支出记录的年份
      const years = new Set()
      this.expenses.forEach(record => {
        const year = new Date(record.date).getFullYear().toString()
        years.add(year)
      })
      
      // 添加当前年份
      const currentYear = new Date().getFullYear().toString()
      years.add(currentYear)
      
      // 转换为数组并排序
      return Array.from(years).sort((a, b) => b - a)
    },
    expensesBySelectedYear() {
      return this.expenses.filter(record => {
        const recordYear = new Date(record.date).getFullYear().toString()
        return recordYear === this.selectedYear
      })
    },
    monthlyExpensesByYear() {
      // 按月份分组
      const groupedByMonth = {}
      
      this.expensesBySelectedYear.forEach(record => {
        const month = record.date.slice(0, 7) // YYYY-MM
        if (!groupedByMonth[month]) {
          groupedByMonth[month] = {
            month: month,
            food: 0,
            gifts: 0,
            medicalInsurance: 0,
            transport: 0,
            housingUtilities: 0,
            entertainment: 0,
            dailyNecessities: 0,
            clothing: 0,
            pets: 0,
            travel: 0,
            total: 0
          }
        }
        
        groupedByMonth[month].food += record.food
        groupedByMonth[month].gifts += record.gifts || 0
        groupedByMonth[month].medicalInsurance += record.medicalInsurance || 0
        groupedByMonth[month].transport += record.transport
        groupedByMonth[month].housingUtilities += record.housingUtilities || 0
        groupedByMonth[month].entertainment += record.entertainment
        groupedByMonth[month].dailyNecessities += record.dailyNecessities || 0
        groupedByMonth[month].clothing += record.clothing || 0
        groupedByMonth[month].pets += record.pets || 0
        groupedByMonth[month].travel += record.travel || 0
        groupedByMonth[month].total += record.total
      })
      
      // 转换为数组并按月份排序
      return Object.values(groupedByMonth).sort((a, b) => a.month.localeCompare(b.month))
    },
    // 按选择的月份筛选月度支出数据
    filteredMonthlyExpenses() {
      if (this.selectedMonth === 'all') {
        return this.monthlyExpensesByYear
      }
      return this.monthlyExpensesByYear.filter(monthlyExpense => {
        return monthlyExpense.month === this.selectedMonth
      })
    }
  },
  mounted() {
    this.initChart()
    this.updateYearlyData()
    this.loadBudgetData()
    this.loadBudgetHistory()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  watch: {
    expenses: {
      handler() {
        this.updateChart()
        this.updateYearlyData()
        this.loadBudgetData()
      },
      deep: true
    }
  },
  methods: {
    // 处理删除记录
    handleDeleteExpense(id) {
      this.$emit('deleteExpense', id)
    },
    
    // 处理编辑记录
    handleEditExpense(record) {
      this.editingRecord = record
      this.editFormData = {
        month: record.month || record.date.slice(0, 7),
        food: record.food,
        gifts: record.gifts || 0,
        medicalInsurance: record.medicalInsurance || 0,
        transport: record.transport,
        housingUtilities: record.housingUtilities || 0,
        entertainment: record.entertainment,
        dailyNecessities: record.dailyNecessities || 0,
        clothing: record.clothing || 0,
        pets: record.pets || 0,
        travel: record.travel || 0
      }
      this.isEditing = true
    },
    
    // 处理更新记录
    handleUpdateExpense() {
      // 确保所有值都被转换为数字，默认为0
      const sanitizedData = {
        // 必须消费
        food: parseFloat(this.editFormData.food) || 0,
        gifts: parseFloat(this.editFormData.gifts) || 0,
        medicalInsurance: parseFloat(this.editFormData.medicalInsurance) || 0,
        transport: parseFloat(this.editFormData.transport) || 0,
        housingUtilities: parseFloat(this.editFormData.housingUtilities) || 0,
        // 可选消费
        entertainment: parseFloat(this.editFormData.entertainment) || 0,
        dailyNecessities: parseFloat(this.editFormData.dailyNecessities) || 0,
        clothing: parseFloat(this.editFormData.clothing) || 0,
        pets: parseFloat(this.editFormData.pets) || 0,
        travel: parseFloat(this.editFormData.travel) || 0,
        // 月份
        month: this.editFormData.month
      }
      
      // 计算总支出
      const total = Object.values(sanitizedData).reduce((sum, value) => sum + value, 0)
      sanitizedData.total = total
      
      // 验证至少有一个支出金额大于0
      if (total === 0) {
        alert('请至少输入一个大于0的支出金额')
        return
      }
      
      this.$emit('updateExpense', this.editingRecord.id, sanitizedData)
      this.cancelEdit()
    },
    
    // 取消编辑
    cancelEdit() {
      this.isEditing = false
      this.editingRecord = null
      this.editFormData = {
        month: '',
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
    },
    
    // 初始化图表
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.updateChart()
    },
    
    // 更新图表
    updateChart() {
      if (!this.chart || this.expenses.length === 0) return

      // 按日期排序
      const sortedExpenses = [...this.expenses].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // 准备数据
      const dates = sortedExpenses.map(record => record.date)
      const food = sortedExpenses.map(record => record.food)
      const gifts = sortedExpenses.map(record => record.gifts || 0)
      const medicalInsurance = sortedExpenses.map(record => record.medicalInsurance || 0)
      const transport = sortedExpenses.map(record => record.transport)
      const housingUtilities = sortedExpenses.map(record => record.housingUtilities || 0)
      const entertainment = sortedExpenses.map(record => record.entertainment)
      const dailyNecessities = sortedExpenses.map(record => record.dailyNecessities || 0)
      const clothing = sortedExpenses.map(record => record.clothing || 0)
      const pets = sortedExpenses.map(record => record.pets || 0)
      const travel = sortedExpenses.map(record => record.travel || 0)
      const total = sortedExpenses.map(record => record.total)
      
      // 计算必须消费和可选消费汇总
      const necessaryExpense = sortedExpenses.map(record => {
        return (record.food || 0) + (record.gifts || 0) + (record.medicalInsurance || 0) + (record.transport || 0) + (record.housingUtilities || 0)
      })
      
      const discretionaryExpense = sortedExpenses.map(record => {
        return (record.entertainment || 0) + (record.dailyNecessities || 0) + (record.clothing || 0) + (record.pets || 0) + (record.travel || 0)
      })
      
      // 获取各月份的预算数据
      const necessaryBudget = sortedExpenses.map(record => {
        const month = record.month || record.date.slice(0, 7)
        try {
          const budgetStats = budgetStorage.getBudgetStats(month)
          return budgetStats?.categories?.necessary?.budget || 0
        } catch (error) {
          return 0
        }
      })
      
      const discretionaryBudget = sortedExpenses.map(record => {
        const month = record.month || record.date.slice(0, 7)
        try {
          const budgetStats = budgetStorage.getBudgetStats(month)
          return budgetStats?.categories?.discretionary?.budget || 0
        } catch (error) {
          return 0
        }
      })
      
      const totalBudget = sortedExpenses.map(record => {
        const month = record.month || record.date.slice(0, 7)
        try {
          const budgetStats = budgetStorage.getBudgetStats(month)
          return budgetStats?.categories?.total?.budget || 0
        } catch (error) {
          return 0
        }
      })

      // 配置图表
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = params[0].name + '<br/>'
            params.forEach(param => {
              result += `${param.marker}${param.seriesName}: ${(parseFloat(param.value) || 0).toFixed(2)} 元<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['餐饮', '人情', '医疗保险', '交通', '居住水电', '娱乐', '生活用品', '服装', '宠物', '旅行', '必须消费', '可选消费', '总支出', '必须消费预算', '可选消费预算', '总预算'],
          bottom: 0,
          type: 'scroll'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} 元'
          }
        },
        series: [
          { name: '餐饮', type: 'line', data: food, smooth: true, itemStyle: { color: '#ff7875' } },
          { name: '人情', type: 'line', data: gifts, smooth: true, itemStyle: { color: '#ffa940' } },
          { name: '医疗保险', type: 'line', data: medicalInsurance, smooth: true, itemStyle: { color: '#5cdbd3' } },
          { name: '交通', type: 'line', data: transport, smooth: true, itemStyle: { color: '#b37feb' } },
          { name: '居住水电', type: 'line', data: housingUtilities, smooth: true, itemStyle: { color: '#73d13d' } },
          { name: '娱乐', type: 'line', data: entertainment, smooth: true, itemStyle: { color: '#ffc53d' } },
          { name: '生活用品', type: 'line', data: dailyNecessities, smooth: true, itemStyle: { color: '#87ceeb' } },
          { name: '服装', type: 'line', data: clothing, smooth: true, itemStyle: { color: '#ff85c0' } },
          { name: '宠物', type: 'line', data: pets, smooth: true, itemStyle: { color: '#95de64' } },
          { name: '旅行', type: 'line', data: travel, smooth: true, itemStyle: { color: '#ff7575' } },
          {
            name: '必须消费',
            type: 'line',
            data: necessaryExpense,
            smooth: true,
            itemStyle: { color: '#1890ff' },
            lineStyle: { width: 2, type: 'solid' },
            z: 5
          },
          {
            name: '可选消费',
            type: 'line',
            data: discretionaryExpense,
            smooth: true,
            itemStyle: { color: '#52c41a' },
            lineStyle: { width: 2, type: 'solid' },
            z: 5
          },
          {
            name: '总支出',
            type: 'line',
            data: total,
            smooth: true,
            itemStyle: { color: '#ff4d4f' },
            lineStyle: { width: 3 },
            z: 10
          },
          // 预算参考线
          {
            name: '必须消费预算',
            type: 'line',
            data: necessaryBudget,
            smooth: true,
            itemStyle: { color: '#1890ff' },
            lineStyle: { width: 2, type: 'dashed' },
            symbol: 'circle',
            symbolSize: 6,
            z: 3
          },
          {
            name: '可选消费预算',
            type: 'line',
            data: discretionaryBudget,
            smooth: true,
            itemStyle: { color: '#52c41a' },
            lineStyle: { width: 2, type: 'dashed' },
            symbol: 'circle',
            symbolSize: 6,
            z: 3
          },
          {
            name: '总预算',
            type: 'line',
            data: totalBudget,
            smooth: true,
            itemStyle: { color: '#722ed1' },
            lineStyle: { width: 2, type: 'dashed' },
            symbol: 'circle',
            symbolSize: 6,
            z: 3
          }
        ]
      }

      this.chart.setOption(option)
    },
    
    // 调整图表大小
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    // 更新年度数据
    updateYearlyData() {
      if (this.expenses.length === 0) {
        this.yearlyData = []
        return
      }
      
      // 按年份分组
      const groupedByYear = {}
      
      this.expenses.forEach(record => {
        const year = new Date(record.date).getFullYear()
        if (!groupedByYear[year]) {
          groupedByYear[year] = {
            year: year,
            food: 0,
            gifts: 0,
            medicalInsurance: 0,
            transport: 0,
            housingUtilities: 0,
            entertainment: 0,
            dailyNecessities: 0,
            clothing: 0,
            pets: 0,
            travel: 0,
            total: 0
          }
        }
        
        groupedByYear[year].food += record.food
        groupedByYear[year].gifts += record.gifts || 0
        groupedByYear[year].medicalInsurance += record.medicalInsurance || 0
        groupedByYear[year].transport += record.transport
        groupedByYear[year].housingUtilities += record.housingUtilities || 0
        groupedByYear[year].entertainment += record.entertainment
        groupedByYear[year].dailyNecessities += record.dailyNecessities || 0
        groupedByYear[year].clothing += record.clothing || 0
        groupedByYear[year].pets += record.pets || 0
        groupedByYear[year].travel += record.travel || 0
        groupedByYear[year].total += record.total
      })
      
      // 转换为数组并按年份排序
      this.yearlyData = Object.values(groupedByYear).map(yearData => ({
        year: yearData.year,
        necessaryExpense: yearData.food + yearData.gifts + yearData.medicalInsurance + yearData.transport + yearData.housingUtilities,
        discretionaryExpense: yearData.entertainment + yearData.dailyNecessities + yearData.clothing + yearData.pets + yearData.travel,
        total: yearData.total
      })).sort((a, b) => b.year - a.year)
    },
    
    // 计算必须消费总额
    calculateNecessaryExpense(record) {
      return (record.food || 0) + (record.gifts || 0) + (record.medicalInsurance || 0) + (record.transport || 0) + (record.housingUtilities || 0)
    },
    
    // 计算可选消费总额
    calculateDiscretionaryExpense(record) {
      return (record.entertainment || 0) + (record.dailyNecessities || 0) + (record.clothing || 0) + (record.pets || 0) + (record.travel || 0)
    },
    
    // 计算比例
    calculateRatio(asset, total) {
      return total ? (asset / total * 100) : 0
    },
    
    // 加载预算数据
    loadBudgetData() {
      if (!this.latestExpense) return
      
      // 获取最新支出记录的月份
      const latestMonth = this.latestExpense.month || this.latestExpense.date.slice(0, 7)
      
      try {
        // 从预算存储中获取该月份的预算统计数据
        this.budgetData = budgetStorage.getBudgetStats(latestMonth)
      } catch (error) {
        console.error('加载预算数据失败:', error)
        this.budgetData = null
      }
    },
    
    // 加载预算历史记录
    loadBudgetHistory() {
      try {
        this.budgetHistory = budgetStorage.getBudgetHistory()
      } catch (error) {
        console.error('加载预算历史记录失败:', error)
        this.budgetHistory = []
      }
    },
    
    // 处理删除预算记录
    handleDeleteBudget(id) {
      if (confirm('确定删除此预算记录?')) {
        try {
          budgetStorage.deleteBudgetHistoryRecord(id)
          this.loadBudgetHistory()
          alert('预算记录删除成功')
        } catch (e) {
          alert('删除失败: ' + e.message)
        }
      }
    },
    
    // 处理编辑预算记录
    handleEditBudget(record) {
      this.isEditingBudget = true
      this.editingBudgetRecord = record
      this.editBudgetFormData = {
        month: record.month,
        category: record.category,
        newAmount: record.newAmount
      }
    },
    
    // 处理更新预算记录
    handleUpdateBudget() {
      try {
        budgetStorage.updateBudgetHistoryRecord(this.editingBudgetRecord.id, {
          newAmount: this.editBudgetFormData.newAmount
        })
        this.loadBudgetHistory()
        this.cancelEditBudget()
        alert('预算记录更新成功')
      } catch (e) {
        alert('更新失败: ' + e.message)
      }
    },
    
    // 取消编辑预算记录
    cancelEditBudget() {
      this.isEditingBudget = false
      this.editingBudgetRecord = null
      this.editBudgetFormData = {
        month: '',
        category: '',
        newAmount: 0
      }
    },
    
    // 计算年度指定分类总支出
    calculateYearlyCategory(category) {
      return this.expensesBySelectedYear.reduce((sum, record) => sum + (record[category] || 0), 0)
    },
    
    // 计算年度总支出
    calculateYearlyTotal() {
      return this.expensesBySelectedYear.reduce((sum, record) => sum + record.total, 0)
    },
    
    // 计算年度必须消费总额
    calculateYearlyNecessaryExpense() {
      return this.expensesBySelectedYear.reduce((sum, record) => {
        return sum + (record.food || 0) + (record.gifts || 0) + (record.medicalInsurance || 0) + (record.transport || 0) + (record.housingUtilities || 0)
      }, 0)
    },
    
    // 计算年度可选消费总额
    calculateYearlyDiscretionaryExpense() {
      return this.expensesBySelectedYear.reduce((sum, record) => {
        return sum + (record.entertainment || 0) + (record.dailyNecessities || 0) + (record.clothing || 0) + (record.pets || 0) + (record.travel || 0)
      }, 0)
    },
    
    // 计算月度必须消费总额
    calculateMonthlyNecessaryExpense(monthlyExpense) {
      return monthlyExpense.food + monthlyExpense.gifts + monthlyExpense.medicalInsurance + monthlyExpense.transport + monthlyExpense.housingUtilities
    },
    
    // 计算月度可选消费总额
    calculateMonthlyDiscretionaryExpense(monthlyExpense) {
      return monthlyExpense.entertainment + monthlyExpense.dailyNecessities + monthlyExpense.clothing + monthlyExpense.pets + monthlyExpense.travel
    },
    
    // 获取分类名称
    getCategoryName(category) {
      const categoryMap = {
        food: '餐饮',
        gifts: '人情',
        medicalInsurance: '医疗保险',
        transport: '交通',
        housingUtilities: '居住水电',
        entertainment: '娱乐',
        dailyNecessities: '生活用品',
        clothing: '服装',
        pets: '宠物',
        travel: '旅行'
      }
      return categoryMap[category] || category
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.yearly-summary {
  margin-bottom: 30px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.summary-table th,
.summary-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: right;
}

.summary-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}

.summary-table td:first-child {
  text-align: center;
  font-weight: bold;
}

.summary-table .total {
  font-weight: bold;
  color: #ff4d4f;
}

.expense-chart {
  margin-bottom: 30px;
}

.chart-container {
  height: 400px;
  width: 100%;
  margin-top: 10px;
}

.ratio-analysis {
  margin-bottom: 30px;
}

.ratio-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.ratio-table th,
.ratio-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: right;
}

.ratio-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}

.ratio-table td:first-child {
  text-align: center;
  font-weight: bold;
}

.ratio-bar {
  height: 20px;
  border-radius: 4px;
  margin: 0 auto;
}

.ratio-bar.food { background-color: #ff7875; }
.ratio-bar.gifts { background-color: #ffa940; }
.ratio-bar.medicalInsurance { background-color: #5cdbd3; }
.ratio-bar.transport { background-color: #b37feb; }
.ratio-bar.housingUtilities { background-color: #73d13d; }
.ratio-bar.entertainment { background-color: #ffc53d; }
.ratio-bar.dailyNecessities { background-color: #87ceeb; }
.ratio-bar.clothing { background-color: #ff85c0; }
.ratio-bar.pets { background-color: #95de64; }
.ratio-bar.travel { background-color: #ff7575; }
.ratio-bar.necessary { background-color: #1890ff; }
.ratio-bar.discretionary { background-color: #52c41a; }

.over-budget {
  color: #ff4d4f;
  font-weight: bold;
}

.subtotal-row {
  font-weight: bold;
}

.subtotal-row:nth-child(6) {
  background-color: #e6f7ff;
}

.subtotal-row:nth-child(12) {
  background-color: #f6ffed;
}

.total-row {
  font-weight: bold;
  background-color: #f5f5f5;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999;
  background-color: #fafafa;
  border-radius: 4px;
}
</style>