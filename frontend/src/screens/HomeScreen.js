import React,{useEffect,useState} from "react";
import { View, Text, FlatList, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { api } from "../api/client";
import { getToken, clearToken } from "../auth/token";
import Screen from "../components/Screen";
import PrimaryButton from "../components/PrimaryButton";
import GoalItem from "../components/GoalItem";
import { colors, text, spacing } from "../theme";

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
    <Screen>
      <Text style={[text.h1, { marginBottom: spacing(1.5)}]}>Your Goals</Text>
      <FlatList
        data={goals}
        keyExtractor={i=>String(i.id)}
        renderItem={({item}) => <GoalItem goal={item} />}
        ListEmptyComponent={<Text style={text.p}>No goals yet. Create your first.</Text>}
      />
      <View style={{height: spacing(1)}}/>
      <PrimaryButton title="Reload" onPress={load} />
      <View style={{height: spacing(1)}}/>
      <PrimaryButton title="Create Goal" onPress={()=>navigation.navigate("CreateGoal")} />
      <View style={{height: spacing(1)}}/>
      <PrimaryButton title="Explore Events" onPress={()=>navigation.navigate("Events")} />
      <View style={{height: spacing(1)}}/>
      <TouchableOpacity onPress={async ()=>{ await clearToken(); navigation.replace("Login"); }}>
        <Text style={{ color: colors.danger, textAlign: "center" }}>Logout</Text>
      </TouchableOpacity>
    </Screen>
  );
}
