from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import requests
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv

# 加载.env配置文件
load_dotenv()

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 数据存储目录
DATA_DIR = os.path.join(os.path.dirname(__file__), os.getenv('DATA_DIR', 'data'))
os.makedirs(DATA_DIR, exist_ok=True)

# 数据文件路径
ASSET_FILE = os.path.join(DATA_DIR, 'asset_records.json')
STOCK_FILE = os.path.join(DATA_DIR, 'blue_chip_stocks.json')
EXPENSE_FILE = os.path.join(DATA_DIR, 'expense_records.json')
RANDOM_WALK_FILE = os.path.join(DATA_DIR, 'random_walk_records.json')
RANDOM_WALK_METADATA_FILE = os.path.join(DATA_DIR, 'random_walk_metadata.json')
BLOG_FILE = os.path.join(DATA_DIR, 'blog_records.json')
BLOG_METADATA_FILE = os.path.join(DATA_DIR, 'blog_metadata.json')
BUDGET_FILE = os.path.join(DATA_DIR, 'budget_settings.json')
BUDGET_HISTORY_FILE = os.path.join(DATA_DIR, 'budget_history.json')

# 读取JSON文件数据
def read_json_file(file_path, max_retries=3, retry_delay=1):
    for attempt in range(max_retries):
        try:
            if os.path.exists(file_path):
                print(f"Reading file: {file_path} (attempt {attempt + 1})")
                print(f"File exists: {os.path.exists(file_path)}")
                print(f"File size: {os.path.getsize(file_path)} bytes")
                
                # 使用更安全的方式打开文件
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    print(f"File content length: {len(content)} bytes")
                    
                    if not content:
                        print("File is empty")
                        return []
                    
                    # 尝试解析JSON
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError as json_err:
                        print(f"JSON decode error on attempt {attempt + 1}: {str(json_err)}")
                        print(f"First 50 chars: {content[:50]}")
                        print(f"Last 50 chars: {content[-50:]}")
                        
                        # 尝试清理内容
                        cleaned_content = content.strip()
                        if not cleaned_content:
                            return []
                        
                        # 如果是简单的JSON数组格式问题，尝试修复
                        if cleaned_content.startswith('[') and not cleaned_content.endswith(']'):
                            cleaned_content += ']'
                            print(f"Fixed JSON by adding closing bracket")
                            return json.loads(cleaned_content)
                        elif cleaned_content.startswith('{') and not cleaned_content.endswith('}'):
                            cleaned_content += '}'
                            print(f"Fixed JSON by adding closing brace")
                            return json.loads(cleaned_content)
                        
                        # 如果修复失败，继续重试
                        raise
            print(f"File not found: {file_path}")
            return []
        except Exception as e:
            print(f"Error reading file {file_path} on attempt {attempt + 1}: {str(e)}")
            print(f"Exception type: {type(e).__name__}")
            
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} second(s)...")
                import time
                time.sleep(retry_delay)
            else:
                print(f"Max retries exceeded for file: {file_path}")
                import traceback
                traceback.print_exc()
                return []
    
    # 理论上不会到达这里，但为了安全返回空列表
    return []

# 写入JSON文件数据
def write_json_file(file_path, data):
    try:
        # 使用os模块确保目录存在
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # 使用更安全的写入方式，先写入临时文件，再重命名
        temp_file = file_path + '.tmp'
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 原子性重命名，确保文件完整性
        if os.path.exists(file_path):
            os.remove(file_path)
        os.rename(temp_file, file_path)
        
        print(f"Successfully wrote to file: {file_path}")
    except Exception as e:
        print(f"Error writing to file {file_path}: {str(e)}")
        print(f"Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise

# 资产记录API

# 获取所有资产记录
@app.route('/api/assets', methods=['GET'])
def get_assets():
    assets = read_json_file(ASSET_FILE)
    return jsonify(assets)

# 添加资产记录
@app.route('/api/assets', methods=['POST'])
def add_asset():
    assets = read_json_file(ASSET_FILE)
    data = request.get_json()
    
    new_asset = {
        **data,
        'id': str(datetime.now().timestamp()),  # 生成唯一ID
        'date': datetime.now().strftime('%Y-%m-%d')  # 格式化为YYYY-MM-DD
    }
    
    assets.append(new_asset)
    # 按日期排序
    assets.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))
    
    write_json_file(ASSET_FILE, assets)
    return jsonify(assets)

# 删除资产记录
@app.route('/api/assets/<id>', methods=['DELETE'])
def delete_asset(id):
    assets = read_json_file(ASSET_FILE)
    assets = [asset for asset in assets if asset['id'] != id]
    
    write_json_file(ASSET_FILE, assets)
    return jsonify(assets)

# 清空所有资产记录
@app.route('/api/assets', methods=['DELETE'])
def clear_assets():
    write_json_file(ASSET_FILE, [])
    return jsonify([])

# 获取最新资产记录
@app.route('/api/assets/latest', methods=['GET'])
def get_latest_asset():
    assets = read_json_file(ASSET_FILE)
    if assets:
        return jsonify(assets[-1])
    return jsonify(None)

# 股票数据API

# 获取所有股票数据
@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    stocks = read_json_file(STOCK_FILE)
    return jsonify(stocks)

