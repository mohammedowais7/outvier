import React,{useEffect,useState} from "react";
import { View, Text, Button, FlatList, Alert } from "react-native";
import { api } from "../api/client";
import { getToken, clearToken } from "../auth/token";

export default function HomeScreen({ navigation }){
  const [goals,setGoals]=useState([]);
  async function load(){
    try{
      const token = await getToken();
      const res = await api.get("goals/", { headers: { Authorization: `Bearer ${token}` }});
      setGoals(res.data);
    }catch(e){ Alert.alert("Error","Failed to load goals"); }
  }
  useEffect(()=>{ load(); },[]);
  return (
    <View style={{padding:20}}>
      <Text style={{fontSize:22,marginBottom:8}}>Your Goals</Text>
      <FlatList data={goals} keyExtractor={i=>String(i.id)}
        renderItem={({item}) => <Text>- {item.title} ({item.progress}%)</Text>} />
      <View style={{height:10}}/>
      <Button title="Reload" onPress={load}/>
      <View style={{height:10}}/>
      <Button color="red" title="Logout" onPress={async ()=>{ await clearToken(); navigation.replace("Login"); }}/>
    </View>
  );
}
