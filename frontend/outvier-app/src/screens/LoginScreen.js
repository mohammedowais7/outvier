import React,{useState} from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { api } from "../api/client";
import { saveToken } from "../auth/token";

export default function LoginScreen({ navigation }){
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  async function handleLogin(){
    try{
      const res = await api.post("auth/login/", { username, password });
      await saveToken(res.data.access);
      navigation.replace("Home");
    }catch(e){ Alert.alert("Login failed","Check credentials"); }
  }
  return (
    <View style={{padding:20}}>
      <Text style={{fontSize:22,marginBottom:8}}>Login</Text>
      <Text>Username</Text>
      <TextInput style={{borderWidth:1,marginBottom:8,padding:8}} value={username} onChangeText={setUsername}/>
      <Text>Password</Text>
      <TextInput secureTextEntry style={{borderWidth:1,marginBottom:12,padding:8}} value={password} onChangeText={setPassword}/>
      <Button title="Login" onPress={handleLogin}/>
      <View style={{height:10}}/>
      <Button title="Go to Register" onPress={()=>navigation.navigate("Register")}/>
    </View>
  );
}