# 添加股票数据
@app.route('/api/stocks', methods=['POST'])
def add_stock():
    stocks = read_json_file(STOCK_FILE)
    data = request.get_json()
    
    new_stock = {
        **data,
        'id': str(datetime.now().timestamp()),  # 生成唯一ID
        'addedAt': datetime.now().isoformat()
    }
    
    stocks.append(new_stock)
    write_json_file(STOCK_FILE, stocks)
    return jsonify(stocks)

# 删除股票数据
@app.route('/api/stocks/<id>', methods=['DELETE'])
def delete_stock(id):
    stocks = read_json_file(STOCK_FILE)
    stocks = [stock for stock in stocks if stock['id'] != id]
    
    write_json_file(STOCK_FILE, stocks)
    return jsonify(stocks)

# 更新股票数据
@app.route('/api/stocks/<id>', methods=['PUT'])
def update_stock(id):
    stocks = read_json_file(STOCK_FILE)
    data = request.get_json()
    
    for i, stock in enumerate(stocks):
        if stock['id'] == id:
            stocks[i] = {
                **stock,
                **data
            }
            break
    
    write_json_file(STOCK_FILE, stocks)
    return jsonify(stocks)

# 清空所有股票数据
@app.route('/api/stocks', methods=['DELETE'])
def clear_stocks():
    write_json_file(STOCK_FILE, [])
    return jsonify([])

