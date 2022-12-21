import {StatusBar} from 'expo-status-bar';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Image,
  Button,
  Alert,
  Pressable,
  BackHandler,
  Linking
} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from "react";
import {Ionicons} from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingTop: 40,
    paddingBottom: 0,
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 5
  },
  safeArea: {
    width: '100%',
    height: '100%',
    padding: 40,
    marginTop: '30%',
    marginBottom: 40,
    textAlign: 'center',
    color: '#888'
  },
  input: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: '#eee',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  inputText: {
    flexDirection: 'row',
    flexWrap: "wrap",
    color: '#888',
    textDecorationLine: "none"
  },
  inputTextContent: {
    flexDirection: 'row',
    minWidth: 1,
    marginTop: 0,
    maxWidth: '55%',
    flexWrap: "wrap",
    color: '#000',
    fontWeight: "bold",
    textDecorationLine: "none"
  },
  logo: {
    width: '100%',
    // Without height undefined it won't work
    height: undefined,
    // figure out your image aspect ratio
    aspectRatio: 390 / 102,
  },
  changeEnv: {
    textAlign: "left",
    padding: 0,
    textAlignVertical: "center",
    fontSize: 16,
    lineHeight: 30
  },
  button: {
    backgroundColor: '#000000'
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },

  textButtonSubmit: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
    textAlign: "center",
    marginVertical: 7
  },
  buttonSubmit: {
    width: '60%',
    height: 38,
    textAlign: "center",
    borderRadius: 30,
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: "#3d65ba",
    borderWidth: 0,
    fontSize: 16
  }
});

const App = () => {
  const [env, setEnv] = useState("");
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastEnvs, setLastEnvs] = useState([])
  const [backButton, setBackButton] = useState(true);

  const webViewRef = useRef<WebView>(null);


  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('@storage_beedoo_env', value)
    } catch (e) {
      // saving error
    }
  }

  const  shouldStartLoadWithRequest =  ({url}: any) => {
    if( Linking.canOpenURL(url) && url.search(/login/i) === 0 ){
      Linking.openURL(url);
    }else{
      setOpen(true)
    }
    return false;
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@storage_beedoo_env')
      if (value !== null) {
        setEnv(value)
        setCustomerEnv(value)
      }
    } catch (e) {
      // error reading value
      console.log('error', {e})
    }
  }

  useEffect(() => {
    getData()
  }, [])


  const onAndroidBackPress = (): boolean => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };

  useEffect((): (() => void) => {
    BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
    return (): void => {
      BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
    };
  }, []); // Never re-run this effect


  const loadingIndicatorView = () => {
    return <ActivityIndicator color='#e16215' size='large'/>
  }

  const getWidth = () => {
    if (env.length == 0) {
      return 66
    } else {
      return ((env.length) * 8) + 2
    }
  }

  const setCustomerEnv = async (valueEnv: string) => {

    const ambiente = valueEnv || env

    if (ambiente) {
      setLoading(true)
      const response = await fetch('https://' + ambiente + '.tikpag.com.br')

      if (response.status == 200) {
        setTimeout(() => {
          setLoading(false)
          ambiente && storeData(ambiente)
          setOpen(true)
        }, 1000)

        setUrl('https://' + ambiente + '.tikpag.com.br')

      } else {
        setTimeout(() => {
          setLoading(false)
          Alert.alert(
              "Atenção",
              "Não identificamos esse ambiente",
              [
                {text: "OK", onPress: () => console.log("OK Pressed")}
              ]
          );
        }, 1000)
      }
    } else {
      Alert.alert(
          "Atenção",
          "Digite o ambiente",
          [
            {text: "OK", onPress: () => console.log("OK Pressed")}
          ]
      );
    }
  }

  return (
      <View style={styles.container}>
        {open &&
            <>
              {backButton &&
                  <>
                    <View>
                      <Text style={styles.changeEnv} onPress={() => setOpen(false)}><Ionicons
                          name="chevron-back-outline" size={22}/>Voltar</Text>
                    </View>

                  </>
              }
              <WebView

                  bounces={false}
                  originWhitelist={["https://*", "http://*", "file://*", "sms://*", "whatsapp://*", "mailto://*"]}
                  allowFileAccess={true}
                  geolocationEnabled={true}
                  saveFormDataDisabled={true}
                  allowUniversalAccessFromFileURLs={true}
                  setSupportMultipleWindows={false}
                  onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
                  source={{uri: url}}
                  style={{width: '100%', height: 500}}
                  renderLoading={loadingIndicatorView}
                  startInLoadingState={true}
                  ref={webViewRef}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  onLoadProgress={({nativeEvent}) => {
                    if ('url' in nativeEvent) {
                      if (nativeEvent.url.search("login") > -1) {
                        console.log("LOGIN")
                        console.log(nativeEvent.url)
                        setBackButton(true)
                      } else {
                        setBackButton(false)
                      }
                    }
                  }}
              />
            </>
        }

        {!open &&
            <SafeAreaView>
              <View style={styles.safeArea}>
                <Image style={styles.logo} source={require('./assets/logo.png')}></Image>
                <Text style={{margin: 0, color: '#888', textAlign: 'left', marginTop: 20}}>Digite o endereço da imobiliaria</Text>
                <View style={styles.input}>
                  <Text style={styles.inputText}>https://</Text>
                  <TextInput
                      style={[styles.inputTextContent, {width: getWidth()}]}
                      onChangeText={setEnv}
                      value={env}
                      autoCapitalize="none"
                      placeholder="imobiliaria"
                  />
                  <Text style={styles.inputText}>tikpag.com.br</Text>
                </View>



                <Pressable style={styles.buttonSubmit} onPress={() => setCustomerEnv(env)}>
                  <Text style={styles.textButtonSubmit}>ENTRAR</Text>
                </Pressable>


                {loading &&
                    <View style={[styles.horizontal]}>
                      <ActivityIndicator color='#e16215' size="large"/>
                    </View>
                }


              </View>
            </SafeAreaView>
        }
      </View>


  );
}

export default App;
