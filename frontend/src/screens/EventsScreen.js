import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { api } from "../api/client";
import Screen from "../components/Screen";
import PrimaryButton from "../components/PrimaryButton";
import { text, spacing, colors } from "../theme";

export default function EventsScreen(){
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(false);
  async function load(){
    try{
      setLoading(true);
      const res = await api.get("events/public/");
      setEvents(res.data);
    }catch(e){ Alert.alert("Error","Failed to load events"); }
    finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function rsvp(id,status){
    try{ await api.post(`events/${id}/rsvp/`, { status }); Alert.alert("RSVP saved"); }
    catch(e){ Alert.alert("Error","Failed to RSVP"); }
  }

  return (
    <Screen>
      <Text style={[text.h1,{marginBottom: spacing(1)}]}>Public Events</Text>
      <PrimaryButton title={loading?"Loading...":"Reload"} onPress={load} />
      <FlatList style={{marginTop: spacing(1.5)}} data={events} keyExtractor={i=>String(i.id)}
        renderItem={({item}) => (
          <View style={{paddingVertical: spacing(1), borderBottomWidth: 1, borderBottomColor: colors.border}}>
            <Text style={{color: colors.text, fontWeight:"600"}}>{item.title}</Text>
            <Text style={{color: colors.textMuted}}>{new Date(item.start_at).toLocaleString()} - {new Date(item.end_at).toLocaleString()}</Text>
            <Text style={{color: colors.textMuted}}>Going: {item.going_count}</Text>
            <View style={{flexDirection:"row", marginTop: spacing(1)}}>
              <PrimaryButton title="Going" onPress={()=>rsvp(item.id, "GOING")} />
              <View style={{width: spacing(1)}} />
              <PrimaryButton title="Interested" onPress={()=>rsvp(item.id, "INTERESTED")} />
              <View style={{width: spacing(1)}} />
              <PrimaryButton title="Decline" onPress={()=>rsvp(item.id, "DECLINED")} style={{backgroundColor: 'transparent', borderWidth:1, borderColor: colors.border}} />
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
