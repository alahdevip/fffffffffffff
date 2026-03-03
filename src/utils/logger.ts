const styles = {
  system: 'background: #1a1a1a; color: #888; font-size: 9px; font-weight: 300; padding: 2px 5px; border-radius: 4px; border: 1px solid #333;',
  api: 'background: #001f3f; color: #00d2ff; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #004080;',
  flow: 'background: #1a0033; color: #d800ff; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #4d0099;',
  success: 'background: #002200; color: #00ff00; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #004400;',
  error: 'background: #330000; color: #ff4d4d; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #660000;',
  security: 'background: #332b00; color: #ffcc00; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #665500;',
  warn: 'background: #332b00; color: #ffa500; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #665500;',
  event: 'background: #003333; color: #33ffff; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid #006666;'
};

const getTime = () => new Date().toLocaleTimeString('pt-BR', { hour12: false });

export const Logger = {
  system: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] ⚙️ ${msg}`, styles.system, data !== undefined ? data : '');
  },
  api: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] 🚀 ${msg}`, styles.api, data !== undefined ? data : '');
  },
  flow: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] 🌀 ${msg}`, styles.flow, data !== undefined ? data : '');
  },
  success: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] ✅ ${msg}`, styles.success, data !== undefined ? data : '');
  },
  error: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] ❌ ${msg}`, styles.error, data !== undefined ? data : '');
  },
  security: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] 🔒 ${msg}`, styles.security, data !== undefined ? data : '');
  },
  warn: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] ⚠️ ${msg}`, styles.warn, data !== undefined ? data : '');
  },
  event: (msg: string, data?: any) => {
    console.log(`%c[${getTime()}] 📊 ${msg}`, styles.event, data !== undefined ? data : '');
  }
};
