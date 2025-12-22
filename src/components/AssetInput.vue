<template>
  <div class="container">
    <h2>资产输入</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="liveMoney">活钱</label>
        <input 
          type="number" 
          id="liveMoney" 
          v-model.number="formData.liveMoney" 
          placeholder="请输入活钱金额"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="investMoney">长期投资</label>
        <input 
          type="number" 
          id="investMoney" 
          v-model.number="formData.investMoney" 
          placeholder="请输入长期投资金额"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="bondMoney">稳定债券</label>
        <input 
          type="number" 
          id="bondMoney" 
          v-model.number="formData.bondMoney" 
          placeholder="请输入稳定债券金额"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <button type="submit" class="btn btn-primary">保存资产记录</button>
    </form>
    
    <div v-if="latestRecord" class="total-asset">
      最新总资产: {{ calculateTotal(latestRecord) }} 元
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssetInput',
  props: {
    latestRecord: Object
  },
  data() {
    return {
      formData: {
        liveMoney: 0,
        investMoney: 0,
        bondMoney: 0
      }
    }
  },
  mounted() {
    // 当有最新记录时，自动填充表单为上一次的值
    if (this.latestRecord) {
      this.formData.liveMoney = this.latestRecord.liveMoney || 0
      this.formData.investMoney = this.latestRecord.investMoney || 0
      this.formData.bondMoney = this.latestRecord.bondMoney || 0
    }
  },
  methods: {
    handleSubmit() {
      // 确保所有值都被转换为数字，默认为0
      const sanitizedData = {
        liveMoney: parseFloat(this.formData.liveMoney) || 0,
        investMoney: parseFloat(this.formData.investMoney) || 0,
        bondMoney: parseFloat(this.formData.bondMoney) || 0
      }
      
      // 验证至少有一个资产金额大于0
      if (sanitizedData.liveMoney === 0 && sanitizedData.investMoney === 0 && sanitizedData.bondMoney === 0) {
        alert('请至少输入一个大于0的资产金额')
        return
      }
      
      this.$emit('addRecord', sanitizedData)
      // 清空表单
      this.formData = {
        liveMoney: 0,
        investMoney: 0,
        bondMoney: 0
      }
    },
    calculateTotal(record) {
      return (record.liveMoney + record.investMoney + record.bondMoney).toFixed(2)
    }
  }
}
</script>