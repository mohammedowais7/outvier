import axios from "axios";
import { Platform, NativeModules } from "react-native";
import Constants from "expo-constants";
import { getToken } from "../auth/token";

// Prefer EXPO_PUBLIC_API_URL when set (works for real devices)
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

function isValidHttpUrl(u){
  try{
    if(!u || typeof u !== 'string') return false;
    const url = new URL(u);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname;
  }catch(_){ return false; }
}
function deriveDevHostFromBundle(){
  try{
    // scriptURL can be exp://, http://, https://
    const url = NativeModules?.SourceCode?.scriptURL || Constants?.expoConfig?.hostUri;
    if(url){
      const m = url.match(/^[a-zA-Z]+:\/\/([^:\/]+)(?::\d+)?/);
      if(m && m[1]){
        return m[1]; // host only; we'll build candidates with/without port
      }
    }
  }catch(_){ /* noop */ }
  return null;
}

const FALLBACK_LOCAL = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
const host = deriveDevHostFromBundle();
const EXTRA_URL = Constants?.expoConfig?.extra?.apiUrl || null;
const candidates = [];
if (isValidHttpUrl(ENV_URL)) candidates.push(ENV_URL);
if (host) {
  candidates.push(`http://${host}:8000`);
  candidates.push(`http://${host}`);
}
if (isValidHttpUrl(EXTRA_URL)) candidates.push(EXTRA_URL);
candidates.push(FALLBACK_LOCAL);
export const BASE_URL = candidates.find(isValidHttpUrl);
if(__DEV__){
  // Helpful for connectivity debugging
  // eslint-disable-next-line no-console
  console.log("API Base URL:", BASE_URL);
}
export const api = axios.create({ baseURL: `${BASE_URL}/api/` });

// Attach JWT automatically
api.interceptors.request.use(async (config)=>{
  try{
    const t = await getToken();
    if(t){ config.headers = { ...(config.headers||{}), Authorization: `Bearer ${t}` }; }
  }catch(_){ /* noop */ }
  // Correlate logs with a client-sent request id
  try{
    const rid = (Date.now().toString(16) + Math.random().toString(16).slice(2,10)).toUpperCase();
    config.headers = { ...(config.headers||{}), 'X-Request-ID': rid };
    if(__DEV__){
      // Lightweight client-side log for debugging
      console.log(`[API][${rid}] ${config.method?.toUpperCase()} ${config.url}`);
    }
  }catch(_){ /* noop */ }
  return config;
});

// Log responses/errors in dev for quicker diagnosis
api.interceptors.response.use(
  (res)=>{
    if(__DEV__){
      const rid = res.config?.headers?.['X-Request-ID'];
      console.log(`[API][${rid}] <- ${res.status}`);
    }
    return res;
  },
  (err)=>{
    if(__DEV__){
      const rid = err?.config?.headers?.['X-Request-ID'];
      const status = err?.response?.status;
      console.warn(`[API][${rid}] !! ${status ?? 'NETWORK_ERROR'}`);
    }
    return Promise.reject(err);
  }
);

// Simple health check against backend root (not /api/)
export function healthCheck(){
  return axios.get(`${BASE_URL}/`);
}
