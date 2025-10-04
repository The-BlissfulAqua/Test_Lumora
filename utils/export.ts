import { Alert } from '../types';

/**
 * Converts an array of objects to a CSV string.
 * @param data The array of objects.
 * @returns A CSV formatted string.
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      let value = obj[header];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      const strValue = String(value).replace(/"/g, '""');
      return `"${strValue}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Exports an array of Alert objects to a CSV file.
 * @param alerts The alerts to export.
 * @param filename The desired name of the file.
 */
export function exportAlertsToCSV(alerts: Alert[], filename: string): void {
  // Simplify the data for export
  const dataToExport = alerts.map(({ dispatchLog, evidence, coordinates, ...rest }) => ({
    ...rest,
    latitude: coordinates.lat,
    longitude: coordinates.lng,
  }));

  const csv = convertToCSV(dataToExport);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}