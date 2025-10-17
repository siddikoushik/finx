import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import { useAuthStore, useSettingsStore } from '../store';
import { LayoutConfig } from '../config/layout';
import { useNavigation } from '@react-navigation/native';

interface RoundProfileIconProps {}

export default function RoundProfileIcon({}: RoundProfileIconProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { signOut } = useAuthStore();
  const { darkModeOverride, setDarkMode } = useSettingsStore();
  const navigation = useNavigation<any>();

  const navigate = (screen: string) => navigation.navigate(screen);

  return (
    <View style={styles.container}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="account-circle"
            size={LayoutConfig.profileIcon.size}
            iconColor="white"
            containerColor={LayoutConfig.profileIcon.backgroundColor}
            onPress={() => setMenuVisible(true)}
            style={styles.profileIcon}
          />
        }
      >
        <Menu.Item onPress={() => { setMenuVisible(false); navigate('Profile'); }} title="Profile" leadingIcon="account" />
        <Menu.Item onPress={() => { setMenuVisible(false); navigate('History'); }} title="History" leadingIcon="history" />
        <Menu.Item onPress={() => setDarkMode(darkModeOverride === 'dark' ? 'light' : 'dark')} title={darkModeOverride === 'dark' ? 'Light Theme' : 'Dark Theme'} leadingIcon="theme-light-dark" />
        <Menu.Item onPress={() => { setMenuVisible(false); signOut(); }} title="Logout" leadingIcon="logout" titleStyle={styles.logoutText} />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: LayoutConfig.profileIcon.top,
    right: LayoutConfig.profileIcon.right,
    zIndex: LayoutConfig.profileIcon.zIndex,
  },
  profileIcon: {
    borderRadius: LayoutConfig.profileIcon.size / 2,
  },
  logoutText: {
    color: LayoutConfig.colors.error,
  },
});
