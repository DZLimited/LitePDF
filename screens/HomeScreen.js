import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomFilePicker from './CustomFilePicker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HomeScreen = () => {
  const [pickedFiles, setPickedFiles] = useState([]);
  const navigation = useNavigation();

  const handleFileSelected = async (file) => {
    // setPickedFiles((prevFiles) => [...prevFiles, file]);    
    // navigation.navigate('Viewer', { file });

    const newFile = {
      ...file,
      lastPage: 1,
      openedAt: Date.now(),
    }

    try{
      const rfile = await AsyncStorage.getItem('recent_files')
      let recentFiles = rfile ? JSON.parse(rfile) : []

     recentFiles = recentFiles.filter(f => f.path !== newFile.path)

     recentFiles.unshift(newFile);

     if(recentFiles.length > 5){
      recentFiles = recentFiles.slice(0, 5)
     }

     await AsyncStorage.setItem('recent_files', JSON.stringify(recentFiles))
    } catch (err) {
       console.log('Error saving file:', e);
    }

    setPickedFiles((prevFiles) => [newFile, ...prevFiles])

    navigation.navigate('Viewer', { file: newFile })
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => {navigation.navigate('Viewer', {file: item})}}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.filePath}>{item.path}</Text>
    </TouchableOpacity>
  );

useEffect(() => {
  const loadRecentFiles = async () => {
    try {
      const existingJSON = await AsyncStorage.getItem('recent_files');
      if (existingJSON) {
        const savedFiles = JSON.parse(existingJSON);
        setPickedFiles(savedFiles);
      }
    } catch (e) {
      console.log('Error loading recent files:', e);
    }
  };

  loadRecentFiles();
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LitePDF - Pick & View</Text>

    
      <CustomFilePicker onFileSelected={handleFileSelected} />

     
      <Text style={styles.listTitle}>Recent:</Text>
      <FlatList
        data={pickedFiles}
        keyExtractor={(item, index) => item.path + index}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No files picked yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  listTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemContainer: {
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  filePath: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
  },
});

export default HomeScreen;
