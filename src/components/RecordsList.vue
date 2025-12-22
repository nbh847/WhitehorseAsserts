<template>
  <div class="container">
    <h2>资产记录历史</h2>
    
    <div v-if="records.length === 0" style="text-align: center; color: #999; padding: 30px;">
      暂无资产记录，请先添加记录
    </div>
    
    <div v-else class="records-list">
      <div v-for="record in sortedRecords" :key="record.id" class="record-item">
        <div class="record-info">
          <span class="record-date">{{ record.date }}</span>
          <span>
            活钱: <span class="asset-type live">{{ (record.liveMoney || 0).toFixed(2) }}</span>
          </span>
          <span>
            长期投资: <span class="asset-type invest">{{ (record.investMoney || 0).toFixed(2) }}</span>
          </span>
          <span>
            稳定债券: <span class="asset-type bond">{{ (record.bondMoney || 0).toFixed(2) }}</span>
          </span>
          <span>
            总资产: <strong>{{ calculateTotal(record).toFixed(2) }}</strong>
          </span>
        </div>
        <button class="btn btn-danger" @click="handleDelete(record.id)">
          删除
        </button>
      </div>
    </div>
    
    <div v-if="records.length > 0" style="margin-top: 20px; text-align: right;">
      <button class="btn btn-danger" @click="handleClearAll">
        清空所有记录
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordsList',
  props: {
    records: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    sortedRecords() {
      return [...this.records].sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  },
  methods: {
    handleDelete(id) {
      if (confirm('确定要删除这条记录吗？')) {
        this.$emit('delete', id)
      }
    },
    handleClearAll() {
      if (confirm('确定要清空所有记录吗？此操作不可恢复！')) {
        this.$emit('clearAll')
      }
    },
    calculateTotal(record) {
      const liveMoney = parseFloat(record.liveMoney) || 0
      const investMoney = parseFloat(record.investMoney) || 0
      const bondMoney = parseFloat(record.bondMoney) || 0
      return liveMoney + investMoney + bondMoney
    }
  }
}
</script>