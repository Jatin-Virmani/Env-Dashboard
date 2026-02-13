import re
import json
import sys
from pathlib import Path

import pdfplumber
import tabula
import pandas as pd

# Patch tabula backend to handle Windows encoding issues
try:
    from tabula import backend
    
    # Store original method
    original_call = backend.TabulaVm.call_tabula_java
    
    def patched_call_tabula_java(self, options, path):
        """Call tabula-java with encoding fallback for Windows."""
        try:
            return original_call(self, options, path)
        except UnicodeDecodeError:
            # Retry with cp1252 encoding (Windows-compatible)
            original_encoding = getattr(self, 'encoding', 'utf-8')
            self.encoding = 'cp1252'
            try:
                return original_call(self, options, path)
            finally:
                self.encoding = original_encoding
    
    # Replace the method
    backend.TabulaVm.call_tabula_java = patched_call_tabula_java
except Exception:
    # If patching fails, continue anyway - thermography will still work
    pass


# Base project directory (repo root)
BASE_DIR = Path(__file__).resolve().parent.parent

# 🔧 PDFs are in BASE_DIR / "pdf" folder
PDF_DIR = BASE_DIR / "pdf"
ENERGY_PDF = PDF_DIR / "Final Report_MEA_Manav Rachna_2025.pdf"
THERMO_PDF = PDF_DIR / "Final_Thermography Report.pdf"

# Output directory for extracted data
OUT_DIR = BASE_DIR / "pdf-output"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def extract_energy_tables() -> None:
  """Extract energy audit tables to CSV files."""
  if not ENERGY_PDF.exists():
    print(f"[energy] PDF not found: {ENERGY_PDF}")
    return

  print(f"[energy] Reading PDF: {ENERGY_PDF}")
  
  # Try tabula first (best for complex tables)
  try:
    tables = tabula.read_pdf(
      str(ENERGY_PDF),
      pages="all",
      multiple_tables=True,
    )
    
    print(f"[energy] Found {len(tables)} tables with tabula")
    
    for i, table in enumerate(tables):
      if table is None or table.empty:
        continue
      out_path = OUT_DIR / f"energy_table_{i}.csv"
      table.to_csv(out_path, index=False, encoding="utf-8-sig")
      print(f"[energy] Saved {out_path} ({len(table)} rows)")
    return
    
  except (UnicodeDecodeError, Exception) as e:
    print(f"[energy] Tabula extraction failed: {type(e).__name__}")
    print("[energy] Falling back to pdfplumber table extraction...")
  
  # Fallback to pdfplumber table extraction
  try:
    table_count = 0
    with pdfplumber.open(ENERGY_PDF) as pdf:
      total_pages = len(pdf.pages)
      print(f"[energy] Processing {total_pages} pages with pdfplumber...")
      
      for page_num, page in enumerate(pdf.pages):
        # Try multiple extraction strategies
        tables = page.extract_tables()
        
        # Also try extracting text tables
        if not tables:
          # Try to find tables in text format
          text = page.extract_text()
          if text and any(keyword in text.lower() for keyword in ['table', 'month', 'kwh', 'consumption', 'savings']):
            # Try to extract structured data from text
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            if len(lines) > 3:
              # Potential table data
              pass  # Could add text-based extraction here
        
        if not tables:
          continue
        
        for table_idx, table in enumerate(tables):
          if not table:
            continue
          
          # More lenient filtering - allow single row tables if they have headers
          if len(table) < 1:
            continue
          
          # Convert to DataFrame
          headers = table[0] if table[0] else None
          df = pd.DataFrame(table[1:] if len(table) > 1 else [], columns=headers)
          df = df.dropna(how='all')  # Remove completely empty rows
          
          # Skip if truly empty
          if df.empty and len(table) == 1:
            continue
          
          out_path = OUT_DIR / f"energy_table_page{page_num+1}_{table_idx}.csv"
          df.to_csv(out_path, index=False, encoding="utf-8-sig")
          print(f"[energy] Saved {out_path} ({len(df)} rows)")
          table_count += 1
        
        # Progress indicator for large PDFs
        if (page_num + 1) % 20 == 0:
          print(f"[energy] Processed {page_num + 1}/{total_pages} pages...")
    
    if table_count > 0:
      print(f"[energy] Extracted {table_count} tables using pdfplumber")
    else:
      print("[energy] No tables found in PDF")
      
  except Exception as e:
    print(f"[energy] pdfplumber extraction also failed: {e}")
    print("[energy] Skipping energy tables extraction.")
    print("[energy] Note: You may need to manually extract tables or use tabula-java CLI.")


def extract_thermography() -> None:
  """Extract thermography inspection entries to a JSON file."""
  if not THERMO_PDF.exists():
    print(f"[thermo] PDF not found: {THERMO_PDF}")
    return

  print(f"[thermo] Reading PDF: {THERMO_PDF}")

  records = []

  with pdfplumber.open(THERMO_PDF) as pdf:
    full_text = ""
    for page in pdf.pages:
      text = page.extract_text()
      if text:
        full_text += "\n" + text

  # Try multiple patterns to catch all variations
  patterns = [
    # Original pattern
    re.compile(
      r"IR_(\d+).*?\n(.*?)\n.*?Average Temperature\s([\d.]+).*?"
      r"Image Range\s([\d.]+).*?to\s([\d.]+).*?"
      r"REMARKS\s(.*?)(?:\n|$)",
      re.DOTALL,
    ),
    # Alternative pattern with different spacing
    re.compile(
      r"IR_(\d+).*?\n(.*?)\n.*?Average\s+Temperature\s+([\d.]+).*?"
      r"Image\s+Range\s+([\d.]+).*?to\s+([\d.]+).*?"
      r"REMARKS\s+(.*?)(?:\n|$)",
      re.DOTALL | re.IGNORECASE,
    ),
  ]
  
  all_matches = []
  seen_ids = set()
  
  for pattern in patterns:
    matches = pattern.findall(full_text)
    for m in matches:
      if m[0] not in seen_ids:
        all_matches.append(m)
        seen_ids.add(m[0])
  
  matches = all_matches

  matches = pattern.findall(full_text)
  print(f"[thermo] Found {len(matches)} records")

  def classify(temp: float) -> str:
    if temp > 100:
      return "CRITICAL"
    if temp > 60:
      return "WARNING"
    return "NORMAL"

  for m in matches:
    record = {
      "inspection_id": m[0],
      "location": m[1].strip(),
      "avg_temp": float(m[2]),
      "min_temp": float(m[3]),
      "max_temp": float(m[4]),
      "remarks": m[5].strip(),
    }
    record["severity"] = classify(record["max_temp"])
    records.append(record)

  out_path = OUT_DIR / "thermography_data.json"
  with out_path.open("w", encoding="utf-8") as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

  print(f"[thermo] Saved {out_path}")


def main() -> None:
  print("=" * 60)
  print("Starting PDF extraction...")
  print("=" * 60)
  
  extract_energy_tables()
  print()
  extract_thermography()
  print()
  print("[done] Extraction complete.")
  print(f"Check output in: {OUT_DIR}")


if __name__ == "__main__":
  main()