# 获取实时股票数据
@app.route('/api/stocks/real-time/<symbol>', methods=['GET'])
def get_real_time_stock_data(symbol):
    try:
        # 设置请求头
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 验证是否为A股代码（纯数字）
        if not symbol.isdigit():
            return jsonify({'error': 'Only A-share stock codes are supported'}), 400
        
        # A股代码转换
        if symbol.startswith('6') or symbol.startswith('5'):
            # 沪市股票(6开头)和沪市ETF(5开头)
            symbol = f'sh{symbol}'
        else:
            # 深市股票(0开头)和深市ETF(1开头)
            symbol = f'sz{symbol}'
        
        # 1. 获取实时报价
        # 使用腾讯财经接口获取A股实时报价
        quote_url = f"http://qt.gtimg.cn/q={symbol}"
        quote_response = requests.get(quote_url, headers=headers)
        quote_response.raise_for_status()
        
        # 解析腾讯财经实时报价数据
        quote_data = quote_response.text
        quote_info = quote_data.split('~')
        
        if len(quote_info) < 40:
            return jsonify({'error': 'Stock not found'}), 404
        
        # 构建A股基本结果
        result = {
            'symbol': symbol,
            'name': quote_info[1],  # 股票名称
            'currentPrice': float(quote_info[3]) if quote_info[3] != '' else 0,  # 当前价格
            'open': float(quote_info[5]) if quote_info[5] != '' else 0,  # 开盘价
            'high': float(quote_info[33]) if quote_info[33] != '' else 0,  # 最高价
            'low': float(quote_info[34]) if quote_info[34] != '' else 0,  # 最低价
            'previousClose': float(quote_info[4]) if quote_info[4] != '' else 0,  # 昨收价
            'volume': int(quote_info[36]) if quote_info[36] != '' else 0  # 成交量
        }
        
        # 3. 使用AkShare获取更多基本面数据（PE、PB、总市值等）
        try:
            # 获取所有A股的实时数据
            print(f"Fetching A-share data for {symbol}")
            a_share_data = ak.stock_zh_a_spot_em()
            print(f"A-share data columns: {a_share_data.columns.tolist()}")
            
            # 获取股票代码（去掉sh/sz前缀）
            stock_code = symbol[2:]
            print(f"Looking for stock code: {stock_code}")
            
            # 根据股票代码筛选出对应的股票数据
            stock_fundamental = a_share_data[a_share_data['代码'] == stock_code]
            print(f"Stock fundamental data found: {not stock_fundamental.empty}")
            
            if not stock_fundamental.empty:
                # 提取基本面数据
                stock_fundamental = stock_fundamental.iloc[0]
                print(f"Stock fundamental data: {stock_fundamental.to_dict()}")
                
                # 添加基本面数据到结果中
                # 检查字段是否存在
                if '市盈率-动态' in stock_fundamental:
                    result['pe'] = float(stock_fundamental['市盈率-动态']) if stock_fundamental['市盈率-动态'] != '-' else 0
                    print(f"PE value: {result['pe']}")
                else:
                    result['pe'] = 0
                    print("'市盈率-动态' field not found")
                
                if '市净率' in stock_fundamental:
                    result['pb'] = float(stock_fundamental['市净率']) if stock_fundamental['市净率'] != '-' else 0
                    print(f"PB value: {result['pb']}")
                else:
                    result['pb'] = 0
                    print("'市净率' field not found")
                
                if '总市值' in stock_fundamental:
                    result['totalMarketValue'] = float(stock_fundamental['总市值']) if stock_fundamental['总市值'] != '-' else 0
                    print(f"Total Market Value: {result['totalMarketValue']}")
                else:
                    result['totalMarketValue'] = 0
                    print("'总市值' field not found")
                
                if '流通市值' in stock_fundamental:
                    result['circulationMarketValue'] = float(stock_fundamental['流通市值']) if stock_fundamental['流通市值'] != '-' else 0
                    print(f"Circulation Market Value: {result['circulationMarketValue']}")
                else:
                    result['circulationMarketValue'] = 0
                    print("'流通市值' field not found")
                
                # 计算总股本（总市值单位是元，总股本=总市值/当前价格）
                current_price = result['currentPrice']
                print(f"Current price: {current_price}")
                if current_price > 0 and result['totalMarketValue'] > 0:
                    # 总市值是元，当前价格是元/股，所以总股本 = 总市值 / 当前价格
                    result['totalShareCapital'] = round(result['totalMarketValue'] / current_price, 2)
                    print(f"Total Share Capital: {result['totalShareCapital']}")
                else:
                    result['totalShareCapital'] = 0
                    print("Cannot calculate total share capital: current price or total market value is 0")
                
                # 尝试获取股息率数据
                try:
                    # 获取所有股票的分红数据
                    dividend_data = ak.stock_history_dividend()
                    if not dividend_data.empty:
                        # 根据股票代码筛选
                        stock_dividend = dividend_data[dividend_data['代码'] == stock_code]
                        if not stock_dividend.empty:
                            stock_dividend = stock_dividend.iloc[0]
                            
                            # 初始化年均股息
                            annual_dividend = 0
                            
                            # 首先尝试获取年均股息
                            if '年均股息' in stock_dividend and stock_dividend['年均股息'] != '-':
                                annual_dividend = float(stock_dividend['年均股息'])
                            
                            # 然后检查累计股息和上市日期，如果年均股息不合理则使用累计股息计算
                            cumulative_dividend = 0
                            years_listed = 0
                            
                            if '累计股息' in stock_dividend and stock_dividend['累计股息'] != '-':
                                cumulative_dividend = float(stock_dividend['累计股息'])
                            
                            if '上市日期' in stock_dividend:
                                try:
                                    listing_date = datetime.strptime(stock_dividend['上市日期'], '%Y-%m-%d')
                                    years_listed = (datetime.now() - listing_date).days / 365.25
                                except ValueError:
                                    print(f"Invalid listing date format: {stock_dividend['上市日期']}")
                            
                            # 检查年均股息是否合理
                            # 如果年均股息为0，或者超过当前股价的10%（更严格的阈值），则使用累计股息计算
                            if annual_dividend == 0 or (result['currentPrice'] > 0 and annual_dividend > result['currentPrice'] * 0.1):
                                if cumulative_dividend > 0 and years_listed > 0:
                                    annual_dividend = cumulative_dividend / years_listed
                                    print(f"Adjusted annual dividend: {annual_dividend} (from cumulative {cumulative_dividend} over {years_listed:.1f} years)")
                            
                            # 计算股息率
                            if result['currentPrice'] > 0:
                                result['dividendYield'] = round((annual_dividend / result['currentPrice']) * 100, 2)
                            else:
                                result['dividendYield'] = 0
                            
                            print(f"Dividend Yield: {result['dividendYield']}%")
                        else:
                            result['dividendYield'] = 0
                            print(f"No dividend data found for stock code {stock_code}")
                    else:
                        result['dividendYield'] = 0
                        print("No dividend data found")
                except Exception as e:
                    print(f"Error fetching dividend data: {e}")
                    import traceback
                    traceback.print_exc()
                    result['dividendYield'] = 0
        except Exception as e:
            print(f"Error fetching fundamental data for {symbol}: {e}")
            import traceback
            traceback.print_exc()
            # 如果获取基本面数据失败，设置默认值
            result['pe'] = 0
            result['pb'] = 0
            result['totalMarketValue'] = 0
            result['circulationMarketValue'] = 0
            result['totalShareCapital'] = 0
            result['dividendYield'] = 0
        
        # 2. 使用AkShare获取K线数据并计算移动平均线
        try:
            # 获取最新数据，结束日期设为当前日期
            end_date = datetime.now().strftime("%Y%m%d")
            
            # A股使用stock_zh_a_hist接口
            ak_symbol = symbol[2:]
            stock_data = ak.stock_zh_a_hist(
                symbol=ak_symbol,
                period="daily",
                start_date="20150101",
                end_date=end_date,
                adjust="qfq"
            )
            
            if not stock_data.empty:
                # 计算各种移动平均线
                if len(stock_data) >= 51:
                    stock_data['ma51'] = stock_data['收盘'].rolling(window=51).mean()
                    result['ma51'] = round(stock_data['ma51'].iloc[-1], 2)
                else:
                    result['ma51'] = 0
                    
                if len(stock_data) >= 120:
                    stock_data['ma120'] = stock_data['收盘'].rolling(window=120).mean()
                    result['ma120'] = round(stock_data['ma120'].iloc[-1], 2)
                else:
                    result['ma120'] = 0
                    
                if len(stock_data) >= 250:
                    stock_data['ma250'] = stock_data['收盘'].rolling(window=250).mean()
                    result['ma250'] = round(stock_data['ma250'].iloc[-1], 2)
                else:
                    result['ma250'] = 0
                    
                if len(stock_data) >= 850:
                    stock_data['ma850'] = stock_data['收盘'].rolling(window=850).mean()
                    result['ma850'] = round(stock_data['ma850'].iloc[-1], 2)
                else:
                    result['ma850'] = 0
            else:
                # 如果没有获取到K线数据，所有均线值设为0
                result['ma51'] = 0
                result['ma120'] = 0
                result['ma250'] = 0
                result['ma850'] = 0
                
        except Exception as e:
            print(f"Error using AkShare for {symbol}: {e}")
            # 如果AkShare调用失败，所有均线值设为0
            result['ma51'] = 0
            result['ma120'] = 0
            result['ma250'] = 0
            result['ma850'] = 0
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error fetching real-time stock data for {symbol}: {e}")
        return jsonify({'error': 'Failed to fetch real-time stock data'}), 500

