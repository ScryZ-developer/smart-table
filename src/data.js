export function initData(sourceData) {
    const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';
    
    let sellersMap = {};
    let customersMap = {};

    const getIndexes = async () => {
        try {
            const [sellersResponse, customersResponse] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);

            sellersMap = {};
            customersMap = {};

            if (sellersResponse && typeof sellersResponse === 'object') {
                Object.entries(sellersResponse).forEach(([key, name]) => {
                    if (typeof name === 'string') {
                        const numericId = parseInt(key.replace('seller_', ''));
                        sellersMap[numericId] = name;
                        sellersMap[key] = name;
                    }
                });
            }

            if (customersResponse && typeof customersResponse === 'object') {
                Object.entries(customersResponse).forEach(([key, name]) => {
                    if (typeof name === 'string') {
                        const numericId = parseInt(key.replace('customer_', ''));
                        customersMap[numericId] = name;
                        customersMap[key] = name;
                    }
                });
            }

        } catch (error) {
            sellersMap = {};
            customersMap = {};
        }

        return { sellers: sellersMap, customers: customersMap };
    }

    const getRecords = async (query, isUpdated = false) => {
        try {
            const { sellers, customers } = await getIndexes();
            
            const qs = new URLSearchParams(query);
            const response = await fetch(`${BASE_URL}/records?${qs.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const records = await response.json();

            // Безопасное преобразование записей
            const items = Array.isArray(records?.items) ? records.items.map(item => ({
                id: item.receipt_id || item.id || '',
                date: item.date || '',
                seller: sellers[item.seller_id] || `Seller ${item.seller_id}`,
                customer: customers[item.customer_id] || `Customer ${item.customer_id}`,
                total: item.total_amount || 0
            })) : [];

            return {
                total: records?.total || 0,
                items: items
            };
        } catch (error) {
            return { total: 0, items: [] };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}