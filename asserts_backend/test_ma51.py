import akshare as ak

# 设置代理（如果需要）
# ak.set_global_proxy("http://127.0.0.1:7890")

# 测试获取K线数据
try:
    # 获取贵州茅台的K线数据（日线），获取更长的时间范围以计算850日均线
    stock_data = ak.stock_zh_a_hist(symbol="600519", period="daily", start_date="20200101", end_date="20251220", adjust="qfq")
    print("K线数据获取成功:")
    print(f"数据行数: {len(stock_data)}")
    print(stock_data.tail())
    
    # 计算51日均线
    if len(stock_data) >= 51:
        ma51 = stock_data['收盘'].rolling(window=51).mean().iloc[-1]
        print(f"51日均线: {ma51}")
    else:
        print("数据不足51天，无法计算51日均线")
    
    # 计算850日均线
    if len(stock_data) >= 850:
        ma850 = stock_data['收盘'].rolling(window=850).mean().iloc[-1]
        print(f"850日均线: {ma850}")
    else:
        print("数据不足850天，无法计算850日均线")
        
except Exception as e:
    print(f"获取数据失败: {e}")

