<template>
  <div class="container">
    <h2>资产比例分析</h2>
    
    <div v-if="!latestRecord" class="no-data">
      暂无资产记录，请先添加记录
    </div>
    
    <div v-else class="ratio-table-container">
      <table class="ratio-table">
        <thead>
          <tr>
            <th>资产类型</th>
            <th>金额 (元)</th>
            <th>占比</th>
            <th>比例图示</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="asset-type">活钱</td>
            <td class="asset-amount">{{ (latestRecord.liveMoney || 0).toFixed(2) }}</td>
            <td class="asset-ratio">{{ calculateRatio(latestRecord.liveMoney, totalAsset).toFixed(2) }}%</td>
            <td class="ratio-bar-container">
              <div class="ratio-bar live" :style="{ width: calculateRatio(latestRecord.liveMoney, totalAsset) + '%' }"></div>
            </td>
          </tr>
          <tr>
            <td class="asset-type">长期投资</td>
            <td class="asset-amount">{{ (latestRecord.investMoney || 0).toFixed(2) }}</td>
            <td class="asset-ratio">{{ calculateRatio(latestRecord.investMoney, totalAsset).toFixed(2) }}%</td>
            <td class="ratio-bar-container">
              <div class="ratio-bar invest" :style="{ width: calculateRatio(latestRecord.investMoney, totalAsset) + '%' }"></div>
            </td>
          </tr>
          <tr>
            <td class="asset-type">稳定债券</td>
            <td class="asset-amount">{{ (latestRecord.bondMoney || 0).toFixed(2) }}</td>
            <td class="asset-ratio">{{ calculateRatio(latestRecord.bondMoney, totalAsset).toFixed(2) }}%</td>
            <td class="ratio-bar-container">
              <div class="ratio-bar bond" :style="{ width: calculateRatio(latestRecord.bondMoney, totalAsset) + '%' }"></div>
            </td>
          </tr>
          <tr class="total-row">
            <td class="asset-type">总资产</td>
            <td class="asset-amount">{{ totalAsset.toFixed(2) }}</td>
            <td class="asset-ratio">100.00%</td>
            <td class="ratio-bar-container">
              <div class="ratio-bar total" style="width: 100%"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssetRatioTable',
  props: {
    latestRecord: Object
  },
  computed: {
    totalAsset() {
      if (!this.latestRecord) return 0
      const liveMoney = parseFloat(this.latestRecord.liveMoney) || 0
      const investMoney = parseFloat(this.latestRecord.investMoney) || 0
      const bondMoney = parseFloat(this.latestRecord.bondMoney) || 0
      return liveMoney + investMoney + bondMoney
    }
  },
  methods: {
    calculateRatio(asset, total) {
      if (!asset || !total) return 0
      return (parseFloat(asset) / total) * 100
    }
  }
}
</script>

<style scoped>
.container {
  margin: 20px 0;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 16px;
}

.ratio-table-container {
  overflow-x: auto;
}

.ratio-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.ratio-table th,
.ratio-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.ratio-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #555;
}

.asset-type {
  font-weight: bold;
}

.asset-amount {
  text-align: right;
  font-family: monospace;
}

.asset-ratio {
  text-align: center;
  font-weight: bold;
}

.ratio-bar-container {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.ratio-bar {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.ratio-bar.live {
  background-color: #4caf50;
}

.ratio-bar.invest {
  background-color: #2196f3;
}

.ratio-bar.bond {
  background-color: #ff9800;
}

.ratio-bar.total {
  background-color: #9c27b0;
  opacity: 0.7;
}

.total-row {
  background-color: #fafafa;
  font-weight: bold;
}

.total-row td {
  color: #333;
}
</style>