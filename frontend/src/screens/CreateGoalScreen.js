import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { api } from "../api/client";
import Screen from "../components/Screen";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import { text, spacing } from "../theme";

export default function CreateGoalScreen({ navigation }){
  const [title,setTitle]=useState("");
  const [progress,setProgress]=useState("0");

  async function create(){
    try{
      await api.post("goals/", { title, progress: Number(progress) });
      Alert.alert("Created","Goal saved");
      navigation.goBack();
    }catch(e){ Alert.alert("Error","Failed to create goal"); }
  }

  return (
    <Screen>
      <Text style={[text.h1,{marginBottom: spacing(1)}]}>New Goal</Text>
      <TextField label="Title" value={title} onChangeText={setTitle} />
      <TextField label="Progress (%)" value={progress} onChangeText={setProgress} keyboardType="numeric" />
      <PrimaryButton title="Create" onPress={create} style={{marginTop: spacing(1)}} />
    </Screen>
  );
}
