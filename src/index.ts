/**
 * CSV/JSON Converter
 * Convert between CSV and JSON formats
 *
 * Online tool: https://devtools.at/tools/csv-json
 *
 * @packageDocumentation
 */

function detectDelimiter(csv: string): Delimiter {
  const firstLine = csv.split("\n")[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return "\t";
  if (semicolonCount > commaCount) return ";";
  return ",";
}

function parseCSV(csv: string, delimiter: Delimiter, skipEmpty: boolean): unknown[] {
  const lines = csv.split("\n").filter(line => !skipEmpty || line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));
  const result: unknown[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() && skipEmpty) continue;

    const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ""));
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    result.push(obj);
  }

  return result;
}

function arrayToCSV(data: unknown[], delimiter: Delimiter): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("JSON must be a non-empty array of objects");
  }

  const firstItem = data[0];
  if (typeof firstItem !== "object" || firstItem === null || Array.isArray(firstItem)) {
    throw new Error("JSON must be an array of objects");
  }

  const headers = Object.keys(firstItem as Record<string, unknown>);
  const csvLines: string[] = [headers.join(delimiter)];

  for (const item of data) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error("All array items must be objects");
    }

    const values = headers.map(header => {
      const value = (item as Record<string, unknown>)[header];
      const stringValue = value === null || value === undefined ? "" : String(value);

      // Escape values that contain the delimiter, quotes, or newlines
      if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });

    csvLines.push(values.join(delimiter));
  }

  return csvLines.join("\n");
}

// Export for convenience
export default { encode, decode };
