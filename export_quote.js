// 显示报价单预览
function showQuotePreview() {
    const modal = document.getElementById('quote-preview-modal');
    const previewBody = document.getElementById('quote-preview-body');
    
    // 构建报价单内容
    let quoteContent = `
        <div class="quote-header text-center mb-8">
            <h2 class="text-2xl font-bold mb-2">留学服务报价单</h2>
            <p class="text-gray-600 dark:text-gray-400">新东方前途出国重庆分公司</p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="quote-details mb-8">
            <h3 class="text-lg font-semibold mb-4">服务详情</h3>
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-800">
                        <th class="border border-gray-200 dark:border-gray-700 p-3 text-left">服务项目</th>
                        <th class="border border-gray-200 dark:border-gray-700 p-3 text-right">价格</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加选中的服务项
    selectedProducts.forEach(product => {
        const serviceName = product.selectedContract ? `${product.name} - ${product.selectedContract}` : product.name;
        const price = product.selectedPrice ? `¥${product.selectedPrice}` : product.price;
        
        quoteContent += `
            <tr>
                <td class="border border-gray-200 dark:border-gray-700 p-3">${serviceName}</td>
                <td class="border border-gray-200 dark:border-gray-700 p-3 text-right font-medium">${price}</td>
            </tr>
        `;
    });
    
    // 添加总计
    const totalPrice = calculateTotalPrice();
    quoteContent += `
                </tbody>
                <tfoot>
                    <tr class="bg-gray-100 dark:bg-gray-800">
                        <td class="border border-gray-200 dark:border-gray-700 p-3 font-semibold text-right">总计</td>
                        <td class="border border-gray-200 dark:border-gray-700 p-3 text-right font-bold text-primary">¥${totalPrice}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div class="quote-footer">
            <h3 class="text-lg font-semibold mb-4">备注</h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
                <li>以上报价包含所有列出的服务项目</li>
                <li>报价有效期为当月</li>
                <li>具体服务内容以合同为准</li>

            </ul>
        </div>
    `;
    
    // 创建水印容器
    const watermarkDiv = document.createElement('div');
    watermarkDiv.className = 'quote-watermark';
    watermarkDiv.style.position = 'absolute';
    watermarkDiv.style.top = '0';
    watermarkDiv.style.left = '0';
    watermarkDiv.style.width = '100%';
    watermarkDiv.style.height = '100%';
    watermarkDiv.style.pointerEvents = 'none';
    watermarkDiv.style.zIndex = '1';
    watermarkDiv.style.opacity = '0.15';
    watermarkDiv.style.fontSize = '30px';
    watermarkDiv.style.fontWeight = 'bold';
    watermarkDiv.style.color = '#90EE90'; // 浅绿色
    watermarkDiv.style.display = 'flex';
    watermarkDiv.style.flexDirection = 'column';
    watermarkDiv.style.justifyContent = 'space-around';
    watermarkDiv.style.textAlign = 'center';
    
    // 创建多行水印
    const watermarkText = '新东方前途出国重庆分公司';
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-around';
        row.style.transform = 'rotate(-15deg)';
        
        for (let j = 0; j < 3; j++) {
            const span = document.createElement('span');
            span.textContent = watermarkText;
            row.appendChild(span);
        }
        
        watermarkDiv.appendChild(row);
    }
    
    previewBody.innerHTML = quoteContent;
    previewBody.style.position = 'relative';
    previewBody.appendChild(watermarkDiv);
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// 关闭报价单预览
function closeQuotePreview() {
    const modal = document.getElementById('quote-preview-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    const quoteModal = document.getElementById('quote-preview-modal');
    if (e.target === quoteModal) {
        closeQuotePreview();
    }
});