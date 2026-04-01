// 全局变量
let allProductsData = {};
let selectedProducts = [];

// 分类映射：将HTML中的旧分类名称映射到JSON中的新分类名称
const categoryMapping = {
    '留学服务': '留学服务产品',
    '背景提升': '软背景提升产品',
    '学术辅导': '学术辅导服务产品'
};

// 将新JSON结构转换为代码期望的格式
function transformData(rawData) {
    // 创建一个空对象，根据实际项目类别动态添加
    const transformed = {};
    
    // 遍历所有项目
    const projects = rawData['项目数据列表'] || [];
    projects.forEach(project => {
        const basicInfo = project['项目基础信息'];
        const projectFiles = project['关联项目文件'] || [];
        const projectPrices = project['关联项目价格'] || [];
        
        // 提取项目关键信息
        const projectName = basicInfo['项目名称'];
        const category = basicInfo['项目类别'];
        
        // 确保类别存在
        if (!transformed[category]) {
            transformed[category] = {};
        }
        
        // 准备合同列表
        const contracts = projectPrices.map(price => ({
            contract: price['合同名称'],
            price: price['价格(元)']
        }));
        
        // 准备文件信息
        const files = projectFiles.map(file => file['文件名']);
        const urls = projectFiles.map(file => file['文件链接URL']);
        
        // 创建产品对象
        transformed[category][projectName] = {
            description: projectFiles[0]?.['项目介绍'] || '',
            url: urls[0] || '', // 使用第一个文件的URL作为主URL
            urls: urls, // 添加所有文件的URL列表
            files: files,
            contracts: contracts
        };
    });
    
    console.log('转换后的数据:', transformed);
    return transformed;
}

