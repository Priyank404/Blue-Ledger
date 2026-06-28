import * as XLSX from 'xlsx';

export const normalizeHeader = (header) => String(header || '').toLowerCase().replace(/[^a-z]/g, '');

export const pickValue = (row, keys) => keys.map((key) => row[key]).find(Boolean) || '';

export const normalizeImportDate = (value) => {
  if (!value) return '';
  if (typeof value === 'number') {
    const parsedExcelDate = XLSX.SSF.parse_date_code(value);
    if (!parsedExcelDate) return '';
    const month = String(parsedExcelDate.m).padStart(2, '0');
    const day = String(parsedExcelDate.d).padStart(2, '0');
    return `${parsedExcelDate.y}-${month}-${day}`;
  }

  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const readStatementWorkbook = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });

  return workbook.SheetNames.map((sheetName) => ({
    sheetName,
    rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: false })
  }));
};

export const isRowEmpty = (row) => row.every((cell) => String(cell || '').trim() === '');

export const rowToObject = (headers, values) =>
  headers.reduce((acc, header, index) => {
    acc[normalizeHeader(header)] = values[index];
    return acc;
  }, {});

export const findHeaderIndex = (rows, requiredHeaders) =>
  rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader);
    return requiredHeaders.every((header) => normalized.includes(header));
  });

export const getStatementDate = (rows) => {
  for (const row of rows) {
    const match = row.join(' ').match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (match) return match[0];
  }
  return new Date().toISOString().slice(0, 10);
};

export const parseTransactionStatement = (sheets, fallbackType = 'BUY') => {
  const importedRows = [];

  sheets.forEach(({ rows }) => {
    const headerIndex = findHeaderIndex(rows, ['symbol', 'quantity', 'price']);
    if (headerIndex === -1) return;

    const headers = rows[headerIndex];
    rows.slice(headerIndex + 1).forEach((values) => {
      if (isRowEmpty(values)) return;
      const row = rowToObject(headers, values);
      importedRows.push({
        type: (pickValue(row, ['type', 'transactiontype', 'tradetype', 'buysell']) || fallbackType).toUpperCase(),
        name: pickValue(row, ['name', 'stock', 'stockname', 'company', 'companyname', 'symbol']),
        quantity: pickValue(row, ['quantity', 'qty', 'shares', 'units']),
        price: pickValue(row, ['price', 'priceperunit', 'rate']),
        date: normalizeImportDate(pickValue(row, ['date', 'transactiondate', 'tradedate', 'orderexecutiontime']))
      });
    });
  });

  return importedRows.filter((row) => row.name || row.quantity || row.price || row.date);
};

export const parseHoldingsStatement = (sheets) => {
  const importedRows = [];
  const equitySheets = sheets.filter(({ sheetName }) => sheetName.toLowerCase().includes('equity'));
  const fallbackSheets = sheets.filter(({ sheetName }) => !sheetName.toLowerCase().includes('mutual'));
  const sheetsToParse = equitySheets.length > 0 ? equitySheets : fallbackSheets;

  sheetsToParse.forEach(({ rows }) => {
    const headerIndex = findHeaderIndex(rows, ['symbol', 'quantityavailable', 'averageprice']);
    if (headerIndex === -1) return;

    const statementDate = getStatementDate(rows);
    const headers = rows[headerIndex];
    const seenSymbols = new Set();

    rows.slice(headerIndex + 1).forEach((values) => {
      if (isRowEmpty(values)) return;
      const row = rowToObject(headers, values);
      const symbol = pickValue(row, ['symbol']);
      const quantity = pickValue(row, ['quantityavailable']);
      const importPrice = pickValue(row, ['averageprice']);

      if (!symbol || !quantity || !importPrice || symbol.includes('FUND') || seenSymbols.has(symbol)) return;
      seenSymbols.add(symbol);
      importedRows.push({ type: 'BUY', name: symbol, quantity, price: importPrice, date: statementDate });
    });
  });

  return importedRows;
};
