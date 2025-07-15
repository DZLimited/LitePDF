import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  PermissionsAndroid,
  Platform,
  BackHandler,
  Dimensions,
} from 'react-native';
import RNFS from 'react-native-fs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faFolder, 
  faFilePdf, 
  faFileWord, 
  faFile, 
  faChevronRight, 
  faFolderOpen, 
  faArrowLeft, 
  faTimes, 
  faSearch,
  faDownload,
  faImage,
  faMusic,
  faCamera
} from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(
  faFolder, faFilePdf, faFileWord, faFile, faChevronRight, 
  faFolderOpen, faArrowLeft, faTimes, faSearch,
  faDownload, faImage, faMusic, faCamera
);

const { width } = Dimensions.get('window');

const CustomFilePicker = ({ onFileSelected }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const shortcutFolders = [
    { name: 'Download', icon: faDownload },
    { name: 'Documents', icon: faFolder  },
    { name: 'Pictures', icon: faImage },
    { name: 'Music', icon: faMusic },
    { name: 'DCIM', icon: faCamera },
  ];

    
  const fileTypes = ['pdf'];

  useEffect(() => {
    if (Platform.OS === 'android') {
      setCurrentPath(RNFS.ExternalStorageDirectoryPath);
    } else {
      setCurrentPath(RNFS.DocumentDirectoryPath);
    }
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return (
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission request failed:', err);
        return false;
      }
    }
    return true;
  };

  // Fixed file extension detection
  const getFileExtension = (filename) => {
    if (!filename || typeof filename !== 'string') return '';
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filename.substring(lastDotIndex + 1).toLowerCase();
  };

  // Fixed file type checking with case insensitive comparison
  const isFileTypeAllowed = (filename) => {
    const extension = getFileExtension(filename);
    return fileTypes.includes(extension);
  };

 const getFileIcon = (filename, isDirectory) => {
  if (isDirectory) return faFolder;
  const extension = getFileExtension(filename);
  if (extension === 'pdf') return faFilePdf;
  if (extension === 'docx' || extension === 'doc') return faFileWord;
  return faFile;
};

  const navigateToShortcut = (folderName) => {
  try {
    const newPath = `${RNFS.ExternalStorageDirectoryPath}/${folderName}`;
    
    // Check if directory exists before navigating
    RNFS.exists(newPath)
      .then(exists => {
        if (exists) {
          navigateToDirectory(newPath);
        } else {
          Alert.alert(
            'Folder Not Found',
            `The ${folderName} folder doesn't exist at this location`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(error => {
        console.error('Error checking folder:', error);
        Alert.alert('Error', `Couldn't access ${folderName} folder`);
      });
      
  } catch (error) {
    console.error('Navigation error:', error);
    Alert.alert('Error', 'Failed to navigate to folder');
  }
};

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

 const loadFiles = async (path) => {
  setLoading(true);
  try {
    const items = await RNFS.readDir(path);
    
    const processedFiles = items.map(item => {
      const extension = item.isDirectory() ? null : getFileExtension(item.name);
      const isAllowed = item.isDirectory() ? true : isFileTypeAllowed(item.name);
      
      return {
        name: item.name,
        path: item.path,
        size: item.size,
        isDirectory: item.isDirectory(),
        extension: extension,
        icon: getFileIcon(item.name, item.isDirectory()), // Use getFileIcon for all cases
        isAllowed: isAllowed,
        mtime: item.mtime
      };
    });

    const sortedFiles = processedFiles.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    setFiles(sortedFiles);
  } catch (error) {
    console.error('Error loading files:', error);
    Alert.alert('Error', 'Failed to load files from this directory');
  } finally {
    setLoading(false);
  }
};

  const navigateToDirectory = (path) => {
    setPathHistory([...pathHistory, currentPath]);
    setCurrentPath(path);
    setSearchQuery('');
  };

  const goBack = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      setCurrentPath(previousPath);
      setSearchQuery('');
    }
  };

  const handleItemPress = (item) => {
    if (item.isDirectory) {
      navigateToDirectory(item.path);
    } else if (item.isAllowed) {
      onFileSelected({
        name: item.name,
        path: item.path,
        size: item.size,
        type: item.extension,
        uri: `file://${item.path}`,
      });
      setIsVisible(false);
    } else {
      Alert.alert('File Type Not Allowed', `Only ${fileTypes.join(', ')} files are allowed.`);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPicker = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required.');
      return;
    }

    setIsVisible(true);
    if (currentPath) {
      loadFiles(currentPath);
    }
  };

  useEffect(() => {
    if (currentPath && isVisible) {
      loadFiles(currentPath);
    }
  }, [currentPath, isVisible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isVisible) {
        if (pathHistory.length > 0) {
          goBack();
          return true;
        } else {
          setIsVisible(false);
          return true;
        }
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isVisible, pathHistory]);


  const renderFileItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.fileItem, !item.isAllowed && !item.isDirectory && styles.disabledItem]}
      onPress={() => handleItemPress(item)}
      disabled={!item.isAllowed && !item.isDirectory}
    >
      <FontAwesomeIcon 
        icon={item.icon} 
        size={20} 
        color={item.isDirectory ? '#FFA726' : '#5C6BC0'} 
        style={styles.fileIcon}
      />
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, !item.isAllowed && styles.disabledText]}>
          {item.name}
        </Text>
        <View style={styles.fileMeta}>
          {!item.isDirectory && (
            <Text style={styles.fileSize}>
              {formatFileSize(item.size)} • {item.extension?.toUpperCase()}
            </Text>
          )}
          <Text style={styles.fileDate}>
            {new Date(item.mtime).toLocaleDateString()}
          </Text>
        </View>
      </View>
      {item.isDirectory && (
        <FontAwesomeIcon icon={faChevronRight} size={16} color="#BDBDBD" />
      )}
    </TouchableOpacity>
  );

  const renderShortcut = ({ item }) => (
    <TouchableOpacity
      style={styles.shortcutItem}
      onPress={() => navigateToShortcut(item.name)}
    >
      <View style={styles.shortcutIconContainer}>
        <FontAwesomeIcon icon={item.icon} size={20} color="#5C6BC0" />
      </View>
      <Text style={styles.shortcutText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity style={styles.openButton} onPress={openPicker}>
        <FontAwesomeIcon icon={faFolderOpen} size={16} color="white" style={styles.buttonIcon} />
        <Text style={styles.openButtonText}>Browse Files</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide" onRequestClose={() => setIsVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={goBack} disabled={pathHistory.length === 0}>
                <FontAwesomeIcon 
                  icon={faArrowLeft} 
                  size={20} 
                  color={pathHistory.length === 0 ? '#BDBDBD' : '#5C6BC0'} 
                />
              </TouchableOpacity>
              <Text style={styles.currentPath} numberOfLines={1} ellipsizeMode="head">
                {currentPath.split('/').pop() || 'Storage'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <FontAwesomeIcon icon={faTimes} size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} size={16} color="#9E9E9E" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.shortcutContainer}>
            <FlatList
              horizontal
              data={shortcutFolders}
              renderItem={renderShortcut}
              keyExtractor={(item) => item.name}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shortcutList}
            />
          </View>

          <FlatList
            data={filteredFiles}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.path}
            refreshing={loading}
            onRefresh={() => loadFiles(currentPath)}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon icon={faFolderOpen} size={40} color="#E0E0E0" />
                <Text style={styles.emptyText}>
                  {loading ? 'Loading files...' : 'No files found'}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  openButton: {
    backgroundColor: '#5C6BC0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  currentPath: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginLeft: 16,
    flexShrink: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#424242',
    fontSize: 14,
  },
  shortcutContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  shortcutList: {
    paddingHorizontal: 8,
  },
  shortcutItem: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  shortcutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shortcutText: {
    fontSize: 12,
    color: '#424242',
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  disabledItem: {
    opacity: 0.6,
  },
  fileIcon: {
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  disabledText: {
    color: '#9E9E9E',
  },
  fileMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
  },
  fileDate: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default CustomFilePicker;