// 产品数据加载和初始化
async function loadProducts() {
    console.log('开始加载产品数据...');
    try {
        console.log('尝试请求JSON文件: data/欧亚留学产品 4.1_项目关联结构.json');
        const response = await fetch('data/欧亚留学产品 4.1_项目关联结构.json');
        
        if (!response.ok) {
            console.error('HTTP请求失败:', response.status, response.statusText);
            throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`);
        }
        
        // 获取原始数据
        const rawData = await response.json();
        console.log('原始JSON数据:', rawData);
        
        // 将新JSON结构转换为代码期望的格式
        const transformedData = transformData(rawData);
        
        allProductsData = transformedData;
        console.log('转换后的数据结构:', allProductsData);
        console.log('JSON文件加载成功并完成数据转换');
        
        // 设置左侧导航点击事件
        setupSidebarNavigation();
        
        // 默认显示第一个产品
        displayDefaultProduct();
        
        // 初始化报价单
        updateQuote();
        
        console.log('产品数据加载完成');
    } catch (error) {
        console.error('加载产品数据失败:', error);
        // 显示错误信息到页面
        const productTitle = document.getElementById('current-product-title');
        const projectIntro = document.getElementById('project-intro');
        if (productTitle) productTitle.textContent = '数据加载失败';
        if (projectIntro) projectIntro.innerHTML = `<p class="text-center text-red-500 py-4">无法加载产品数据: ${error.message}</p>`;
    }
}

// 设置左侧导航点击事件
function setupSidebarNavigation() {
    const categoryItems = document.querySelectorAll('.product-categories li');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有active类
            categoryItems.forEach(li => li.classList.remove('active'));
            // 添加active类到当前点击项
            item.classList.add('active');
            
            // 获取产品信息
            const category = item.dataset.category;
            const productName = item.dataset.product;
            
            // 显示选中的产品
            displayProduct(category, productName);
        });
    });
}

// 默认显示第一个产品
function displayDefaultProduct() {
    // 默认显示留学服务分类下的普通合同
    displayProduct('留学服务', '普通合同');
    
    // 设置默认选中项
    const defaultItem = document.querySelector('[data-category="留学服务"][data-product="普通合同"]');
    if (defaultItem) {
        defaultItem.classList.add('active');
    }
}

// 显示产品详情
function displayProduct(category, productName) {
    // 转换分类名称到JSON中的实际分类名称
    const mainCategory = categoryMapping[category] || category;
    
    // 首先尝试在指定分类中查找产品
    let product = null;
    if (allProductsData[mainCategory]) {
        product = allProductsData[mainCategory][productName];
    }
    
    // 如果在指定分类中找不到，在所有分类中查找
    if (!product) {
        for (const cat in allProductsData) {
            if (allProductsData[cat][productName]) {
                product = allProductsData[cat][productName];
                break;
            }
        }
    }
    
    if (!product) {
        console.error(`找不到产品: ${productName} 分类: ${category} (实际: ${mainCategory})`);
        return;
    }
    
    // 更新产品标题
    const productTitle = document.getElementById('current-product-title');
    productTitle.textContent = productName;
    
    // 显示项目介绍
    displayProjectIntro(product);
    
    // 显示相关文件
    displayRelatedFiles(product);
    
    // 直接显示该产品的所有合同和价格
    showQuoteList();
}

// 显示项目介绍
function displayProjectIntro(product) {
    const projectIntro = document.getElementById('project-intro');
    
    if (product.description) {
        // 将描述按换行符分割成数组
        const lines = product.description.split('\n');
        
        // 构建卡片HTML
        let cardsHTML = '';
        let currentTitle = '';
        let currentContent = '';
        
        // 遍历每一行
        for (const line of lines) {
            // 如果是标题行（没有空格，或者是简短的描述）
            if (line.trim() && !line.trim().includes(' ') || line.trim().length < 10) {
                // 如果已经有内容，先保存当前卡片
                if (currentTitle && currentContent) {
                    cardsHTML += `
                        <div class="service-card bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover-card mb-4">
                            <h4 class="card-title font-semibold text-primary mb-2">${currentTitle}</h4>
                            <p class="card-content text-gray-700 dark:text-gray-300">${currentContent}</p>
                        </div>
                    `;
                    currentContent = '';
                }
                // 设置新标题
                currentTitle = line.trim();
            } else if (line.trim()) {
                // 添加内容行
                currentContent += line.trim() + ' ';
            }
        }
        
        // 保存最后一个卡片
        if (currentTitle && currentContent) {
            cardsHTML += `
                <div class="service-card bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover-card mb-4">
                    <h4 class="card-title font-semibold text-primary mb-2">${currentTitle}</h4>
                    <p class="card-content text-gray-700 dark:text-gray-300">${currentContent}</p>
                </div>
            `;
        }
        
        // 如果没有生成任何卡片，使用原来的段落形式
        if (!cardsHTML) {
            const formattedDesc = product.description.replace(/\n/g, '<br>');
            projectIntro.innerHTML = `<p>${formattedDesc}</p>`;
        } else {
            projectIntro.innerHTML = cardsHTML;
        }
    } else {
        projectIntro.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">暂无该项目的详细介绍。</p>';
    }
}

// 显示相关文件
function displayRelatedFiles(product) {
    const relatedFiles = document.getElementById('related-files');
    
    // 合并所有资源文件
    const allFiles = [];
    
    // 添加URL文件（新的数据结构）
    if (product.files && product.files.length > 0) {
        // 获取文件名列表和对应的URL
        const fileNames = product.files;
        const urls = product.urls || [];
        
        // 遍历所有文件
        fileNames.forEach((fileName, index) => {
            if (fileName.trim()) {
                let filePath = urls[index] || product.url || '';
                let fileType = 'url';
                
                // 检查文件类型
                if (fileName.toLowerCase().includes('.pdf')) {
                    fileType = 'pdf';
                } else if (fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                    fileType = 'image';
                }
                
                allFiles.push({
                    name: fileName.trim(),
                    path: filePath,
                    type: fileType
                });
            }
        });
    } else if (product.url) {
        // 如果没有文件名列表，但有URL，使用URL本身
        let fileName = product.url;
        let filePath = product.url;
        let fileType = 'url';
        
        // 检查文件类型
        if (fileName.toLowerCase().includes('.pdf')) {
            fileType = 'pdf';
        } else if (fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            fileType = 'image';
        }
        
        // 提取文件名
        if (fileName.includes('/')) {
            const parts = fileName.split('/');
            fileName = parts[parts.length - 1];
        }
        
        allFiles.push({
            name: fileName,
            path: filePath,
            type: fileType
        });
    }
    
    // 兼容旧的字段结构（PDF）
    if (product.pdf) {
        const pdfPaths = product.pdf.split('\n');
        pdfPaths.forEach(pdf => {
            if (pdf.trim()) {
                let fileName = '';
                let filePath = pdf;
                
                // 检查是否是飞书链接
                if (pdf.includes('feishu.cn')) {
                    const parts = pdf.split('/');
                    fileName = parts[parts.length - 1] + '.pdf';
                } else {
                    fileName = pdf.replace(/\\/g, '/').split('/').pop();
                    filePath = `assets/${pdf}`;
                }
                
                allFiles.push({
                    name: fileName,
                    path: filePath,
                    type: 'pdf'
                });
            }
        });
    }
    
    // 兼容旧的字段结构（图片）
    if (product.image) {
        const imagePaths = product.image.split('\n');
        imagePaths.forEach(image => {
            if (image.trim()) {
                allFiles.push({
                    name: image.replace(/\\/g, '/').split('/').pop(),
                    path: `assets/${image}`,
                    type: 'image'
                });
            }
        });
    }
    
    if (allFiles.length > 0) {
            // 创建表格结构
            const table = document.createElement('table');
            table.className = 'file-table w-full border-collapse';
            
            // 创建表头
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr class="bg-gray-100 dark:bg-gray-800">
                    <th class="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold">图标</th>
                    <th class="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold">文件名</th>
                    <th class="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold">文件类型</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // 创建表格主体
            const tbody = document.createElement('tbody');
            
            allFiles.forEach(file => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
                
                // 根据文件类型选择图标
                let iconClass, displayType;
                switch (file.type) {
                    case 'pdf':
                        iconClass = 'fa fa-file-pdf-o text-red-500';
                        displayType = 'PDF';
                        break;
                    case 'image':
                        iconClass = 'fa fa-image text-blue-500';
                        displayType = 'IMAGE';
                        break;
                    case 'url':
                    default:
                        iconClass = 'fa fa-link text-green-500';
                        displayType = 'URL';
                        break;
                }
                
                // 创建表格单元格
                const iconCell = document.createElement('td');
                iconCell.className = 'border border-gray-200 dark:border-gray-700 px-4 py-2';
                iconCell.innerHTML = `<i class="${iconClass} text-xl"></i>`;
                
                const nameCell = document.createElement('td');
                nameCell.className = 'border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary transition-colors';
                nameCell.textContent = file.name;
                
                // 添加点击事件
                nameCell.addEventListener('click', () => {
                    // 打开新窗口访问URL
                    window.open(file.path, '_blank');
                });
                
                const typeCell = document.createElement('td');
                typeCell.className = 'border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-500 dark:text-gray-400';
                typeCell.textContent = displayType;
                
                // 组合表格行
                tr.appendChild(iconCell);
                tr.appendChild(nameCell);
                tr.appendChild(typeCell);
                tbody.appendChild(tr);
            });
            
            table.appendChild(tbody);
            
            // 创建表格容器
            const tableContainer = document.createElement('div');
            tableContainer.className = 'overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700';
            tableContainer.appendChild(table);
            
            relatedFiles.innerHTML = '';
            relatedFiles.appendChild(tableContainer);
        } else {
            relatedFiles.innerHTML = '<p class="no-files text-center text-gray-500 dark:text-gray-400 py-4">暂无该项目的相关文件。</p>';
        }
}

// 显示报价单列表
function showQuoteList() {
    const quoteList = document.getElementById('quote-list');
    
    // 获取当前选中的产品
    const activeItem = document.querySelector('.product-categories li.active');
    if (!activeItem) return;
    
    const category = activeItem.dataset.category;
    const productName = activeItem.dataset.product;
    
    // 转换分类名称到JSON中的实际分类名称
    const mainCategory = categoryMapping[category] || category;
    
    // 首先尝试在指定分类中查找产品
    let product = null;
    if (allProductsData[mainCategory]) {
        product = allProductsData[mainCategory][productName];
    }
    
    // 如果在指定分类中找不到，在所有分类中查找
    if (!product) {
        for (const cat in allProductsData) {
            if (allProductsData[cat][productName]) {
                product = allProductsData[cat][productName];
                break;
            }
        }
    }
    
    if (!product) {
        console.error(`找不到产品: ${productName} 分类: ${category} (实际: ${mainCategory})`);
        quoteList.innerHTML = '<p class="no-quote text-center text-gray-500 dark:text-gray-400 py-4">找不到该产品的信息。</p>';
        quoteList.style.display = 'block';
        return;
    }
    
    // 构建报价详情
    let quoteHTML = '';
    
    // 如果有合同信息，显示所有合同和价格
    if (product.contracts && product.contracts.length > 0) {
        // 构建列表HTML
        quoteHTML = '<ul class="quote-item-list space-y-3">';
        
        // 遍历所有合同
        for (let i = 0; i < product.contracts.length; i++) {
            const contract = product.contracts[i].contract;
            const price = product.contracts[i].price;
            
            // 使用产品名称作为ID，因为新的JSON结构中没有id字段
            const productId = productName;
            
            quoteHTML += `
                <li class="quote-item bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover-card">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <i class="fas fa-file-text-o text-primary mr-2"></i>
                            <span class="contract-name font-medium">${contract}</span>
                        </div>
                        <div class="price font-bold text-primary text-lg">¥${price}</div>
                    </div>
                    <button class="add-to-quote-btn bg-primary hover:bg-primary/90 text-white text-sm py-2 px-4 rounded-lg hover-scale transition-all duration-300" onclick="addToQuoteWithDetails('${productId}', '${contract}', '${price}')">
                        <i class="fas fa-plus mr-1"></i> 添加到报价
                    </button>
                </li>
            `;
        }
        
        quoteHTML += '</ul>';
    } else {
        quoteHTML = '<p class="no-quote text-center text-gray-500 dark:text-gray-400 py-4">该产品价格面议，请联系客服获取详细报价。</p>';
    }
    
    // 显示报价列表
    quoteList.innerHTML = quoteHTML;
    quoteList.style.display = 'block';
}

// 添加产品到报价单（带详细信息）
function addToQuoteWithDetails(productId, contract, price) {
    // 查找产品（现在用产品名称作为ID）
    let product = null;
    let productCategory = null;
    
    for (const category in allProductsData) {
        if (allProductsData[category][productId]) {
            product = allProductsData[category][productId];
            productCategory = category;
            break;
        }
    }
    
    if (!product) return;
    
    // 创建包含详细信息的产品对象
    const productWithDetails = {
        ...product,
        id: productId, // 使用产品名称作为ID
        name: productId, // 添加name字段，因为原来的代码可能会用到
        category: productCategory,
        selectedContract: contract,
        selectedPrice: parseInt(price)
    };
    
    // 检查产品是否已在报价单中
    const existingIndex = selectedProducts.findIndex(p => p.id === productId && p.selectedContract === contract);
    if (existingIndex === -1) {
        selectedProducts.push(productWithDetails);
        updateQuote();
    }
}

// 格式化价格
function formatPrice(priceString) {
    if (priceString === '价格面议') {
        return priceString;
    }
    
    const prices = priceString.split(',').map(p => p.trim());
    if (prices.length === 1) {
        return `¥${prices[0]}`;
    } else {
        return `¥${prices[0]} - ¥${prices[prices.length - 1]}`;
    }
}

// 添加产品到报价单
function addToQuote(product) {
    // 检查产品是否已在报价单中
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    if (existingIndex === -1) {
        selectedProducts.push(product);
        updateQuote();
    }
}

// 从报价单中移除产品
function removeFromQuote(productId, contract) {
    selectedProducts = selectedProducts.filter(p => {
        if (contract) {
            return !(p.id === productId && p.selectedContract === contract);
        } else {
            return p.id !== productId;
        }
    });
    updateQuote();
}

// 更新报价单
function updateQuote() {
    // 更新已选择数量
    const selectedCount = document.getElementById('selected-count');
    selectedCount.textContent = selectedProducts.length;
    
    // 更新已选服务列表
    const selectedList = document.getElementById('selected-services-list');
    const noSelection = document.querySelector('.no-selection');
    
    if (selectedProducts.length === 0) {
        selectedList.innerHTML = '';
        noSelection.style.display = 'block';
    } else {
        noSelection.style.display = 'none';
        selectedList.innerHTML = '';
        
        selectedProducts.forEach(product => {
            const li = document.createElement('li');
            // 显示合同名称和价格
            const displayName = product.selectedContract ? `${product.name} - ${product.selectedContract}` : product.name;
            const displayPrice = product.selectedPrice ? `¥${product.selectedPrice}` : formatPrice(product.price);
            
            li.className = 'selected-service-item flex justify-between items-center p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 hover-card';
            li.innerHTML = `
                <div class="flex-1">
                    <div class="font-medium">${displayName}</div>
                    <div class="text-primary font-semibold">${displayPrice}</div>
                </div>
                <button class="remove-service p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors hover-scale" onclick="removeFromQuote('${product.id}', '${product.selectedContract || ''}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedList.appendChild(li);
        });
    }
    
    // 更新总计价格
    const totalPriceElement = document.getElementById('total-price');
    const totalPrice = calculateTotalPrice();
    totalPriceElement.textContent = `¥${totalPrice}`;
}

