<template>
  <div class="container">
    <h2>资产变化趋势</h2>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'AssetChart',
  props: {
    records: Array
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  watch: {
    records: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef)
      this.updateChart()
    },
    updateChart() {
      if (!this.chart || this.records.length === 0) return

      // 按日期排序
      const sortedRecords = [...this.records].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // 准备数据
      const dates = sortedRecords.map(record => record.date)
      const liveMoney = sortedRecords.map(record => record.liveMoney)
      const investMoney = sortedRecords.map(record => record.investMoney)
      const bondMoney = sortedRecords.map(record => record.bondMoney)
      const totalMoney = sortedRecords.map(record => record.liveMoney + record.investMoney + record.bondMoney)

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
          data: ['活钱', '长期投资', '稳定债券', '总资产'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
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
          {
            name: '活钱',
            type: 'line',
            data: liveMoney,
            smooth: true,
            itemStyle: {
              color: '#1976d2'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(25, 118, 210, 0.3)' },
                { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
              ])
            }
          },
          {
            name: '长期投资',
            type: 'line',
            data: investMoney,
            smooth: true,
            itemStyle: {
              color: '#388e3c'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(56, 142, 60, 0.3)' },
                { offset: 1, color: 'rgba(56, 142, 60, 0.1)' }
              ])
            }
          },
          {
            name: '稳定债券',
            type: 'line',
            data: bondMoney,
            smooth: true,
            itemStyle: {
              color: '#f57c00'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 124, 0, 0.3)' },
                { offset: 1, color: 'rgba(245, 124, 0, 0.1)' }
              ])
            }
          },
          {
            name: '总资产',
            type: 'line',
            data: totalMoney,
            smooth: true,
            itemStyle: {
              color: '#9c27b0'
            },
            lineStyle: {
              width: 3
            }
          }
        ]
      }

      this.chart.setOption(option)
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>