import React,{useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { api } from "../api/client";
import { saveToken } from "../auth/token";
import Screen from "../components/Screen";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import { colors, text, spacing } from "../theme";

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
    <Screen>
      <View style={{flex:1, justifyContent:"center"}}>
        <Text style={[text.h1,{marginBottom: spacing(0.5)}]}>Welcome back</Text>
        <Text style={[text.p,{marginBottom: spacing(2)}]}>Sign in to continue your mission.</Text>
        <TextField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <PrimaryButton title="Sign In" onPress={handleLogin} style={{marginTop: spacing(0.5)}} />
        <TouchableOpacity onPress={()=>navigation.navigate("Register")} style={{marginTop: spacing(1.5)}}>
          <Text style={{color: colors.textMuted}}>New here? <Text style={{color: colors.accent}}>Create an account</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
