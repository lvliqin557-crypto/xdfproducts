import json
import os

# 读取JSON文件
json_file = 'data/欧亚留学产品3.30日.json'

try:
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"JSON文件格式有效！")
    print(f"总共有 {len(data)} 条记录")
    
    # 统计不同类别的产品数量
    product_categories = {}
    for item in data:
        category = item['留学服务产品']
        if category:
            if category in product_categories:
                product_categories[category] += 1
            else:
                product_categories[category] = 1
    
    print("\n产品类别统计：")
    for category, count in product_categories.items():
        print(f"{category}: {count} 条")
    
    # 检查是否有重复的合同编号
    contract_ids = [item['Unnamed: 4'] for item in data if item['Unnamed: 4']]
    unique_contracts = set(contract_ids)
    if len(contract_ids) != len(unique_contracts):
        print(f"\n警告：发现重复的合同编号！")
        print(f"总合同数: {len(contract_ids)}, 唯一合同数: {len(unique_contracts)}")
    else:
        print(f"\n所有合同编号都是唯一的！")
    
    # 检查价格字段
    prices = [item['Unnamed: 5'] for item in data if item['Unnamed: 5']]
    print(f"\n包含价格的记录数: {len(prices)}")
    if prices:
        price_types = set([type(p).__name__ for p in prices])
        print(f"价格字段的数据类型: {list(price_types)}")
        
        # 计算价格范围
        if 'int' in price_types or 'float' in price_types:
            numeric_prices = [p for p in prices if isinstance(p, (int, float))]
            print(f"最低价格: {min(numeric_prices)}")
            print(f"最高价格: {max(numeric_prices)}")
            print(f"平均价格: {sum(numeric_prices) / len(numeric_prices):.2f}")
    
    print("\n验证完成！")
    
except json.JSONDecodeError as e:
    print(f"JSON格式错误: {e}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"验证过程中出现错误: {e}")
    import traceback
    traceback.print_exc()