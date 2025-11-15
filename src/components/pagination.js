import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка действий
        if (action) switch(action.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount, page + 1); break;
            case 'first': page = 1; break;
            case 'last': page = pageCount; break;
        }

        return Object.assign({}, query, {
            limit,
            page
        });
    }

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        // @todo: #2.4 — получить список видимых страниц и вывести их
        const visiblePages = getPages(page, pageCount, 5);                // Получим массив страниц, которые нужно показать, выводим только 5 страниц
        pages.replaceChildren(...visiblePages.map(pageNumber => {        // перебираем их и создаём для них кнопку
          const el = pageTemplate.cloneNode(true);                    // клонируем шаблон, который запомнили ранее
          return createPage(el, pageNumber, pageNumber === page);        // вызываем колбэк из настроек, чтобы заполнить кнопку данными
        })) 

        // @todo: #2.5 — обновить статус пагинации
        fromRow.textContent = (page - 1) * limit + 1;                   
        toRow.textContent = Math.min((page * limit), data.length);    
        totalRows.textContent = data.length;
    }

    return {
        updatePagination,
        applyPagination
    };
}