import json

# 读取JSON文件
with open('d:\\手扣ai工具\\报价github以传\\data\\欧亚留学产品_原始 URL 格式.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# 初始化产品分类字典
product_categories = {
    '留学服务产品': [],
    '软背景提升产品': [],
    '学术辅导服务产品': []
}

# 定义分类关键词
soft_background_keywords = [
    '优选计划', '威计划', '双优计划', '职涯计划', '来offer', '校招求职', '管家计划求职',
    '证书类', '顶锋计划', 'R计划', '深耕计划', '全球在研', '集思海外科研', '海外在研',
    '定制科研', 'sci', 'ssci', '博睿计划', '访学'
]

academic_tutoring_keywords = [
    '学术club', '英领同步辅导', '学术申诉', '灯塔计划', '中外合作办学同步学术指导'
]

# 标记当前分类
current_category = '留学服务产品'

# 遍历所有产品进行分类
for product in products:
    project_name = product.get('project_name')
    contract = product.get('contract')
    
    # 检查是否是分类标记
    if project_name == '软背景提升产品':
        current_category = '软背景提升产品'
        continue
    elif project_name == '学术辅导服务产品':
        current_category = '学术辅导服务产品'
        continue
    elif project_name == '留学服务产品':
        current_category = '留学服务产品'
        continue
    
    # 跳过模板行
    if project_name == 'project name' and contract == 'contract':
        continue
    
    # 根据project_name或contract进行分类
    if project_name in soft_background_keywords or any(keyword in (project_name or '') for keyword in soft_background_keywords):
        product_categories['软背景提升产品'].append(product)
    elif project_name in academic_tutoring_keywords or any(keyword in (project_name or '') for keyword in academic_tutoring_keywords):
        product_categories['学术辅导服务产品'].append(product)
    elif current_category == '软背景提升产品' and project_name is None:
        # 继承上一个分类
        product_categories['软背景提升产品'].append(product)
    elif current_category == '学术辅导服务产品' and project_name is None:
        # 继承上一个分类
        product_categories['学术辅导服务产品'].append(product)
    else:
        # 默认分类为留学服务产品
        product_categories['留学服务产品'].append(product)

# 输出分类结果
print("产品分类结果：")
for category, items in product_categories.items():
    print(f"\n{category} ({len(items)}个产品):")
    for item in items[:5]:  # 只显示每个分类的前5个产品
        print(f"  - {item.get('project_name') or '未命名'}: {item.get('contract') or '无合同'} - {item.get('price') or '无价格'}")
    if len(items) > 5:
        print(f"  ... 还有 {len(items) - 5} 个产品")

# 保存分类结果到JSON文件
with open('d:\\手扣ai工具\\报价github以传\\data\\product_classification_result.json', 'w', encoding='utf-8') as f:
    json.dump(product_categories, f, ensure_ascii=False, indent=2)

print("\n分类结果已保存到 data\\product_classification_result.json 文件")