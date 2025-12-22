import requests

# 测试调用股票实时数据API
try:
    stock_code = "600031"
    url = f"http://localhost:5001/api/stocks/real-time/{stock_code}"
    print(f"正在调用API: {url}")
    
    response = requests.get(url)
    response.raise_for_status()
    
    data = response.json()
    print(f"\nAPI响应结果:")
    print(f"股票代码: {data.get('symbol')}")
    print(f"股票名称: {data.get('name')}")
    print(f"当前价格: {data.get('currentPrice')}")
    print(f"PE: {data.get('pe')}")
    print(f"PB: {data.get('pb')}")
    print(f"总市值: {data.get('totalMarketValue')}")
    print(f"总股本: {data.get('totalShareCapital')}")
    print(f"股息率: {data.get('dividendYield')}")
    
    if data.get('pe') == 0:
        print("\n警告: PE值为0，数据获取可能存在问题")
        
except Exception as e:
    print(f"发生错误: {e}")
    import traceback
    traceback.print_exc()
