import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useAuth } from './loginState';

export const ProfileViewComponent: React.FC<any> = ({ logout }) => {
    // Get authentication state
    const { authState } = useAuth();
    
    return (
        <ImageBackground 
        style ={styles.container}
        source = {require('../../assets/images/hikeimage2.avif')}
        resizeMode = 'cover'
      >
        <View style={styles.profileContainer}>
          <Image source={require('../../assets/images/default-profile-pic.jpg')} style={styles.profilePicture} />
          <Text style={styles.name}>{authState?.username ? authState?.username : null}</Text>
          <Text style={styles.email}>{authState?.email ? authState?.email : null}</Text>
          <View style={styles.favoriteHikesContainer}>
            <Text> Test </Text>
          </View>
          <TouchableOpacity 
          style={styles.logout}
          onPress={logout}>
            <Text style={styles.buttontext}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
    },
    logout: {
        position: 'absolute',
        backgroundColor: "#023020",
        bottom: 10,
        left: 0,
        right: 0,
        padding: 20,
        marginRight: 10,
        marginLeft: 10,
    },
    buttontext: {
        color: "white",
        fontSize: 20,
        fontWeight: "ultralight",
        textAlign: "center",
    },
    profileContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 50,
        marginTop: 75,
        marginBottom: 20,
        backgroundColor: 'white'
    },
    profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    favoriteHikesContainer: {
        backgroundColor: "grey",
        marginTop: 10,
        width: 150
    }
});
