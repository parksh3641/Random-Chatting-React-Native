// MainScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function MainScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      {/* 안내 문구 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Welcome! Ready to find your match?</Text>
      </View>

      {/* 매칭 시작 버튼 */}
      <View style={styles.bottomBox}>
        <Button
          title="Start Matching"
          onPress={() => navigation.navigate('RandomChat')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#333',
  },
  bottomBox: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    width: '100%',
  },
});
