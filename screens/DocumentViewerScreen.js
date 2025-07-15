// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   BackHandler,
//   Dimensions,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import RNFS from 'react-native-fs';

// const DocumentViewerScreen = ({ route, navigation }) => {
//   const { file } = route.params;
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [webViewRef, setWebViewRef] = useState(null);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const [canGoForward, setCanGoForward] = useState(false);

//   const screenWidth = Dimensions.get('window').width;
//   const screenHeight = Dimensions.get('window').height;

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       if (canGoBack && webViewRef) {
//         webViewRef.goBack();
//         return true;
//       }
//       return false;
//     });

//     return () => backHandler.remove();
//   }, [canGoBack, webViewRef]);

//   const createPDFViewerHTML = (filePath) => {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
//         <title>PDF Viewer</title>
//         <style>
//             * {
//                 margin: 0;
//                 padding: 0;
//                 box-sizing: border-box;
//             }
//             body {
//                 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//                 background-color: #f5f5f5;
//                 height: 100vh;
//                 display: flex;
//                 flex-direction: column;
//             }
//             .controls {
//                 background: #fff;
//                 padding: 10px;
//                 border-bottom: 1px solid #ddd;
//                 display: flex;
//                 justify-content: space-between;
//                 align-items: center;
//                 flex-wrap: wrap;
//                 gap: 10px;
//             }
//             .btn {
//                 background: #4a90e2;
//                 color: white;
//                 border: none;
//                 padding: 8px 16px;
//                 border-radius: 6px;
//                 cursor: pointer;
//                 font-size: 14px;
//                 font-weight: 500;
//             }
//             .btn:hover {
//                 background: #357abd;
//             }
//             .btn:disabled {
//                 background: #ccc;
//                 cursor: not-allowed;
//             }
//             .zoom-controls {
//                 display: flex;
//                 align-items: center;
//                 gap: 10px;
//             }
//             .zoom-level {
//                 font-size: 14px;
//                 font-weight: 500;
//                 min-width: 60px;
//                 text-align: center;
//             }
//             .viewer-container {
//                 flex: 1;
//                 background: #525659;
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 overflow: hidden;
//             }
//             .pdf-embed {
//                 width: 100%;
//                 height: 100%;
//                 border: none;
//             }
//             .error-message {
//                 color: #ff3b30;
//                 text-align: center;
//                 padding: 20px;
//                 font-size: 16px;
//             }
//             .loading {
//                 text-align: center;
//                 padding: 20px;
//                 font-size: 16px;
//                 color: #666;
//             }
//             .page-info {
//                 font-size: 14px;
//                 color: #666;
//             }
//             @media (max-width: 480px) {
//                 .controls {
//                     flex-direction: column;
//                     gap: 5px;
//                 }
//                 .btn {
//                     padding: 6px 12px;
//                     font-size: 12px;
//                 }
//                 .zoom-controls {
//                     flex-direction: row;
//                     justify-content: center;
//                     width: 100%;
//                 }
//             }
//         </style>
//     </head>
//     <body>
//         <div class="controls">
//             <div class="zoom-controls">
//                 <button class="btn" onclick="zoomOut()">−</button>
//                 <span class="zoom-level" id="zoomLevel">100%</span>
//                 <button class="btn" onclick="zoomIn()">+</button>
//             </div>
//             <button class="btn" onclick="resetView()">Reset View</button>
//             <button class="btn" onclick="toggleFullscreen()">Fullscreen</button>
//         </div>
        
//         <div class="viewer-container">
//             <embed 
//                 id="pdfViewer"
//                 src="file://${filePath}#toolbar=1&navpanes=1&scrollbar=1&view=FitH"
//                 type="application/pdf"
//                 class="pdf-embed"
//                 onerror="showError('Failed to load PDF')"
//             />
//         </div>

//         <script>
//             let currentZoom = 100;
//             let pdfViewer = document.getElementById('pdfViewer');
//             let zoomLevelSpan = document.getElementById('zoomLevel');

//             function zoomIn() {
//                 if (currentZoom < 300) {
//                     currentZoom += 25;
//                     updateZoom();
//                 }
//             }

//             function zoomOut() {
//                 if (currentZoom > 50) {
//                     currentZoom -= 25;
//                     updateZoom();
//                 }
//             }

//             function updateZoom() {
//                 zoomLevelSpan.textContent = currentZoom + '%';
//                 pdfViewer.style.transform = 'scale(' + (currentZoom / 100) + ')';
//                 pdfViewer.style.transformOrigin = 'top center';
//             }

//             function resetView() {
//                 currentZoom = 100;
//                 updateZoom();
//                 pdfViewer.src = pdfViewer.src.split('#')[0] + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH';
//             }

//             function toggleFullscreen() {
//                 if (document.fullscreenElement) {
//                     document.exitFullscreen();
//                 } else {
//                     document.documentElement.requestFullscreen();
//                 }
//             }

//             function showError(message) {
//                 document.querySelector('.viewer-container').innerHTML = 
//                     '<div class="error-message">' + message + '</div>';
//             }

//             // Handle PDF loading
//             pdfViewer.onload = function() {
//                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                     type: 'loaded',
//                     message: 'PDF loaded successfully'
//                 }));
//             };

//             pdfViewer.onerror = function() {
//                 showError('Unable to load PDF. The file may be corrupted or unsupported.');
//                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                     type: 'error',
//                     message: 'PDF loading failed'
//                 }));
//             };
//         </script>
//     </body>
//     </html>
//     `;
//   };

//   const createDocViewerHTML = (filePath) => {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Document Viewer</title>
//         <style>
//             * {
//                 margin: 0;
//                 padding: 0;
//                 box-sizing: border-box;
//             }
//             body {
//                 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//                 background-color: #f5f5f5;
//                 height: 100vh;
//                 display: flex;
//                 flex-direction: column;
//             }
//             .header {
//                 background: #fff;
//                 padding: 15px;
//                 border-bottom: 1px solid #ddd;
//                 text-align: center;
//             }
//             .title {
//                 font-size: 18px;
//                 font-weight: 600;
//                 color: #333;
//             }
//             .subtitle {
//                 font-size: 14px;
//                 color: #666;
//                 margin-top: 5px;
//             }
//             .content {
//                 flex: 1;
//                 padding: 20px;
//                 background: #fff;
//                 margin: 10px;
//                 border-radius: 8px;
//                 box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//                 overflow-y: auto;
//             }
//             .error-message {
//                 color: #ff3b30;
//                 text-align: center;
//                 padding: 40px 20px;
//                 font-size: 16px;
//                 line-height: 1.5;
//             }
//             .loading {
//                 text-align: center;
//                 padding: 40px 20px;
//                 font-size: 16px;
//                 color: #666;
//             }
//             .doc-info {
//                 background: #f8f9fa;
//                 padding: 15px;
//                 border-radius: 6px;
//                 margin-bottom: 20px;
//                 border-left: 4px solid #4a90e2;
//             }
//             .doc-info h3 {
//                 color: #333;
//                 margin-bottom: 8px;
//             }
//             .doc-info p {
//                 color: #666;
//                 font-size: 14px;
//                 margin: 4px 0;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="header">
//             <div class="title">Document Viewer</div>
//             <div class="subtitle">Offline Document Reader</div>
//         </div>
        
//         <div class="content">
//             <div class="doc-info">
//                 <h3>Document Information</h3>
//                 <p><strong>File:</strong> ${file.name}</p>
//                 <p><strong>Size:</strong> ${file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}</p>
//                 <p><strong>Type:</strong> ${file.type?.toUpperCase() || 'Document'}</p>
//                 <p><strong>Location:</strong> ${file.path}</p>
//             </div>
            
//             <div class="error-message">
//                 <h3>Document Preview Not Available</h3>
//                 <p>This document format requires a specialized viewer.</p>
//                 <p>For Word documents (.doc, .docx), consider converting to PDF for better viewing experience.</p>
//                 <br>
//                 <p><strong>File Path:</strong> ${filePath}</p>
//                 <p><strong>You can try opening this file with:</strong></p>
//                 <ul style="text-align: left; margin-top: 10px;">
//                     <li>Microsoft Word</li>
//                     <li>Google Docs</li>
//                     <li>WPS Office</li>
//                     <li>Other document viewers</li>
//                 </ul>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;
//   };

//   const getViewerHTML = () => {
//     if (!file) return '';
    
//     const fileExtension = file.type?.toLowerCase();
    
//     if (fileExtension === 'pdf') {
//       return createPDFViewerHTML(file.path);
//     } else if (fileExtension === 'doc' || fileExtension === 'docx') {
//       return createDocViewerHTML(file.path);
//     } else {
//       return createDocViewerHTML(file.path);
//     }
//   };

//   const handleWebViewMessage = (event) => {
//     try {
//       const data = JSON.parse(event.nativeEvent.data);
      
//       if (data.type === 'loaded') {
//         setLoading(false);
//         setError(null);
//       } else if (data.type === 'error') {
//         setLoading(false);
//         setError(data.message);
//       }
//     } catch (err) {
//       console.error('Error parsing WebView message:', err);
//     }
//   };

//   const handleWebViewError = (syntheticEvent) => {
//     const { nativeEvent } = syntheticEvent;
//     console.error('WebView error:', nativeEvent);
//     setLoading(false);
//     setError('Failed to load document viewer');
//   };

//   const handleWebViewLoadEnd = () => {
//     setLoading(false);
//   };

//   const handleNavigationStateChange = (navState) => {
//     setCanGoBack(navState.canGoBack);
//     setCanGoForward(navState.canGoForward);
//   };

//   const openFileExternally = async () => {
//     try {
//       Alert.alert(
//         'Open Externally',
//         'Would you like to try opening this file with another app?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { 
//             text: 'Open', 
//             onPress: () => {
//               // This would typically use react-native-file-opener or similar
//               Alert.alert('Info', 'External app opening not implemented yet');
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       Alert.alert('Error', 'Unable to open file externally');
//     }
//   };

//   if (!file) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>No file selected</Text>
//           <TouchableOpacity 
//             style={styles.button}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.buttonText}>Go Back</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.backButtonText}>← Back</Text>
//         </TouchableOpacity>
        
//         <View style={styles.headerInfo}>
//           <Text style={styles.fileName} numberOfLines={1}>
//             {file.name}
//           </Text>
//           <Text style={styles.fileType}>
//             {file.type?.toUpperCase()} • {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
//           </Text>
//         </View>
        
//         <TouchableOpacity 
//           style={styles.menuButton}
//           onPress={openFileExternally}
//         >
//           <Text style={styles.menuButtonText}>⋮</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Viewer */}
//       <View style={styles.viewerContainer}>
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#4a90e2" />
//             <Text style={styles.loadingText}>Loading document...</Text>
//           </View>
//         )}
        
//         <WebView
//           ref={setWebViewRef}
//           source={{ html: getViewerHTML() }}
//           style={styles.webView}
//           onMessage={handleWebViewMessage}
//           onError={handleWebViewError}
//           onLoadEnd={handleWebViewLoadEnd}
//           onNavigationStateChange={handleNavigationStateChange}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           allowFileAccess={true}
//           allowFileAccessFromFileURLs={true}
//           allowUniversalAccessFromFileURLs={true}
//           mixedContentMode="compatibility"
//           originWhitelist={['*']}
//           startInLoadingState={true}
//           renderLoading={() => (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#4a90e2" />
//               <Text style={styles.loadingText}>Loading document...</Text>
//             </View>
//           )}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     padding: 8,
//   },
//   backButtonText: {
//     color: '#4a90e2',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   headerInfo: {
//     flex: 1,
//     marginHorizontal: 16,
//   },
//   fileName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   fileType: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   menuButton: {
//     padding: 8,
//   },
//   menuButtonText: {
//     color: '#666',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   viewerContainer: {
//     flex: 1,
//     position: 'relative',
//   },
//   webView: {
//     flex: 1,
//   },
//   loadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     zIndex: 1000,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     color: '#ff3b30',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#4a90e2',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default DocumentViewerScreen;