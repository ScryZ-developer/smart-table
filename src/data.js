export function initData() {
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

            // Преобразуем объекты в массивы если нужно
            const sellersArray = Array.isArray(sellersResponse) ? sellersResponse : Object.values(sellersResponse);
            const customersArray = Array.isArray(customersResponse) ? customersResponse : Object.values(customersResponse);

            sellers = {};
            customers = {};

            sellersArray.forEach(seller => {
                sellers[seller.id] = `${seller.first_name} ${seller.last_name}`;
            });

            customersArray.forEach(customer => {
                customers[customer.id] = `${customer.first_name} ${customer.last_name}`;
            });
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        const items = records.items.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellers[item.seller_id],
            customer: customers[item.customer_id],
            total: item.total_amount
        }));

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: items
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}