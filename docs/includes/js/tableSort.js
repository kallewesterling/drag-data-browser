/* eslint-disable no-param-reassign */

function sorter(rows = [], reverseOrder = 1, col = 0) {
  return new Promise((resolve) => {
    resolve(rows.sort((a, b) => {
      const aContent = a.cells[col].textContent.trim();
      const bContent = b.cells[col].textContent.trim();
      return reverseOrder * (aContent.localeCompare(bContent));
    }));
  });
}

async function sortTable(table, col, reverse) {
  document.body.style.setProperty('cursor', 'progress', 'important');

  const reverseOrder = -((+reverse) || -1);

  // isolate table's body (and exclude thead and tfoot)
  const tableBody = table.tBodies[0];

  // sort rows
  let rows = [...tableBody.rows];
  rows = await sorter(rows, reverseOrder, col);

  // append each row in order
  rows.forEach((row) => tableBody.appendChild(row));

  table.dataset.sorted = reverseOrder === 1 ? 'asc' : 'desc';

  document.body.style.setProperty('cursor', 'default');
}

function makeSortable(tableElem) {
  if (!tableElem.tHead) {
    return;
  }
  const cells = [...tableElem.tHead.rows[0].cells];

  cells.forEach((cell, col) => {
    let direction = 1;
    cell.addEventListener('click', () => {
      sortTable(tableElem, col, (direction = 1 - direction));
    });
  });
}

window.onload = () => {
  const tables = [...document.querySelectorAll('table')];
  tables.forEach((table) => makeSortable(table));
};
