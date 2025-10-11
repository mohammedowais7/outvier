import React,{useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { api } from "../api/client";
import { saveToken } from "../auth/token";
import Screen from "../components/Screen";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import { colors, text, spacing } from "../theme";

export default function RegisterScreen({ navigation }){
  const [username,setUsername]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  async function handleRegister(){
    try{
      await api.post("auth/register/", { username, email, password });
      // Auto-login after successful registration
      const res = await api.post("auth/login/", { username, password });
      await saveToken(res.data.access);
      navigation.replace("Home");
    }catch(e){ Alert.alert("Register failed","Try a different username/email"); }
  }
  return (
    <Screen>
      <View style={{flex:1, justifyContent:"center"}}>
        <Text style={[text.h1,{marginBottom: spacing(0.5)}]}>Create account</Text>
        <Text style={[text.p,{marginBottom: spacing(2)}]}>Join and track goals with orbital precision.</Text>
        <TextField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <PrimaryButton title="Create Account" onPress={handleRegister} style={{marginTop: spacing(0.5)}} />
        <TouchableOpacity onPress={()=>navigation.navigate("Login")} style={{marginTop: spacing(1.5)}}>
          <Text style={{color: colors.textMuted}}>Already have an account? <Text style={{color: colors.accent}}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
