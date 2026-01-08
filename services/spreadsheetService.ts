
/**
 * LAYANAN DATABASE SPREADSHEET (Versi High Integrity v6.3)
 */

// PENTING: Pastikan Deployment Apps Script diset ke "Anyone" (Siapa Saja)
const SPREADSHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxiiEOym9IvGM78LWKUEgG6c3oArfYLjcVb5VfgarxB5PnReOtfYkeWxFHp-gi-_hms/exec'; 

const isUrlPlaceholder = (url: string) => {
  return !url || url.includes('MASUKKAN_URL') || url === '' || url.length < 20;
};

export const spreadsheetService = {
  /**
   * Mengambil semua data dari Cloud
   */
  async fetchAllData() {
    if (isUrlPlaceholder(SPREADSHEET_WEB_APP_URL)) return null;
    
    try {
      // Tambahkan Cache Buster untuk menghindari data lama dari cache browser
      const response = await fetch(`${SPREADSHEET_WEB_APP_URL}?t=${Date.now()}`, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`Fetch Error: ${response.status}`);
      
      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error('Cloud Fetch failed:', error);
      return null;
    }
  },

  /**
   * Menyimpan seluruh data ke Cloud (Multi-Sheet Sync)
   */
  async saveData(data: any) {
    if (isUrlPlaceholder(SPREADSHEET_WEB_APP_URL)) return false;

    try {
      // Kita gunakan mode 'cors' dan text/plain untuk reliabilitas maksimal
      const response = await fetch(SPREADSHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveAll',
          payload: data
        }),
      });

      // Validasi apakah respons benar-benar JSON sukses
      const result = await response.json();
      return result && result.status === 'success';
    } catch (error) {
      console.error('Cloud Save Network Error:', error);
      // Fallback: Jika terjadi error CORS saat POST (tapi data mungkin masuk), 
      // kita tidak bisa memastikan 100%. Namun di GAS v6.3 ini sudah dihandle.
      return false;
    }
  },

  /**
   * Mengunggah file ke Google Drive
   */
  async uploadFile(file: File): Promise<{ url: string; fileId: string } | null> {
    if (isUrlPlaceholder(SPREADSHEET_WEB_APP_URL)) return null;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const response = await fetch(SPREADSHEET_WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
            body: JSON.stringify({
              action: 'upload',
              fileName: file.name,
              mimeType: file.type,
              base64: base64
            }),
          });
          
          const result = await response.json();
          resolve(result && result.status === 'success' ? result : null);
        } catch (error) {
          console.error('Upload failed:', error);
          resolve(null);
        }
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsDataURL(file);
    });
  }
};
