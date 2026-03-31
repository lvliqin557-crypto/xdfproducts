import pandas as pd
import json
import os

# 设置文件路径
excel_file = 'd:\\手扣ai工具\\报价github以传\\data\\欧亚留学产品3.31日.xlsx'
json_file = 'd:\\手扣ai工具\\报价github以传\\data\\product_classification_result.json'

# 读取Excel文件
df = pd.read_excel(excel_file)

# 提取项目名称和对应的文件名
excel_data = []
current_project = None
current_files = []

for index, row in df.iterrows():
    # 跳过表头行
    if index == 0:
        continue
        
    # 获取项目名称
    project_name = row['留学服务产品']
    url_files = row['Unnamed: 2']  # 文件名在Unnamed: 2列
    
    # 如果有新项目名称，保存当前项目并开始新的
    if pd.notna(project_name):
        if current_project is not None:
            excel_data.append({
                'project_name': current_project,
                'files': current_files
            })
        current_project = project_name
        current_files = []
    
    # 添加文件名
    if pd.notna(url_files):
        # 处理多个文件名的情况
        if '\n' in url_files:
            files = [f.strip() for f in url_files.split('\n') if f.strip()]
        else:
            files = [url_files.strip()]
        current_files.extend(files)

# 保存最后一个项目
if current_project is not None:
    excel_data.append({
        'project_name': current_project,
        'files': current_files
    })

# 创建项目名称到文件名的映射
project_files_map = {item['project_name']: item['files'] for item in excel_data}

# 读取JSON文件
with open(json_file, 'r', encoding='utf-8') as f:
    json_data = json.load(f)

# 遍历JSON数据，为每个产品添加文件名信息
for category, products in json_data.items():
    for product in products:
        project_name = product.get('project_name')
        url = product.get('url')
        
        # 如果有URL并且项目名称在映射中
        if url and project_name in project_files_map:
            files = project_files_map[project_name]
            # 为产品添加文件名信息，保留原始URL
            product['files'] = files
            # 如果没有files字段，使用URL本身
            if not files:
                product['files'] = [url.split('/')[-1] if '/' in url else url]

# 保存更新后的JSON文件
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)

print("文件名信息添加完成！")
print(f"更新后的JSON文件已保存到: {json_file}")

# 验证更新结果
with open(json_file, 'r', encoding='utf-8') as f:
    updated_json = json.load(f)

print("\n更新后的部分产品示例：")
for category, products in updated_json.items():
    for product in products[:3]:  # 显示每个分类的前3个产品
        if product.get('url'):
            print(f"项目名称: {product.get('project_name')}")
            print(f"URL: {product.get('url')}")
            print(f"文件名: {product.get('files')}")
            print("---")
        else:
            print(f"项目名称: {product.get('project_name')} (无URL)")
            print("---")
    break  # 只显示第一个分类的示例
