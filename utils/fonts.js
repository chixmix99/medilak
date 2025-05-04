// Font mapping for the app
export const FONTS = {
  light: 'Nunito-Light',
  regular: 'Nunito-Regular',
  medium: 'Nunito-Medium',
  semiBold: 'Nunito-SemiBold',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
  black: 'Nunito-Black',
  // Italic versions
  lightItalic: 'Nunito-LightItalic',
  italic: 'Nunito-Italic',
  mediumItalic: 'Nunito-MediumItalic',
  semiBoldItalic: 'Nunito-SemiBoldItalic',
  boldItalic: 'Nunito-BoldItalic',
  extraBoldItalic: 'Nunito-ExtraBoldItalic',
  blackItalic: 'Nunito-BlackItalic',
};

// Font mapping for text variants
export const FONT_STYLES = {
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
  },
  subtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  button: {
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  caption: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  small: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
};

// Font load configuration for Expo
export const FONT_ASSETS = {
  'Nunito-Light': require('../assets/Nunito/static/Nunito-Light.ttf'),
  'Nunito-Regular': require('../assets/Nunito/static/Nunito-Regular.ttf'),
  'Nunito-Medium': require('../assets/Nunito/static/Nunito-Medium.ttf'),
  'Nunito-SemiBold': require('../assets/Nunito/static/Nunito-SemiBold.ttf'),
  'Nunito-Bold': require('../assets/Nunito/static/Nunito-Bold.ttf'),
  'Nunito-ExtraBold': require('../assets/Nunito/static/Nunito-ExtraBold.ttf'),
  'Nunito-Black': require('../assets/Nunito/static/Nunito-Black.ttf'),
  'Nunito-LightItalic': require('../assets/Nunito/static/Nunito-LightItalic.ttf'),
  'Nunito-Italic': require('../assets/Nunito/static/Nunito-Italic.ttf'),
  'Nunito-MediumItalic': require('../assets/Nunito/static/Nunito-MediumItalic.ttf'),
  'Nunito-SemiBoldItalic': require('../assets/Nunito/static/Nunito-SemiBoldItalic.ttf'),
  'Nunito-BoldItalic': require('../assets/Nunito/static/Nunito-BoldItalic.ttf'),
  'Nunito-ExtraBoldItalic': require('../assets/Nunito/static/Nunito-ExtraBoldItalic.ttf'),
  'Nunito-BlackItalic': require('../assets/Nunito/static/Nunito-BlackItalic.ttf'),
}; 