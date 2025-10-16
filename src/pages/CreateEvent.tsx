import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StackScreenProps } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";
import { createEvent } from "../services/api";
import { uploadImage } from "../services/imageApi";
import { RootStackParamList } from "../routes/AppStack";

type Props = StackScreenProps<RootStackParamList, "CreateEvent">;

export default function CreateEvent({ route, navigation }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState<{
    url: string;
    name: string;
    size: number;
  }>();
  const [busy, setBusy] = useState(false);

  const allFilled =
    name.trim() &&
    desc.trim() &&
    dateTime.trim() &&
    volunteersNeeded.trim() &&
    latitude.trim() &&
    longitude.trim() &&
    image?.url;

  async function pickImage() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Library access denied.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
      });
      if (result.canceled) return;

      setBusy(true);
      const uri = result.assets[0].uri;
      const uploaded = await uploadImage(uri);
      setImage(uploaded);
      Alert.alert("Image uploaded", "Thumbnail and details attached.");
    } catch {
      Alert.alert("Upload error", "Could not upload image.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    try {
      setBusy(true);
      const payload = {
        id: cryptoRandomId(),
        name,
        description: desc,
        dateTime,
        imageUrl: image?.url,
        organizerId: "EF-BZ00",
        position: { latitude: Number(latitude), longitude: Number(longitude) },
        volunteersNeeded: Number(volunteersNeeded),
        volunteersIds: [],
      };
      await createEvent(payload);
      Alert.alert("Saved", "Event created successfully.");
      route.params?.onSaved?.();
      navigation.navigate("EventsMap");
    } catch {
      Alert.alert("Error", "Could not save the event.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#00A3FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add event</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#FF4B4B" />
        </TouchableOpacity>
      </View>

      {/* FORM CARD */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <LabeledInput
            label="Event Name"
            value={name}
            onChangeText={setName}
          />
          <LabeledInput
            label="About"
            value={desc}
            onChangeText={setDesc}
            multiline
            placeholder="300 characters max."
          />
          <LabeledInput
            label="Volunteers Needed"
            value={volunteersNeeded}
            onChangeText={setVolunteersNeeded}
            keyboardType="numeric"
          />
          <LabeledInput
            label="Date and Time"
            value={dateTime}
            onChangeText={setDateTime}
            placeholder="2025-12-31T16:30:00.000Z"
          />
          <LabeledInput
            label="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
          <LabeledInput
            label="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />

          {/* Picture picker */}
          <Text style={styles.label}>Picture</Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={pickImage}
            disabled={busy}
          >
            {image?.url ? (
              <Image source={{ uri: image.url }} style={styles.preview} />
            ) : (
              <Feather name="plus" size={28} color="#00A3FF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: allFilled ? "#00A3FF" : "#BFC3C9" },
            ]}
            onPress={save}
            disabled={!allFilled || busy}
          >
            <Text style={styles.saveButtonText}>
              {busy ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function LabeledInput(props: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && { height: 100, textAlignVertical: "top" },
        ]}
        placeholderTextColor="#B0BEC5"
      />
    </View>
  );
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EAF4FA",
  },
  header: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomColor: "#EAEAEA",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: "Nunito_700Bold",
    color: "#8FA7B3",
    fontSize: 18,
  },
  formContainer: {
    padding: 20,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  label: {
    color: "#4D6F80",
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#D3E2E5",
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    color: "#5C8599",
    fontFamily: "Nunito_600SemiBold",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#B0D9FF",
    borderStyle: "dashed",
    borderRadius: 10,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "#F9FCFF",
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
  },
});
