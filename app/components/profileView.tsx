import React, { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, ImageBackground, Image, ScrollView } from 'react-native';
import { useAuth } from './loginState';
import { useFocusEffect } from 'expo-router';

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
          <ScrollView style={styles.favoriteHikesContainer}>
            <Text style={styles.favoriteHikeTitle}>  Favorites </Text>
            {authState?.favoriteHikes && authState?.favoriteHikes.length > 0 ? authState.favoriteHikes!.map((hike_name: string, key: number) => (
                <Text key={key} style={styles.favoriteHikeSubText}>
                    {hike_name}
                </Text>
            )) : 
            <Text style={styles.favoriteHikeSubText}>
                "No favorite hikes"
            </Text>
            }
          </ScrollView>
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
        borderRadius: 15,
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
        width: 300,
        padding: 75,
        marginTop: 75,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    favoriteHikesContainer: {
        flex: 1,
        backgroundColor: "lightgrey",
        marginTop: 15,
        marginBottom: 15,
        width: 280,
        height: "70%",
        borderRadius: 15,
    },
    favoriteHikeTitle: {
        fontWeight: "condensedBold",
        fontSize: 22,
    },
    favoriteHikeSubText: {
        textAlign: "center",
        fontSize: 15,
    },
});
