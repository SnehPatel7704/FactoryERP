export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  // Find all possible headers across all objects
  const headers = Array.from(
    new Set(data.reduce((acc, obj) => acc.concat(Object.keys(obj)), []))
  );

  const csvRows = [];
  
  // Create Header row
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  // Create Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : row[header];
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
