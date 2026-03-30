const fs = require('fs');
const path = require('path');

// 读取新生成的JSON文件
const newJsonPath = path.join(__dirname, 'data', '欧亚留学产品3.30日.json');
const legacyJsonPath = path.join(__dirname, 'data', '欧亚留学产品分类整理.json');

// 读取现有数据
const legacyData = JSON.parse(fs.readFileSync(legacyJsonPath, 'utf8'));
const newData = JSON.parse(fs.readFileSync(newJsonPath, 'utf8'));

// 创建映射关系，根据产品名称关联数据
const productMap = new Map();

// 遍历旧数据，建立产品名称到分类的映射
for (const category in legacyData) {
    for (const productName in legacyData[category]) {
        productMap.set(productName, category);
    }
}

// 处理新数据并更新到旧数据结构中
for (let i = 1; i < newData.length; i++) { // 从索引1开始，跳过表头
    const item = newData[i];
    const productName = item['留学服务产品'];
    
    if (!productName) continue; // 跳过空的产品名称
    
    // 查找产品所属的分类
    const category = productMap.get(productName);
    
    if (!category) {
        console.warn(`未找到产品 "${productName}" 的分类，跳过处理`);
        continue;
    }
    
    // 获取飞书链接
    const feishuLink = item['Unnamed: 2'];
    
    if (feishuLink && feishuLink.trim()) {
        // 更新产品的PDF字段为飞书链接
        if (legacyData[category] && legacyData[category][productName]) {
            legacyData[category][productName].pdf = feishuLink;
            console.log(`已更新产品 "${productName}" 的PDF链接`);
        }
    }
}

// 将更新后的数据写回文件
fs.writeFileSync(legacyJsonPath, JSON.stringify(legacyData, null, 2), 'utf8');
console.log('JSON转换完成！');
console.log(`已更新文件: ${legacyJsonPath}`);