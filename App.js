// Inspiration: https://dribbble.com/shots/6520262-Mars
// Planet image: https://pngimg.com/download/61156
import React from 'react';
import {
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  StatusBar
} from 'react-native';
import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { createFluidNavigator, Transition } from 'react-navigation-fluid-transitions';
const { width, height } = Dimensions.get('screen');

const smallPlanet = 300;
const bigPlanet = 900;
const ratio = bigPlanet / smallPlanet;
const dotSize = 14;
const rotation = '60deg';

const numberOfLocations = 10;
const timings = [...Array(numberOfLocations).keys()].map(() => Math.round(Math.random() * 80) + 10);
const coordinates = [...Array(numberOfLocations).keys()].map(() => {
  const angle = Math.random() * 2 * Math.PI;
  const maxRadius = smallPlanet / 2 - dotSize * 2;
  const radius = maxRadius * Math.sqrt(Math.random());

  // Cartesian coodinates.
  return {
    x: radius * Math.cos(angle) + smallPlanet / 2,
    y: radius * Math.sin(angle) + smallPlanet / 2
  };
});

const myCustomTransition = transitionInfo => {
  const { progress, start, end } = transitionInfo;
  const opacity = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [1, 1, 0, 0]
  });
  const translateX = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [0, 0, 100, 100]
  });

  return { opacity, transform: [{ translateX }] };
};

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const Screen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Animatable.View
        useNativeDriver
        animation="fadeInUp"
        delay={500}
        duration={1500}
        style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}
      >
        <Transition shared="marsPlanet">
          <Image source={require('./assets/mars_planet.png')} style={styles.marsPlanetScreen1} />
        </Transition>
      </Animatable.View>
      <Transition delay appear="left" disappear={myCustomTransition}>
        <TouchableOpacity onPress={() => navigation.navigate('Screen2')} style={{ position: 'absolute', bottom: 70 }}>
          <Ionicons name="ios-arrow-round-forward" size={72} color="#fff" />
        </TouchableOpacity>
      </Transition>
    </View>
  );
};

const Screen2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={{ position: 'relative' }}>
        <Transition shared="marsPlanet">
          <Image source={require('./assets/mars_planet.png')} style={styles.marsPlanetScreen2} onLayout={e => {}} />
        </Transition>

        {coordinates.map(({ x, y }, i) => {
          return (
            <TouchableWithoutFeedback
              onPress={() => navigation.navigate('Screen3', { coordinates: { x, y } })}
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
              style={{ position: 'absolute' }}
              key={i}
            >
              <Animatable.View
                useNativeDriver
                animation="fadeIn"
                duration={1000}
                delay={1000 + i * 150}
                style={[
                  styles.dotStyle,
                  {
                    transform: [
                      {
                        translateX: x - dotSize / 2
                      },
                      {
                        translateY: y - dotSize / 2
                      }
                    ]
                  }
                ]}
              />
            </TouchableWithoutFeedback>
          );
        })}
      </View>
      <View style={styles.headerNavigation}>
        <Transition delay appear="left" disappear={myCustomTransition}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Screen1');
            }}
          >
            <Ionicons name="ios-arrow-round-back" size={52} color="white" />
          </TouchableOpacity>
        </Transition>
      </View>
      <ScrollView horizontal style={styles.timingScrollViewContainer}>
        {timings.map((time, i) => {
          return (
            <Animatable.View
              useNativeDriver
              animation="fadeInRight"
              duration={600}
              delay={2000 + i * 150}
              key={i}
              style={styles.timingBox}
            >
              <Text style={styles.timingBoxText}>{time}m</Text>
            </Animatable.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const Screen3 = ({ navigation }) => {
  const { x, y } = navigation.state.params.coordinates;
  return (
    <View style={styles.container}>
      <View
        style={{
          position: 'relative',
          transform: [{ translateX: -x * ratio + bigPlanet / 2 }, { translateY: -y * ratio + bigPlanet / 2 }]
        }}
      >
        <Transition shared="marsPlanet">
          <Image source={require('./assets/mars_planet.png')} style={styles.marsPlanetScreen3} />
        </Transition>
      </View>
      <Animatable.View
        useNativeDriver
        animation="fadeIn"
        delay={1000}
        duration={500}
        style={[
          styles.dotStyle,
          {
            left: (width - dotSize) / 2,
            top: (height - dotSize) / 2
          }
        ]}
      />
      <View style={styles.headerNavigation}>
        <Transition delay appear="left" disappear={myCustomTransition}>
          <TouchableOpacity onPress={() => navigation.navigate('Screen2')}>
            <Ionicons name="ios-arrow-round-back" size={52} color="white" />
          </TouchableOpacity>
        </Transition>
      </View>
    </View>
  );
};

const AppContainer = createAppContainer(
  createFluidNavigator(
    {
      Screen1: {
        screen: Screen1
      },
      Screen2: {
        screen: Screen2
      },
      Screen3: {
        screen: Screen3
      }
    },
    {
      headerMode: 'none',
      initialRouteName: 'Screen1'
    }
  )
);

export default class App extends React.Component {
  state = {
    isReady: false
  };

  async _loadAssetsAsync() {
    const imageAssets = cacheImages([require('./assets/mars_planet.png')]);

    await Promise.all([...imageAssets]);
  }

  componentWillMount() {
    StatusBar.setHidden(true);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <AppContainer />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000'
  },
  marsPlanetScreen1: {
    width: height,
    height: height,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: -height
  },
  marsPlanetScreen2: {
    width: smallPlanet,
    height: smallPlanet,
    resizeMode: 'contain',
    transform: [
      {
        rotate: rotation
      }
    ]
  },
  marsPlanetScreen3: {
    resizeMode: 'contain',
    width: bigPlanet,
    height: bigPlanet,
    transform: [{ rotate: rotation }]
  },
  headerNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 20
  },

  timingScrollViewContainer: { position: 'absolute', bottom: 0, left: 0 },
  timingBox: {
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    padding: 10,
    height: 120,
    width: 110,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  timingBoxText: {
    fontSize: 24,
    color: 'white',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontWeight: 'bold'
  },
  dotStyle: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize,
    backgroundColor: '#fff',
    position: 'absolute'
  }
});
