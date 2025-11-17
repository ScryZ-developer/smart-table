export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            if (elements[elementName] && indexes[elementName]) {
                const select = elements[elementName];
                
                const firstOption = select.children[0];
                
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                const uniqueValues = [...new Set(Object.values(indexes[elementName]))];
                uniqueValues.sort().forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    select.appendChild(option);
                });
            }
        });
    }

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            
            // Создаем mapping между dataset.field и data-name
            const fieldMapping = {
                'date': 'searchByDate',
                'customer': 'searchByCustomer', 
                'seller': 'searchBySeller',
                'total': 'totalFrom' // или totalTo, нужно уточнить
            };
            
            const elementName = fieldMapping[field];
            if (elementName && elements[elementName]) {
                elements[elementName].value = '';
                state[field] = '';
            }
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key] && elements[key].value) {
                const fieldName = elements[key].name;
                filter[`filter[${fieldName}]`] = elements[key].value;
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    }

    return {
        updateIndexes,
        applyFiltering
    };
}