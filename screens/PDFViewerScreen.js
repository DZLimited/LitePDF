import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

const PDFViewerScreen = ({ route }) => {
  const navigation = useNavigation();
  const { file } = route?.params || {};

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  if (!file) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No file provided</Text>
      </View>
    );
  }

  // Load local viewer.html with ?file=
  const viewerUri = Platform.OS === 'android'
    ? `file:///android_asset/pdfjs/web/viewer.html?file=${file.path}`
    : `./assets/pdfjs/web/viewer.html?file=${file.path}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {file.name || 'Document Viewer'}
        </Text>
        <View style={styles.rightSpace} />
      </View>

      <WebView
        source={{ uri: viewerUri }}
        originWhitelist={['*']}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#2c3e50',
  },
  backButton: { padding: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  headerTitle: {
    flex: 1, color: '#fff', fontSize: 18, fontWeight: '600',
    textAlign: 'center', marginHorizontal: 16,
  },
  rightSpace: { width: 40 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red' },
});

export default PDFViewerScreen;
