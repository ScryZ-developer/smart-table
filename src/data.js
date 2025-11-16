export function initData(sourceData) {
    const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';
    
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const getIndexes = async () => {
        if (!sellers || !customers) {
            const [sellersResponse, customersResponse] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);

            sellers = {};
            customers = {};

            // Создаем две мапы: для строковых и числовых ключей
            if (sellersResponse && typeof sellersResponse === 'object') {
                Object.entries(sellersResponse).forEach(([key, sellerData]) => {
                    if (sellerData && typeof sellerData === 'string') {
                        // Сохраняем для строкового ключа "seller_1"
                        sellers[key] = sellerData;
                        // Сохраняем для числового ключа 1
                        const numericId = parseInt(key.replace('seller_', ''));
                        sellers[numericId] = sellerData;
                    }
                });
            }

            if (customersResponse && typeof customersResponse === 'object') {
                Object.entries(customersResponse).forEach(([key, customerData]) => {
                    if (customerData && typeof customerData === 'string') {
                        // Сохраняем для строкового ключа "customer_1"
                        customers[key] = customerData;
                        // Сохраняем для числового ключа 1
                        const numericId = parseInt(key.replace('customer_', ''));
                        customers[numericId] = customerData;
                    }
                });
            }
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        await getIndexes();

        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        const mapRecords = (data) => data.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellers[item.seller_id] || `Seller ${item.seller_id}`,
            customer: customers[item.customer_id] || `Customer ${item.customer_id}`,
            total: item.total_amount
        }));

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}