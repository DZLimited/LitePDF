import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomFilePicker from './CustomFilePicker';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [pickedFiles, setPickedFiles] = useState([]);
  const navigation = useNavigation();

  const handleFileSelected = (file) => {
   
    setPickedFiles((prevFiles) => [...prevFiles, file]);

    
    navigation.navigate('Viewer', { file });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => {navigation.navigate('Viewer', {file: item})}}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.filePath}>{item.path}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LitePDF - Pick & View</Text>

    
      <CustomFilePicker onFileSelected={handleFileSelected} />

     
      <Text style={styles.listTitle}>Picked Files:</Text>
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
