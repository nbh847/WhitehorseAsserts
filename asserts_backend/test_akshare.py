import akshare as ak
import pandas as pd

# 设置中文显示
pd.set_option('display.unicode.east_asian_width', True)

# 测试获取所有A股数据
try:
    print("正在获取A股实时数据...")
    a_share_data = ak.stock_zh_a_spot_em()
    
    print(f"\n数据总条数: {len(a_share_data)}")
    print(f"\n所有列名:")
    for i, col in enumerate(a_share_data.columns):
        print(f"{i+1}. {col}")
    
    # 测试特定股票：三一重工（600031）
    print(f"\n\n测试股票：三一重工（600031）")
    stock_code = "600031"
    filtered_data = a_share_data[a_share_data['代码'] == stock_code]
    
    if not filtered_data.empty:
        print(f"找到股票数据：")
        print(filtered_data.iloc[0].to_dict())
        
        # 检查市盈率相关字段
        print(f"\n市盈率相关字段：")
        pe_fields = [col for col in a_share_data.columns if '市盈' in col or 'PE' in col]
        for field in pe_fields:
            print(f"{field}: {filtered_data.iloc[0][field]}")
            print(f"  类型: {type(filtered_data.iloc[0][field])}")
            print(f"  是否为'-': {filtered_data.iloc[0][field] == '-'}")
    else:
        print(f"未找到股票代码 {stock_code} 的数据")
        print(f"\n前5条数据的代码：")
        print(a_share_data[['代码', '名称']].head())
        
except Exception as e:
    print(f"发生错误: {e}")
    import traceback
    traceback.print_exc()