// 计算总计价格
function calculateTotalPrice() {
    let total = 0;
    
    selectedProducts.forEach(product => {
        if (product.selectedPrice) {
            // 如果有精确的选择价格，使用该价格
            total += product.selectedPrice;
        } else if (product.price && product.price !== '价格面议') {
            // 否则使用原来的逻辑，取最低价格
            const prices = product.price.split(',').map(p => parseInt(p.trim()));
            if (prices.length > 0) {
                total += Math.min(...prices);
            }
        }
    });
    
    return total;
}

// 显示产品详情模态框
function showProductDetails(product) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    // 构建模态框内容
    let content = `
        <h3>${product.name}</h3>
    `;
    
    // 添加产品描述
    if (product.description) {
        content += `
            <h4>产品描述</h4>
            <p>${product.description}</p>
        `;
    }
    
    // 添加价格信息
    content += `
        <h4>价格</h4>
        <p>${formatPrice(product.price)}</p>
    `;
    
    // 添加联系方式
    if (product.contact && product.contact.length > 0) {
        content += `
            <h4>联系方式</h4>
            <ul>
        `;
        
        product.contact.forEach(contact => {
            content += `<li>${contact}</li>`;
        });
        
        content += `</ul>`;
    }
    
    // 添加资源链接
    const hasResources = product.assets && (product.assets.pdf.length > 0 || product.assets.image.length > 0);
    if (hasResources) {
        content += `
            <h4>相关资源</h4>
            <div class="resource-links">
        `;
        
        // PDF资源
        if (product.assets.pdf && product.assets.pdf.length > 0) {
            product.assets.pdf.forEach(pdf => {
                const fileName = pdf.split('\\').pop();
                content += `
                    <a href="assets/${pdf}" class="resource-link" target="_blank">
                        <i class="fas fa-file-pdf"></i>
                        <span>${fileName}</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
            });
        }
        
        // 图片资源
        if (product.assets.image && product.assets.image.length > 0) {
            product.assets.image.forEach(image => {
                const fileName = image.split('\\').pop();
                content += `
                    <a href="assets/${image}" class="resource-link" target="_blank">
                        <i class="fas fa-image"></i>
                        <span>${fileName}</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
            });
        }
        
        content += `</div>`;
    }
    
    modalBody.innerHTML = content;
    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    
    // 产品详情模态框关闭事件
    const productModal = document.getElementById('product-modal');
    const productCloseBtn = productModal.querySelector('.close-btn');
    
    productCloseBtn.addEventListener('click', closeModal);
    
    // 点击产品详情模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
    });
    
    // 移除报价单模态框相关代码，因为不再使用弹窗
    // 报价单现在直接在页面下方显示
    
    // 生成报价单按钮事件已在HTML中通过onclick属性设置，此处不再重复添加
});