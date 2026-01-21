
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedHelloProps {
  color: string;
  secondaryColor: string;
}

export default function AnimatedHello({ color, secondaryColor }: AnimatedHelloProps) {
  // Butterfly wing animation values
  const leftWingRotation = useSharedValue(0);
  const rightWingRotation = useSharedValue(0);
  const butterflyOpacity = useSharedValue(1);
  const butterflyScale = useSharedValue(1);
  const butterflyTranslateY = useSharedValue(0);

  // Text animation values
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    console.log('AnimatedHello: Starting Eluminate butterfly animation');
    
    // Butterfly wings unfold animation (800ms)
    leftWingRotation.value = withSequence(
      withTiming(-90, { duration: 400 }),
      withSpring(-60, { damping: 10, stiffness: 100 })
    );
    
    rightWingRotation.value = withSequence(
      withTiming(90, { duration: 400 }),
      withSpring(60, { damping: 10, stiffness: 100 })
    );

    // Butterfly settles and moves to position above the "i" (1000ms delay)
    butterflyScale.value = withDelay(
      800,
      withTiming(0.6, { duration: 400 })
    );

    butterflyTranslateY.value = withDelay(
      800,
      withTiming(-20, { duration: 400 })
    );

    // Text fades in as butterfly settles (1200ms delay)
    textOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 600 })
    );

    textScale.value = withDelay(
      1200,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Subtitle appears last (1800ms delay)
    subtitleOpacity.value = withDelay(
      1800,
      withTiming(1, { duration: 600 })
    );
  }, []);

  // Butterfly wing animated styles
  const leftWingStyle = useAnimatedStyle(() => ({
    opacity: butterflyOpacity.value,
    transform: [
      { rotateY: `${leftWingRotation.value}deg` },
    ],
  }));

  const rightWingStyle = useAnimatedStyle(() => ({
    opacity: butterflyOpacity.value,
    transform: [
      { rotateY: `${rightWingRotation.value}deg` },
    ],
  }));

  const butterflyContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: butterflyScale.value },
      { translateY: butterflyTranslateY.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Eluminate text with butterfly on the "i" */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.textContainer, textStyle]}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color }]}>Elum</Text>
            
            {/* Butterfly positioned above the "i" */}
            <View style={styles.iContainer}>
              <Animated.View style={[styles.butterflyContainer, butterflyContainerStyle]}>
                <Animated.View style={[styles.wing, styles.leftWing, { backgroundColor: color }, leftWingStyle]} />
                <View style={[styles.butterflyBody, { backgroundColor: color }]} />
                <Animated.View style={[styles.wing, styles.rightWing, { backgroundColor: color }, rightWingStyle]} />
              </Animated.View>
              <Text style={[styles.nameText, { color }]}>i</Text>
            </View>
            
            <Text style={[styles.nameText, { color }]}>nate</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.Text style={[styles.subtitle, { color: secondaryColor }, subtitleStyle]}>
        Illuminate your wellness journey
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  iContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  butterflyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    position: 'absolute',
    top: -35,
  },
  wing: {
    width: 20,
    height: 28,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leftWing: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    marginRight: 2,
  },
  rightWing: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    marginLeft: 2,
  },
  butterflyBody: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
  },
});
