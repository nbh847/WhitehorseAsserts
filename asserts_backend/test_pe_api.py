import requests
import json

# 测试股票代码（三一重工）
stock_code = "600031"
url = f"http://192.3.252.100:5001/api/stocks/real-time/{stock_code}"

print(f"Testing API: {url}")

response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    print(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"\nPE: {data.get('pe')}")
    print(f"PB: {data.get('pb')}")
    print(f"Total Share Capital: {data.get('totalShareCapital')}")
else:
    print(f"API request failed with status code: {response.status_code}")
    print(f"Error message: {response.text}")
