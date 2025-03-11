import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { StyleSheet, Text, Modal, TouchableOpacity, View, Alert } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { TextInput } from 'react-native-gesture-handler';
import Icon from '@expo/vector-icons/FontAwesome';
import axios from "axios";
import { format, add, sub, endOfDay, parse } from 'date-fns';
import { useAuth } from "./loginState";

const API_URL = "https://hikereview-flaskapp-546900130284.us-west1.run.app/";

export const GroupCreation: React.FC<any> = ({ trail, viewReset, dateReset, dateConverter }) => {
    // For login context
    const { authState } = useAuth();

    // Group Creation Form
    const { control, handleSubmit, setError, clearErrors, reset, formState: { errors } } = useForm({
        defaultValues: {
          group_name: "",
          description: "",
          for_date: new Date()
        }
    });

    // Form submission
    const onSubmit = async (data: {
        group_name: string,
        description: string,
        for_date: Date
    }) => {
        try {
            // POST created group
            console.log(data);
            console.log(format(selected_date, 'yyyy-MM-dd HH:mm:ss'));
            const groupDB = await axios.post(API_URL + "groups", {
                trail_id: trail,
                group_host: authState!.username!,
                group_name: data.group_name,
                group_description: data.description,
                start_time: format(selected_date, 'yyyy-MM-dd HH:mm:ss'),
            }).then(
                (response) => {
                    console.log("response: ");
                    console.log(response.status);
                    if(response.status != 201){
                        // Error
                        Alert.alert('Error', 'Unable to create group');
                        return
                    }
                    // Success
                    Alert.alert("Success", "Created group" + data.group_name);
                    viewReset("group");
                    dateReset(trail);
                }
            )
          }
          catch (error) {
            console.log(error);
          }
        }
    
    // Error logging
    const onInvalid = (invalid: any) => {
        console.error(invalid);
    }
    
    // Group Date selection
    const [selected_date, selectDate] = useState<Date>(new Date());

    const setDate = (event: DateTimePickerEvent, date: Date) => {
        const {
          type,
          nativeEvent: {timestamp, utcOffset},
        } = event;
        selectDate(date);
      };
    
    return(
        <View style={styles.contentContainer}>
            <Modal
                transparent = {true}
                animationType = "fade"
            >
            <View style={styles.loadingOverlay}>
                <View style={styles.createGroupModal}> 
                    <Text style={styles.createGroupHeader}>
                        New Group
                    </Text>
                    <View style={styles.form}>
                        <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                            style={styles.input} 
                            placeholder="Group Name" 
                            placeholderTextColor={'gray'}
                            onChangeText = {onChange}
                            value={value}
                            onBlur={() => {}}
                            />
                        )}
                        name="group_name"
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
                                placeholder="Group Description" 
                                placeholderTextColor={'gray'}
                                onChangeText = {onChange}
                                value={value}
                                onBlur={() => {}}
                            />
                            )}
                            name="description"
                            rules = {
                            {
                                required: true
                            }
                            }
                        /> 
                        {(errors.group_name || errors.description) && <Text> {"Enter group name and description"} </Text>}
                    </View>
                    <TouchableOpacity
                        style={styles.closeGroupModal}
                        onPress={() => viewReset("group")}
                    >
                        <Icon
                        name="close"
                        color={"red"}
                        size = {35}
                        style={{
                            position: "absolute",
                            top: 6,
                            left: 12,
                        }}
                        />
                    </TouchableOpacity>
                    <Controller
                            control={control}
                            render={({field: {onChange, value}}) => (
                                <RNDateTimePicker
                                style = {styles.datePicker}
                                testID="dateTimePicker"
                                value={selected_date}
                                minimumDate={new Date()}
                                mode="datetime"
                                display="default"
                                textColor= "black"
                                onChange={(event, date) => setDate(event, date!)}
                                />
                            )}
                            name="for_date"
                        />
                    </View>
                    <View style = {styles.buttonlayout}> 
                        <TouchableOpacity 
                        style={styles.button}
                        onPress={handleSubmit(onSubmit, onInvalid)}>
                            <Text style={styles.buttontext}>
                            Create
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        backgroundColor: "black",
        flex: 1,
        alignItems: "center",
        padding: 0,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white'
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    createGroup: {
        position: 'absolute',
        top: 430,
        bottom: 15,
        left: 315,
        right: 10,
        backgroundColor: 'blue',
        padding: 20,
        borderRadius: 20,
        alignContent: "center",
        justifyContent: "center",
    },
    createGroupModal: {
        backgroundColor: 'white',
        top: 70,
        padding: 20,
        borderRadius: 20,
        width: '80%',
        height: '37%', 
        // justifyContent: 'center',
        alignItems: 'center',
    },
    createGroupHeader: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
        marginBottom: 20,
    },
    closeGroupModal: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 17,
        alignContent: "center",
    },
    datePicker: {
        right: 5,
        top: 78,
        borderRadius: 17,
    },
    form: {
        gap: 10,
        width: '85%',
        height: "15%",
    },
    buttonlayout: {
        height: "10%",
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
    },
    button: {
        backgroundColor: "#023020",
        borderRadius: 20,
        width: "120%",
        height: "65%",
        justifyContent: 'center',
        marginBottom: 35,
    },
    buttontext: {
        color: "white",
        fontSize: 20,
        fontWeight: "ultralight",
        textAlign: "center",
    },
})