import pandas as pd
import json
import os

# 读取Excel文件
excel_file = 'data/欧亚留学产品3.30日.xlsx'

try:
    # 读取第一个工作表
    df = pd.read_excel(excel_file, sheet_name=0)
    
    # 处理空值，将NaN转换为空字符串
    df = df.fillna('')
    
    # 转换为JSON格式
    json_data = df.to_json(orient='records', force_ascii=False, indent=2)
    
    # 将JSON数据写入文件
    json_file = 'data/欧亚留学产品3.30日.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        f.write(json_data)
    
    print(f"Excel文件已成功转换为JSON格式，保存为: {json_file}")
    print(f"数据行数: {len(df)}")
    print(f"数据列数: {len(df.columns)}")
    print(f"列名: {list(df.columns)}")
    
except Exception as e:
    print(f"转换过程中出现错误: {e}")
    import traceback
    traceback.print_exc()