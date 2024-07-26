// CustomTextInput.js

import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
const CustomTextInput = ({
  placeholder,
  value,
  onChangeText,
  suffixIcon,
  IconAction,
  secureTextEntry=false,
  ...rest
}: any) => {
    const [isSecureTextEntry, setIsSecureTextEntry] = useState(secureTextEntry);

    const toggleSecureEntry = () => {
        setIsSecureTextEntry(!isSecureTextEntry);
      };
    
      return (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isSecureTextEntry}
            placeholderTextColor={"#000"}
            {...rest}
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={toggleSecureEntry} style={styles.icon}>
          <Icon name={isSecureTextEntry ? "visibility-off" : "visibility"} style={styles.iconStyle} />
            </TouchableOpacity>
          )}
          {suffixIcon && <Icon name={suffixIcon} style={styles.icon} />}
        </View>
      );
    };

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#cccccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    
  },
  input: {
    flex: 1,
    height: 40,
    color:"#000",
  },
  icon: {
    fontSize: 20,
    color: "#333333",
    marginLeft: 10,
  },
  iconStyle: {
    fontSize: 20,
    color: "#333333",
  },
});

export default CustomTextInput;
