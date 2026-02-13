# PDF Extraction Summary

**Extraction Date**: February 13, 2026  
**Script**: `scripts/extract_reports.py`

## ✅ Extraction Results

### Thermography Report
- **File**: `thermography_data.json`
- **Records Extracted**: 40 inspection entries
- **Format**: JSON array with structured records
- **Fields**:
  - `inspection_id`: IR inspection number
  - `location`: Inspection location/description
  - `avg_temp`: Average temperature (°C)
  - `min_temp`: Minimum temperature (°C)
  - `max_temp`: Maximum temperature (°C)
  - `remarks`: Inspection remarks
  - `severity`: Auto-classified (CRITICAL/WARNING/NORMAL)

### Energy Audit Report
- **Files**: 83 CSV files (`energy_table_page*.csv`)
- **Extraction Method**: pdfplumber (fallback after tabula encoding issues)
- **Format**: CSV files, one per table found in the PDF
- **Naming**: `energy_table_page{N}_{index}.csv` where N is the page number

## 📊 Data Quality

All extractions completed successfully:
- ✅ Thermography: 40/40 records extracted
- ✅ Energy Audit: 83 tables extracted across multiple pages

## 🚀 Usage

### View Thermography Data
```bash
# View JSON file
cat pdf-output/thermography_data.json

# Or in Python
import json
with open('pdf-output/thermography_data.json') as f:
    data = json.load(f)
```

### Process Energy Tables
```bash
# All CSV files are in pdf-output/
# Import into database, Excel, or process programmatically
```

### Re-run Extraction
```bash
cd "C:\Users\Harsh Thakur\Desktop\env-dashboard"
.\.venv\Scripts\Activate.ps1
python scripts\extract_reports.py
```

## 📝 Notes

- Energy tables were extracted using pdfplumber due to Windows encoding compatibility with tabula-py
- All files are saved in UTF-8 encoding for maximum compatibility
- The script automatically handles encoding issues and falls back gracefully
