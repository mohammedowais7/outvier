import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "outvier_access";
export const saveToken = (t) => AsyncStorage.setItem(KEY, t);
export const getToken = () => AsyncStorage.getItem(KEY);
export const clearToken = () => AsyncStorage.removeItem(KEY);
