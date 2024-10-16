import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";

const STORAGE_KEY = "@toDos";
const STORAGE_STATE = "@state";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const [editingKey, setEditingKey] = useState({});
  const [editText, setEditText] = useState("");

  const [dark, setDark] = useState(true);

  // const work = () => setWorking(true);
  // const travel = () => setWorking(false);

  const onPressButton = () => setWorking((prev) => !prev);

  const onChangeText = (payload) => setText(payload);

  const onChangeEditText = (payload) => setEditText(payload);

  const addTodo = () => {
    if (text === "") {
      return;
    }
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, work: working, done: false },
    };
    setToDos(newToDos);
    setStoregData(newToDos);
    setText("");
  };

  const doneTodo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
  };

  const editTodo = (key) => {
    setEditText(toDos[key].text);
    setEditingKey(key);
  };

  const saveEdit = (key) => {
    if (editText === "") {
      return;
    }
    const newTodos = { ...toDos };
    newTodos[key].text = editText;
    setToDos({ ...newTodos });

    setEditText("");
    setEditingKey(null);
  };

  const setStoregData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      alert(e);
    }
  };

  const getStorgeData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_STATE);
      const s = jsonValue != null ? JSON.parse(jsonValue) : true;
      setWorking(s);
    } catch (e) {
      alert(e);
    }
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const s = jsonValue != null ? JSON.parse(jsonValue) : {};
      setToDos(s);
    } catch (e) {
      alert(e);
    }
  };

  const workStateSet = async () => {
    try {
      const state = JSON.stringify(working);
      await AsyncStorage.setItem(STORAGE_STATE, state);
    } catch (e) {
      alert(e);
    }
  };

  const deleteHandle = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          const newTodos = { ...toDos };
          delete newTodos[key];
          setToDos(newTodos);
          setStoregData(newTodos);
        },
      },
    ]);
  };

  // useEffect는 시작할 때 모두 한 번씩 실행하기 때문에 순서가 중요하다.
  // 순서로 인해서 안됐음.
  useEffect(() => {
    getStorgeData();
  }, []);

  useEffect(() => {
    workStateSet();
  }, [working]);

  const handleOutsidePress = () => {
    if (editingKey !== null) {
      saveEdit(editingKey);
    }
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View
        style={{
          ...styles.container,
          backgroundColor: dark ? "black" : "white",
        }}
      >
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onPressButton}>
            <Text
              style={{
                ...styles.buttonText,
                color: working
                  ? dark
                    ? "white"
                    : "black"
                  : dark
                  ? theme.grey
                  : theme.silver,
              }}
            >
              Work
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressButton}>
            <Text
              style={{
                ...styles.buttonText,
                color: !working
                  ? dark
                    ? "white"
                    : "black"
                  : dark
                  ? theme.grey
                  : theme.silver,
              }}
            >
              Travel
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          onSubmitEditing={addTodo}
          style={{
            ...styles.input,
            backgroundColor: dark ? "white" : "black",
          }}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        />
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            working === toDos[key].work ? (
              <TouchableOpacity
                onLongPress={() => editTodo(key)}
                onPress={() => doneTodo(key)}
                key={key}
                style={{
                  ...styles.toDos,
                  backgroundColor: dark ? theme.toDoBg : theme.clouds,
                }}
              >
                {editingKey === key ? (
                  <TextInput
                    style={{ ...styles.text, color: dark ? "white" : "black" }}
                    onSubmitEditing={() => saveEdit(key)}
                    value={editText}
                    onBlur={handleOutsidePress}
                    onChangeText={onChangeEditText}
                    key={key}
                    returnKeyType="done"
                    autoFocus
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.text,
                      color: dark ? "white" : "black",
                      textDecorationLine: toDos[key].done
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}

                <TouchableOpacity onPress={() => deleteHandle(key)}>
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={dark ? theme.whiteGrey : theme.toDoBg}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : null
          )}
        </ScrollView>
        <TouchableOpacity
          style={{
            ...styles.mode,
            backgroundColor: dark ? "black" : "white",
            shadowColor: dark ? "white" : "black",
          }}
          onPress={() => setDark((prev) => !prev)}
        >
          {dark ? (
            <Ionicons name="moon-outline" size={34} color="white" />
          ) : (
            <Ionicons name="sunny-outline" size={34} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  mode: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,

    width: 70,
    height: 70,
    borderRadius: "50%",
    position: "absolute",
    bottom: 70,
    right: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  buttonText: {
    fontSize: 38,
    fontWeight: "700",
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
  },
  toDos: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
});
