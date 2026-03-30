import json
import os

# 读取原始JSON文件
json_file = 'data/欧亚留学产品3.30日.json'

try:
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"读取原始JSON文件成功，共 {len(data)} 条记录")
    
    # 定义产品类别映射
    category_mapping = {
        '留学服务产品': ['普通合同', '联报合同', '高端合同', '马来西亚', '亚英研究型硕士及博士', 
                         '中外合作办学硕士', '中外合作办学在职提升'],
        '软背景提升产品': ['优选计划', '威计划', '双优计划', '职涯计划', '来offer', '校招求职', 
                         '管家计划求职', '证书类', '顶锋计划', '顶锋+优才计划', '顶锋+全球在研', 
                         'R计划', '深耕计划', '全球在研', '集思海外科研', '海外在研', '定制科研', 
                         'sci', 'ssci', '博睿计划', '访学'],
        '学术辅导服务产品': ['学术club', '英领同步辅导', '学术申诉', '灯塔计划', 
                           '中外合作办学同步学术指导']
    }
    
    # 反向映射：产品名称到主类别
    product_to_category = {}
    for main_category, sub_categories in category_mapping.items():
        for sub_category in sub_categories:
            product_to_category[sub_category] = main_category
    
    # 重组数据结构
    reorganized_data = {
        '留学服务产品': {},
        '软背景提升产品': {},
        '学术辅导服务产品': {}
    }
    
    current_product = None
    current_description = ''
    current_pdf = ''
    current_image = ''
    contracts = []
    
    for item in data:
        product_name = item['留学服务产品']
        description = item['Unnamed: 1']
        pdf = item['Unnamed: 2']
        image = item['Unnamed: 3']
        contract = item['Unnamed: 4']
        price = item['Unnamed: 5']
        
        # 跳过标题行
        if product_name == 'project name' and description == 'description':
            if current_product:
                # 保存当前产品的信息
                if contracts:
                    # 获取产品的主类别
                    if current_product in product_to_category:
                        main_category = product_to_category[current_product]
                    else:
                        # 尝试根据文件路径推断类别
                        if '留学服务产品' in current_pdf or '留学服务产品' in current_image:
                            main_category = '留学服务产品'
                        elif '软背景提升产品' in current_pdf or '软背景提升产品' in current_image:
                            main_category = '软背景提升产品'
                        elif '学术辅导服务产品' in current_pdf or '学术辅导服务产品' in current_image:
                            main_category = '学术辅导服务产品'
                        else:
                            # 默认为留学服务产品
                            main_category = '留学服务产品'
                    
                    # 保存到重组数据中
                    reorganized_data[main_category][current_product] = {
                        'description': current_description,
                        'pdf': current_pdf,
                        'image': current_image,
                        'contracts': contracts
                    }
                    
                # 重置当前产品信息
                current_product = None
                current_description = ''
                current_pdf = ''
                current_image = ''
                contracts = []
            continue
        
        # 如果是新产品
        if product_name and product_name != 'project name':
            # 如果有当前产品未保存，先保存
            if current_product and contracts:
                # 获取产品的主类别
                if current_product in product_to_category:
                    main_category = product_to_category[current_product]
                else:
                    # 尝试根据文件路径推断类别
                    if '留学服务产品' in current_pdf or '留学服务产品' in current_image:
                        main_category = '留学服务产品'
                    elif '软背景提升产品' in current_pdf or '软背景提升产品' in current_image:
                        main_category = '软背景提升产品'
                    elif '学术辅导服务产品' in current_pdf or '学术辅导服务产品' in current_image:
                        main_category = '学术辅导服务产品'
                    else:
                        # 默认为留学服务产品
                        main_category = '留学服务产品'
                
                # 保存到重组数据中
                reorganized_data[main_category][current_product] = {
                    'description': current_description,
                    'pdf': current_pdf,
                    'image': current_image,
                    'contracts': contracts
                }
            
            # 设置新产品信息
            current_product = product_name
            current_description = description
            current_pdf = pdf
            current_image = image
            contracts = []
        
        # 如果有合同信息，添加到当前产品的合同列表中
        if contract and contract != 'contract':
            contracts.append({
                'contract': contract,
                'price': price
            })
    
    # 保存最后一个产品的信息
    if current_product and contracts:
        # 获取产品的主类别
        if current_product in product_to_category:
            main_category = product_to_category[current_product]
        else:
            # 尝试根据文件路径推断类别
            if '留学服务产品' in current_pdf or '留学服务产品' in current_image:
                main_category = '留学服务产品'
            elif '软背景提升产品' in current_pdf or '软背景提升产品' in current_image:
                main_category = '软背景提升产品'
            elif '学术辅导服务产品' in current_pdf or '学术辅导服务产品' in current_image:
                main_category = '学术辅导服务产品'
            else:
                # 默认为留学服务产品
                main_category = '留学服务产品'
        
        # 保存到重组数据中
        reorganized_data[main_category][current_product] = {
            'description': current_description,
            'pdf': current_pdf,
            'image': current_image,
            'contracts': contracts
        }
    
    # 将重组后的数据写入新的JSON文件
    new_json_file = 'data/欧亚留学产品分类整理.json'
    with open(new_json_file, 'w', encoding='utf-8') as f:
        json.dump(reorganized_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n数据重组完成，保存为: {new_json_file}")
    
    # 统计各类别产品数量
    for main_category, products in reorganized_data.items():
        print(f"{main_category}: {len(products)} 个产品")
        for product_name, product_info in products.items():
            print(f"  - {product_name}: {len(product_info['contracts'])} 个合同")
    
    print("\n数据重组成功！")
    
except Exception as e:
    print(f"处理过程中出现错误: {e}")
    import traceback
    traceback.print_exc()