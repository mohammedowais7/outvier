import React,{useState} from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { api } from "../api/client";

export default function RegisterScreen({ navigation }){
  const [username,setUsername]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  async function handleRegister(){
    try{
      await api.post("auth/register/", { username, email, password });
      Alert.alert("Success","Account created. Login now.");
      navigation.replace("Login");
    }catch(e){ Alert.alert("Register failed","Try a different username/email"); }
  }
  return (
    <View style={{padding:20}}>
      <Text style={{fontSize:22,marginBottom:8}}>Register</Text>
      <Text>Username</Text>
      <TextInput style={{borderWidth:1,marginBottom:8,padding:8}} value={username} onChangeText={setUsername}/>
      <Text>Email</Text>
      <TextInput autoCapitalize="none" style={{borderWidth:1,marginBottom:8,padding:8}} value={email} onChangeText={setEmail}/>
      <Text>Password</Text>
      <TextInput secureTextEntry style={{borderWidth:1,marginBottom:12,padding:8}} value={password} onChangeText={setPassword}/>
      <Button title="Create Account" onPress={handleRegister}/>
    </View>
  );
}
