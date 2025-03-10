import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Text, TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export const SignUpComponent: React.FC<any> = ({ signUp, close }) => {
    // Login form
    const { control, handleSubmit, setError, clearErrors, reset, formState: { errors } } = useForm({
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    });

    // Submit signup form
    const onSubmit = (data: any) => {
        console.log(data);
        signUp(data.username, data.email, data.password);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Create Account 
            </Text>
            <View style={styles.form}>
                <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                        style={styles.input} 
                        placeholder="Username" 
                        placeholderTextColor={'gray'}
                        onChangeText = {onChange}
                        value={value}
                        onBlur={() => {}}
                        />
                    )}
                    name="username"
                    rules = {
                        {
                        required: true
                        }
                    }
                />
                <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                        style={styles.input} 
                        placeholder="Email" 
                        placeholderTextColor={'gray'}
                        onChangeText = {onChange}
                        value={value}
                        onBlur={() => {}}
                        />
                    )}
                    name="email"
                    rules = {
                        {
                        required: true
                        }
                    }
                />
                <Controller
                    control={control}
                    render={({field: {onChange, value}}) => (
                        <TextInput 
                        style={styles.input} 
                        placeholder="Password" 
                        secureTextEntry={true} 
                        placeholderTextColor={'gray'}
                        onChangeText = {onChange}
                        value={value}
                        onBlur={() => {}}
                        />
                    )}
                    name="password"
                    rules = {
                        {
                        required: true
                        }
                    }
                /> 
            </View>
            <View style={styles.buttonlayout}>
                <TouchableOpacity 
                style={styles.button}
                onPress={() => close()}>
                    <Text style={styles.buttontext}>
                    Cancel
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                style={styles.button}
                onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.buttontext}>
                        Create
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    title: {
        color: "white",
        fontSize: 40,
        height: "10%",
        fontWeight: "bold",
    },
    form: {
        bottom: 63,
        gap: 10,
        width: '65%',
        height: "15%",
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white'
    },
    button: {
        backgroundColor: "#023020",
        borderRadius: 20,
        top: 80,
        width: "130%",
        height: "145%",
        justifyContent: 'center',
    },
    buttontext: {
        color: "white",
        fontSize: 20,
        fontWeight: "ultralight",
        textAlign: "center",
    },
    buttonlayout: {
        flexDirection: "row",
        gap: 40,
        height: "10%",
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
    },
    header: {
        bottom: 87,
        fontSize: 30,
        fontWeight: "bold",
        color: "black",
    },
})