# 生活费记录API

# 获取所有生活费记录
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = read_json_file(EXPENSE_FILE)
    return jsonify(expenses)

# 添加生活费记录
@app.route('/api/expenses', methods=['POST'])
def add_expense():
    expenses = read_json_file(EXPENSE_FILE)
    data = request.get_json()
    
    # 处理日期字段
    date = datetime.now().strftime('%Y-%m-%d')  # 默认当前日期
    if 'month' in data:
        year, month = data['month'].split('-')
        # 创建该月的最后一天作为日期
        date = datetime(int(year), int(month), 1).replace(day=28) + timedelta(days=4)
        date = date - timedelta(days=date.day)
        date = date.strftime('%Y-%m-%d')
    
    new_expense = {
        **data,
        'id': str(datetime.now().timestamp()),  # 生成唯一ID
        'date': date
    }
    
    expenses.append(new_expense)
    # 按日期排序
    expenses.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))
    
    write_json_file(EXPENSE_FILE, expenses)
    return jsonify(expenses)

# 删除生活费记录
@app.route('/api/expenses/<id>', methods=['DELETE'])
def delete_expense(id):
    expenses = read_json_file(EXPENSE_FILE)
    expenses = [expense for expense in expenses if expense['id'] != id]
    
    write_json_file(EXPENSE_FILE, expenses)
    return jsonify(expenses)

# 更新生活费记录
@app.route('/api/expenses/<id>', methods=['PUT'])
def update_expense(id):
    expenses = read_json_file(EXPENSE_FILE)
    data = request.get_json()
    
    # 处理日期字段
    if 'month' in data:
        year, month = data['month'].split('-')
        # 创建该月的最后一天作为日期
        date = datetime(int(year), int(month), 1).replace(day=28) + timedelta(days=4)
        date = date - timedelta(days=date.day)
        data['date'] = date.strftime('%Y-%m-%d')
    
    for i, expense in enumerate(expenses):
        if expense['id'] == id:
            expenses[i] = {
                **expense,
                **data
            }
            break
    
    # 按日期排序
    expenses.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))
    
    write_json_file(EXPENSE_FILE, expenses)
    return jsonify(expenses)

# 清空所有生活费记录
@app.route('/api/expenses', methods=['DELETE'])
def clear_expenses():
    write_json_file(EXPENSE_FILE, [])
    return jsonify([])

# 获取最新生活费记录
@app.route('/api/expenses/latest', methods=['GET'])
def get_latest_expense():
    expenses = read_json_file(EXPENSE_FILE)
    if expenses:
        return jsonify(expenses[-1])
    return jsonify(None)

# 随机漫步记录API

# 获取所有随机漫步记录
@app.route('/api/random-walk', methods=['GET'])
def get_random_walk_records():
    records = read_json_file(RANDOM_WALK_FILE)
    return jsonify(records)

