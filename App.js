/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component }  from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  FlatList,
  Button,
  ActivityIndicator,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {
GoogleSignin,
GoogleSigninButton,
statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '534027295094-n5s4geaqa7aopb618ltglb9hf0c3mnkv.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: null,
      isLoading: true,
      isLoggedIn: false,
      userInfo: null,
    };
  }

  onGoogleButtonPress = async () => {
    try {
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
      this.setState({ isLoggedIn: true });

      firebase.auth().onAuthStateChanged((user) => {
        if(user) {
          console.log('username', user.displayName);
          this.setState({userInfo: user.displayName})
        }
      });

    } catch (error) {
       console.log(error);
    }
  };

  componentDidMount () {
    this.isSignedIn();
    firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        console.log('username', user.displayName);
        this.setState({userInfo: user.displayName})
      }
    });
  }

  isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    console.log(isSignedIn);
    this.setState({ isLoggedIn: isSignedIn });
  }



  signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({ idToken: null, isLoggedIn: false, userInfo: null, });
      console.log("signed out");
      console.log(this.state); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };




  render() {

    if (!this.state.isLoggedIn){
        return (
              <ScrollView style={styles.body}>
                <SafeAreaView>
                  <View style={styles.header}>
                    <Text style={styles.heading}>Image Collector</Text>
                  </View>

                  <View style={styles.login}>
                    <Text style={styles.sectionTitle}>You need to Login first!</Text>
                    <GoogleSigninButton
                       style={{ width: "90%", height: 55, marginTop:10 }}
                       size={GoogleSigninButton.Size.Wide}
                       color={GoogleSigninButton.Color.Dark}
                       onPress={this.onGoogleButtonPress}

                       />

                  </View>
                </SafeAreaView>
              </ScrollView>

              );
        }else {
            return (
              <ScrollView style={styles.body}>
                <View style={styles.btn}>
                  <Text style={styles.sectionTitle}>Hello, {this.state.userInfo}</Text>
                  <Text style={styles.sectionName}> You are now logged in!</Text>
                  <Button
                    title="Log Out"
                    onPress={this.signOut} />
                </View>
                <HomeView />
              </ScrollView>
            );
        }

      }
}

class HomeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
       items : [],
       isLoading: true,
    };
  }

  componentDidMount() {
    fetch('https://imagecollector-aps.herokuapp.com/api-list/')
      .then((res) => res.json())
      .then((resJson) => this.setState({items: resJson}) )
      .catch((error) => {
      console.log(error)
    });

    setTimeout(() => {
      this.setState({
      isLoading: false,
      });
    }, 2000);
  }

  render() {
    if(this.state.isLoading) {
      return (
         <ActivityIndicator size="large" color="red" />
      );
    } else {
        return (
              //<ScrollView style={styles.body}>
                <SafeAreaView>
                  <View style={styles.header}>
                    <Text style={styles.heading}>Image Collector</Text>

                  </View>
                  {this.state.items.map(function(item, index){
                    return (
                      <View key={index} style={styles.sectionContainer}>
                        <Image style={styles.sectionImage} source={{uri: 'https://imagecollector-aps.herokuapp.com' + item.photo}} />
                        <Text style={styles.sectionTitle}>{item.title}</Text>
                        <Text style={styles.sectionDescription}>{item.description}</Text>
                        <Text style={styles.sectionName}>Uploaded by : {item.name}</Text>
                        <Text style={styles.sectionDescription}> {item.date} </Text>
                      </View>
                    );
                   }
                  )}
                </SafeAreaView>
              //</ScrollView>
              );
     }
  }
}



const styles = StyleSheet.create({
  body: {
    backgroundColor: "#9DC88D",
  },
  login: {
    marginTop: 100,
    marginBottom: 20,
    backgroundColor: Colors.white,
    width: "95%",
    marginRight: "2.5%",
    marginLeft: "2.5%",
    alignItems: "center",
    padding: 20,
  },
  btn: {
    alignItems: "center",
  },

  header: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  heading: {
    width: "95%",
    marginRight: "2.5%",
    marginLeft: "2.5%",
    padding: 5,
    backgroundColor: "#164A41",
    textAlign: "center",
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: Colors.white,
    width: "90%",
    marginRight: "5%",
    marginLeft: "5%",
    minHeight: 400,
    padding: 5,
  },
  sectionImage: {
    width: "100%",
    height: 350,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.black,
    marginLeft: 20,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
    marginLeft: 20,
  },
  sectionName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginLeft: 20,
  },
});

export default App;
