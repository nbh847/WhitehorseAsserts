class StockApi {
  constructor() {
    // 后端API基础URL
    this.baseUrl = 'http://localhost:5001/api/stocks';
    
    // 本地股票数据缓存 - 用于API调用失败时的降级处理
    this.stockCache = {};
  }

  // 获取完整的股票数据（当前价格 + 移动平均线）
  async getCompleteStockData(symbol) {
    try {
      // 清理股票代码，移除sh/sz前缀和任何后缀
      const cleanSymbol = symbol.replace(/^(sh|sz)/, '').replace(/\..*$/, '');
      
      // 先检查缓存
      const cacheKey = `stock_${cleanSymbol}`;
      
      if (this.stockCache[cacheKey] && Date.now() - this.stockCache[cacheKey].timestamp < 60000) { // 1分钟缓存
        console.log('使用缓存的完整股票数据');
        return this.stockCache[cacheKey].data;
      }
      
      console.log(`开始获取完整股票数据: ${symbol}`);
      
      // 调用后端API获取真实股票数据
      const url = `${this.baseUrl}/real-time/${cleanSymbol}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const stockData = await response.json();
      console.log('获取到完整股票数据:', stockData);
      
      // 缓存数据
      this.stockCache[cacheKey] = {
        data: stockData,
        timestamp: Date.now()
      };
      
      return stockData;
    } catch (error) {
      console.error('获取完整股票数据失败:', error.message);
      console.error('股票代码:', symbol);
      console.error('完整错误信息:', error);
      
      // 如果有缓存数据，使用缓存
      const cacheKey = `stock_${cleanSymbol}`;
      
      if (this.stockCache[cacheKey]) {
        console.log('使用过期的缓存股票数据');
        return this.stockCache[cacheKey].data;
      }
      
      throw new Error('API返回了错误信息或无法获取股票数据');
    }
  }
}

export default new StockApi();