# 添加随机漫步记录
@app.route('/api/random-walk', methods=['POST'])
def add_random_walk_record():
    records = read_json_file(RANDOM_WALK_FILE)
    data = request.get_json()
    
    new_record = {
        **data,
        'id': str(datetime.now().timestamp()) + str(datetime.now().microsecond),
        'addedAt': datetime.now().isoformat(),
        'lastRecommendedAt': None
    }
    
    records.append(new_record)
    write_json_file(RANDOM_WALK_FILE, records)
    
    # 初始化元数据
    metadata = read_json_file(RANDOM_WALK_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    
    if 'recommendationCounts' not in metadata:
        metadata['recommendationCounts'] = {}
    if 'readCounts' not in metadata:
        metadata['readCounts'] = {}
    if 'readingTimes' not in metadata:
        metadata['readingTimes'] = {}
    
    metadata['recommendationCounts'][new_record['id']] = 0
    metadata['readCounts'][new_record['id']] = 0
    metadata['readingTimes'][new_record['id']] = []
    
    write_json_file(RANDOM_WALK_METADATA_FILE, metadata)
    
    return jsonify(records)

# 删除随机漫步记录
@app.route('/api/random-walk/<id>', methods=['DELETE'])
def delete_random_walk_record(id):
    records = read_json_file(RANDOM_WALK_FILE)
    records = [record for record in records if record['id'] != id]
    write_json_file(RANDOM_WALK_FILE, records)
    
    # 删除元数据
    metadata = read_json_file(RANDOM_WALK_METADATA_FILE)
    if metadata:
        if 'recommendationCounts' in metadata and id in metadata['recommendationCounts']:
            del metadata['recommendationCounts'][id]
        if 'readCounts' in metadata and id in metadata['readCounts']:
            del metadata['readCounts'][id]
        if 'readingTimes' in metadata and id in metadata['readingTimes']:
            del metadata['readingTimes'][id]
        if 'lastRecommendedId' in metadata and metadata['lastRecommendedId'] == id:
            metadata['lastRecommendedId'] = None
        write_json_file(RANDOM_WALK_METADATA_FILE, metadata)
    
    return jsonify(records)

# 更新随机漫步记录
@app.route('/api/random-walk/<id>', methods=['PUT'])
def update_random_walk_record(id):
    records = read_json_file(RANDOM_WALK_FILE)
    data = request.get_json()
    
    for i, record in enumerate(records):
        if record['id'] == id:
            records[i] = {
                **record,
                **data
            }
            break
    
    write_json_file(RANDOM_WALK_FILE, records)
    return jsonify(records)

# 获取随机推荐
@app.route('/api/random-walk/recommend', methods=['GET'])
def recommend_random_walk():
    records = read_json_file(RANDOM_WALK_FILE)
    if not records:
        return jsonify(None)
    
    metadata = read_json_file(RANDOM_WALK_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    
    if 'lastRecommendedId' not in metadata:
        metadata['lastRecommendedId'] = None
    if 'recommendationCounts' not in metadata:
        metadata['recommendationCounts'] = {}
    
    last_recommended_id = metadata['lastRecommendedId']
    
    # 选择与上次不同的记录
    available_records = [record for record in records if record['id'] != last_recommended_id]
    if not available_records:
        # 如果只有一个记录，只能推荐它
        available_records = records
    
    # 随机选择一个记录
    import random
    recommended_record = random.choice(available_records)
    
    # 更新元数据
    metadata['lastRecommendedId'] = recommended_record['id']
    
    if recommended_record['id'] not in metadata['recommendationCounts']:
        metadata['recommendationCounts'][recommended_record['id']] = 0
    metadata['recommendationCounts'][recommended_record['id']] += 1
    
    # 更新记录的最后推荐时间
    for i, record in enumerate(records):
        if record['id'] == recommended_record['id']:
            records[i]['lastRecommendedAt'] = datetime.now().isoformat()
            break
    
    write_json_file(RANDOM_WALK_FILE, records)
    write_json_file(RANDOM_WALK_METADATA_FILE, metadata)
    
    return jsonify(recommended_record)

# 获取元数据（推荐计数、已读计数、阅读时间）
@app.route('/api/random-walk/metadata', methods=['GET'])
def get_random_walk_metadata():
    metadata = read_json_file(RANDOM_WALK_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    return jsonify(metadata)

# 更新已读计数和阅读时间
@app.route('/api/random-walk/<id>/read', methods=['POST'])
def update_read_count(id):
    metadata = read_json_file(RANDOM_WALK_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    
    if 'readCounts' not in metadata:
        metadata['readCounts'] = {}
    if 'readingTimes' not in metadata:
        metadata['readingTimes'] = {}
    
    if id not in metadata['readCounts']:
        metadata['readCounts'][id] = 0
    metadata['readCounts'][id] += 1
    
    if id not in metadata['readingTimes']:
        metadata['readingTimes'][id] = []
    metadata['readingTimes'][id].append(datetime.now().isoformat())
    
    write_json_file(RANDOM_WALK_METADATA_FILE, metadata)
    return jsonify(metadata)

# 清空所有随机漫步记录
@app.route('/api/random-walk', methods=['DELETE'])
def clear_random_walk_records():
    write_json_file(RANDOM_WALK_FILE, [])
    write_json_file(RANDOM_WALK_METADATA_FILE, {
        'lastRecommendedId': None,
        'recommendationCounts': {},
        'readCounts': {},
        'readingTimes': {}
    })
    return jsonify([])

# 温故知新API

# 获取所有博客数据
@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    blogs = read_json_file(BLOG_FILE)
    return jsonify(blogs)

# 添加博客数据
@app.route('/api/blogs', methods=['POST'])
def add_blog():
    blogs = read_json_file(BLOG_FILE)
    data = request.get_json()
    
    new_blog = {
        **data,
        'id': str(datetime.now().timestamp()) + str(datetime.now().microsecond),
        'addedAt': datetime.now().isoformat(),
        'lastRecommendedAt': None
    }
    
    blogs.append(new_blog)
    write_json_file(BLOG_FILE, blogs)
    
    # 初始化元数据
    metadata = read_json_file(BLOG_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    
    if 'recommendationCounts' not in metadata:
        metadata['recommendationCounts'] = {}
    if 'readCounts' not in metadata:
        metadata['readCounts'] = {}
    if 'readingTimes' not in metadata:
        metadata['readingTimes'] = {}
    
    metadata['recommendationCounts'][new_blog['id']] = 0
    metadata['readCounts'][new_blog['id']] = 0
    metadata['readingTimes'][new_blog['id']] = []
    
    write_json_file(BLOG_METADATA_FILE, metadata)
    
    return jsonify(blogs)

# 删除博客数据
@app.route('/api/blogs/<id>', methods=['DELETE'])
def delete_blog(id):
    blogs = read_json_file(BLOG_FILE)
    blogs = [blog for blog in blogs if blog['id'] != id]
    write_json_file(BLOG_FILE, blogs)
    
    # 删除元数据
    metadata = read_json_file(BLOG_METADATA_FILE)
    if metadata:
        if 'recommendationCounts' in metadata and id in metadata['recommendationCounts']:
            del metadata['recommendationCounts'][id]
        if 'readCounts' in metadata and id in metadata['readCounts']:
            del metadata['readCounts'][id]
        if 'readingTimes' in metadata and id in metadata['readingTimes']:
            del metadata['readingTimes'][id]
        if 'lastRecommendedId' in metadata and metadata['lastRecommendedId'] == id:
            metadata['lastRecommendedId'] = None
        write_json_file(BLOG_METADATA_FILE, metadata)
    
    return jsonify(blogs)

# 获取随机推荐博客
@app.route('/api/blogs/recommend', methods=['GET'])
def recommend_blog():
    blogs = read_json_file(BLOG_FILE)
    if not blogs:
        return jsonify(None)
    
    metadata = read_json_file(BLOG_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    
    if 'lastRecommendedId' not in metadata:
        metadata['lastRecommendedId'] = None
    if 'recommendationCounts' not in metadata:
        metadata['recommendationCounts'] = {}
    
    last_recommended_id = metadata['lastRecommendedId']
    
    # 选择与上次不同的博客
    available_blogs = [blog for blog in blogs if blog['id'] != last_recommended_id]
    if not available_blogs:
        # 如果只有一个博客，只能推荐它
        available_blogs = blogs
    
    # 随机选择一个博客
    import random
    recommended_blog = random.choice(available_blogs)
    
    # 更新元数据
    metadata['lastRecommendedId'] = recommended_blog['id']
    
    if recommended_blog['id'] not in metadata['recommendationCounts']:
        metadata['recommendationCounts'][recommended_blog['id']] = 0
    metadata['recommendationCounts'][recommended_blog['id']] += 1
    
    # 更新博客的最后推荐时间
    for i, blog in enumerate(blogs):
        if blog['id'] == recommended_blog['id']:
            blogs[i]['lastRecommendedAt'] = datetime.now().isoformat()
            break
    
    write_json_file(BLOG_FILE, blogs)
    write_json_file(BLOG_METADATA_FILE, metadata)
    
    return jsonify(recommended_blog)

# 更新博客阅读信息
@app.route('/api/blogs/<id>/read', methods=['POST'])
def update_blog_read_info(id):
    metadata = read_json_file(BLOG_METADATA_FILE)
    if not metadata:
        metadata = {
            'lastRecommendedId': None,
            'recommendationCounts': {},
            'readCounts': {},
            'readingTimes': {}
        }
    
    if 'readCounts' not in metadata:
        metadata['readCounts'] = {}
    if 'readingTimes' not in metadata:
        metadata['readingTimes'] = {}
    
    if id not in metadata['readCounts']:
        metadata['readCounts'][id] = 0
    metadata['readCounts'][id] += 1
    
    if id not in metadata['readingTimes']:
        metadata['readingTimes'][id] = []
    metadata['readingTimes'][id].append(datetime.now().isoformat())
    
    write_json_file(BLOG_METADATA_FILE, metadata)
    return jsonify(metadata)

# 清空所有博客数据
@app.route('/api/blogs', methods=['DELETE'])
def clear_blogs():
    write_json_file(BLOG_FILE, [])
    write_json_file(BLOG_METADATA_FILE, {
        'lastRecommendedId': None,
        'recommendationCounts': {},
        'readCounts': {},
        'readingTimes': {}
    })
    return jsonify([])

# 预算管理API

# 获取所有预算设置
@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    budgets = read_json_file(BUDGET_FILE)
    if not budgets:
        # 返回默认预算结构
        return jsonify({
            'monthly': {},
            'default': {
                'necessary': {
                    'total': 0
                },
                'discretionary': {
                    'total': 0
                },
                'categories': {
                    'food': 0,  # 餐饮
                    'gifts': 0,  # 人情
                    'medicalInsurance': 0,  # 医疗保险
                    'transport': 0,  # 交通
                    'housingUtilities': 0,  # 居住水电
                    'entertainment': 0,  # 娱乐
                    'dailyNecessities': 0,  # 生活用品
                    'clothing': 0,  # 服装
                    'pets': 0,  # 宠物
                    'travel': 0  # 旅行
                },
                'total': 0
            }
        })
    return jsonify(budgets)

# 获取预算历史记录
@app.route('/api/budgets/history', methods=['GET'])
def get_budget_history():
    history = read_json_file(BUDGET_HISTORY_FILE)
    return jsonify(history)

# 设置月度预算
@app.route('/api/budgets', methods=['POST'])
def set_monthly_budget():
    budgets = read_json_file(BUDGET_FILE)
    if not budgets:
        budgets = {
            'monthly': {},
            'default': {
                'necessary': {
                    'total': 0
                },
                'discretionary': {
                    'total': 0
                },
                'categories': {
                    'food': 0,
                    'gifts': 0,
                    'medicalInsurance': 0,
                    'transport': 0,
                    'housingUtilities': 0,
                    'entertainment': 0,
                    'dailyNecessities': 0,
                    'clothing': 0,
                    'pets': 0,
                    'travel': 0
                },
                'total': 0
            }
        }
    
    data = request.get_json()
    month = data['month']
    category = data['category']
    amount = data['amount']
    
    # 必要消费类别
    necessaryCategories = ['food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities']
    categoryType = 'necessary' if category in necessaryCategories else 'discretionary'
    
    # 获取当前时间和月份
    currentDate = datetime.now()
    currentMonth = f"{currentDate.year}-{currentDate.month:02d}"
    
    # 初始化预算历史
    history = read_json_file(BUDGET_HISTORY_FILE)
    if not history:
        history = []
    
    if month < currentMonth:
        # 更新历史月份的预算
        if month not in budgets['monthly']:
            # 如果该月份没有预算记录，创建一个新的记录
            budgets['monthly'][month] = {
                'necessary': {
                    'total': budgets['default']['necessary']['total']
                },
                'discretionary': {
                    'total': budgets['default']['discretionary']['total']
                },
                'categories': budgets['default']['categories'].copy(),
                'total': budgets['default']['total'],
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
        
        # 记录旧金额
        oldAmount = budgets['monthly'][month]['categories'][category] if category in budgets['monthly'][month]['categories'] else 0
        
        # 更新分类预算
        budgets['monthly'][month]['categories'][category] = amount
        
        # 更新该月份的总预算
        necessaryTotal = sum(budgets['monthly'][month]['categories'][cat] for cat in necessaryCategories)
        discretionaryTotal = sum(budgets['monthly'][month]['categories'][cat] for cat in budgets['monthly'][month]['categories'] if cat not in necessaryCategories)
        budgets['monthly'][month]['necessary']['total'] = necessaryTotal
        budgets['monthly'][month]['discretionary']['total'] = discretionaryTotal
        budgets['monthly'][month]['total'] = necessaryTotal + discretionaryTotal
        
        # 更新更新时间
        budgets['monthly'][month]['updatedAt'] = datetime.now().isoformat()
        
        # 记录预算变更历史
        history.append({
            'id': str(datetime.now().timestamp()),
            'month': month,
            'category': category,
            'oldAmount': oldAmount,
            'newAmount': amount,
            'timestamp': datetime.now().isoformat(),
            'type': 'historical_budget_change'
        })
    else:
        # 更新默认预算（影响当前及未来月份）
        oldAmount = budgets['default']['categories'][category] if category in budgets['default']['categories'] else 0
        
        # 更新分类预算
        budgets['default']['categories'][category] = amount
        
        # 更新默认总预算
        necessaryTotal = sum(budgets['default']['categories'][cat] for cat in necessaryCategories)
        discretionaryTotal = sum(budgets['default']['categories'][cat] for cat in budgets['default']['categories'] if cat not in necessaryCategories)
        budgets['default']['necessary']['total'] = necessaryTotal
        budgets['default']['discretionary']['total'] = discretionaryTotal
        budgets['default']['total'] = necessaryTotal + discretionaryTotal
        
        # 记录预算变更历史
        history.append({
            'id': str(datetime.now().timestamp()),
            'month': month,
            'category': category,
            'oldAmount': oldAmount,
            'newAmount': amount,
            'timestamp': datetime.now().isoformat(),
            'type': 'default_budget_change'
        })
    
    # 保存预算数据
    write_json_file(BUDGET_FILE, budgets)
    # 保存预算历史
    write_json_file(BUDGET_HISTORY_FILE, history)
    
    return jsonify(budgets)

# 清空所有预算数据
@app.route('/api/budgets', methods=['DELETE'])
def clear_budgets():
    write_json_file(BUDGET_FILE, {
        'monthly': {},
        'default': {
            'necessary': {
                'total': 0
            },
            'discretionary': {
                'total': 0
            },
            'categories': {
                'food': 0,
                'gifts': 0,
                'medicalInsurance': 0,
                'transport': 0,
                'housingUtilities': 0,
                'entertainment': 0,
                'dailyNecessities': 0,
                'clothing': 0,
                'pets': 0,
                'travel': 0
            },
            'total': 0
        }
    })
    write_json_file(BUDGET_HISTORY_FILE, [])
    return jsonify({
        'monthly': {},
        'default': {
            'necessary': {
                'total': 0
            },
            'discretionary': {
                'total': 0
            },
            'categories': {
                'food': 0,
                'gifts': 0,
                'medicalInsurance': 0,
                'transport': 0,
                'housingUtilities': 0,
                'entertainment': 0,
                'dailyNecessities': 0,
                'clothing': 0,
                'pets': 0,
                'travel': 0
            },
            'total': 0
        }
    })

# 更新预算历史记录
@app.route('/api/budgets/history/<id>', methods=['PUT'])
def update_budget_history_record(id):
    history = read_json_file(BUDGET_HISTORY_FILE)
    budgets = read_json_file(BUDGET_FILE)
    if not budgets:
        budgets = {
            'monthly': {},
            'default': {
                'necessary': {
                    'total': 0
                },
                'discretionary': {
                    'total': 0
                },
                'categories': {
                    'food': 0,
                    'gifts': 0,
                    'medicalInsurance': 0,
                    'transport': 0,
                    'housingUtilities': 0,
                    'entertainment': 0,
                    'dailyNecessities': 0,
                    'clothing': 0,
                    'pets': 0,
                    'travel': 0
                },
                'total': 0
            }
        }
    
    data = request.get_json()
    record_index = next((i for i, item in enumerate(history) if str(item['id']) == id), None)
    
    if record_index is None:
        return jsonify({'error': 'Record not found'}), 404
    
    # 更新历史记录
    history[record_index] = {
        **history[record_index],
        **data,
        'updatedAt': datetime.now().isoformat()
    }
    
    # 更新预算数据
    updated_record = history[record_index]
    category = updated_record['category']
    amount = updated_record['newAmount']
    necessaryCategories = ['food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities']
    categoryType = 'necessary' if category in necessaryCategories else 'discretionary'
    
    if updated_record['type'] == 'historical_budget_change':
        month = updated_record['month']
        if month not in budgets['monthly']:
            budgets['monthly'][month] = {
                'necessary': {
                    'total': budgets['default']['necessary']['total']
                },
                'discretionary': {
                    'total': budgets['default']['discretionary']['total']
                },
                'categories': budgets['default']['categories'].copy(),
                'total': budgets['default']['total'],
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
        
        budgets['monthly'][month]['categories'][category] = amount
        
        # 更新该月份的总预算
        necessaryTotal = sum(budgets['monthly'][month]['categories'][cat] for cat in necessaryCategories)
        discretionaryTotal = sum(budgets['monthly'][month]['categories'][cat] for cat in budgets['monthly'][month]['categories'] if cat not in necessaryCategories)
        budgets['monthly'][month]['necessary']['total'] = necessaryTotal
        budgets['monthly'][month]['discretionary']['total'] = discretionaryTotal
        budgets['monthly'][month]['total'] = necessaryTotal + discretionaryTotal
        budgets['monthly'][month]['updatedAt'] = datetime.now().isoformat()
    else:
        # 更新默认预算
        budgets['default']['categories'][category] = amount
        
        # 更新默认总预算
        necessaryTotal = sum(budgets['default']['categories'][cat] for cat in necessaryCategories)
        discretionaryTotal = sum(budgets['default']['categories'][cat] for cat in budgets['default']['categories'] if cat not in necessaryCategories)
        budgets['default']['necessary']['total'] = necessaryTotal
        budgets['default']['discretionary']['total'] = discretionaryTotal
        budgets['default']['total'] = necessaryTotal + discretionaryTotal
    
    # 保存数据
    write_json_file(BUDGET_HISTORY_FILE, history)
    write_json_file(BUDGET_FILE, budgets)
    
    return jsonify(updated_record)

# 删除预算历史记录
@app.route('/api/budgets/history/<id>', methods=['DELETE'])
def delete_budget_history_record(id):
    history = read_json_file(BUDGET_HISTORY_FILE)
    budgets = read_json_file(BUDGET_FILE)
    if not budgets:
        budgets = {
            'monthly': {},
            'default': {
                'necessary': {
                    'total': 0
                },
                'discretionary': {
                    'total': 0
                },
                'categories': {
                    'food': 0,
                    'gifts': 0,
                    'medicalInsurance': 0,
                    'transport': 0,
                    'housingUtilities': 0,
                    'entertainment': 0,
                    'dailyNecessities': 0,
                    'clothing': 0,
                    'pets': 0,
                    'travel': 0
                },
                'total': 0
            }
        }
    
    record_index = next((i for i, item in enumerate(history) if str(item['id']) == id), None)
    
    if record_index is None:
        return jsonify({'error': 'Record not found'}), 404
    
    deleted_record = history.pop(record_index)
    
    # 如果删除的是历史月份的预算，需要重新计算该月份的预算
    if deleted_record['type'] == 'historical_budget_change':
        month = deleted_record['month']
        category = deleted_record['category']
        
        # 查找该月份剩余的最新预算记录
        remaining_records = [item for item in history 
                           if item['type'] == 'historical_budget_change' 
                           and item['month'] == month 
                           and item['category'] == category]
        
        if remaining_records:
            # 使用剩余的最新记录恢复预算
            remaining_records.sort(key=lambda x: datetime.fromisoformat(x['timestamp']))
            latest_record = remaining_records[-1]
            budgets['monthly'][month]['categories'][category] = latest_record['newAmount']
        else:
            # 没有剩余记录，使用默认预算
            if month in budgets['monthly']:
                budgets['monthly'][month]['categories'][category] = budgets['default']['categories'][category]
        
        if month in budgets['monthly']:
            # 更新该月份的总预算
            necessaryCategories = ['food', 'gifts', 'medicalInsurance', 'transport', 'housingUtilities']
            necessaryTotal = sum(budgets['monthly'][month]['categories'][cat] for cat in necessaryCategories)
            discretionaryTotal = sum(budgets['monthly'][month]['categories'][cat] for cat in budgets['monthly'][month]['categories'] if cat not in necessaryCategories)
            budgets['monthly'][month]['necessary']['total'] = necessaryTotal
            budgets['monthly'][month]['discretionary']['total'] = discretionaryTotal
            budgets['monthly'][month]['total'] = necessaryTotal + discretionaryTotal
    
    # 保存数据
    write_json_file(BUDGET_HISTORY_FILE, history)
    write_json_file(BUDGET_FILE, budgets)
    
    return jsonify(deleted_record)


if __name__ == '__main__':
    port = int(os.getenv('FLASK_RUN_PORT', 5001))
    host = os.getenv('FLASK_RUN_HOST', '0.0.0.0')
    app.run(debug=True, port=port, host=host)
